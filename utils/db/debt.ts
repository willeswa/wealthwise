import { calculatePaymentSchedule, calculatePenaltyRate, calculateTotalPenalties } from '../calculations/debt';
import { Debt, DebtInput, DebtSummary, DebtRepayment, DebtRepaymentInput, DebtPaymentStatus, RepaymentFrequency } from '../types/debt';
import { getIncomes } from './income';
import { getDatabase } from './utils/setup';

export const addDebt = async (debt: DebtInput): Promise<number> => {
  const db = getDatabase();
  
  try {
    const result = await db.runAsync(
      `INSERT INTO debts (
        creditor, total_amount, remaining_amount, interest_rate, 
        currency, start_date, expected_end_date, frequency,
        repayment_period, period_unit, manual_end_date, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        debt.creditor,
        debt.total_amount,
        debt.total_amount, // Initially, remaining_amount equals total_amount
        debt.interest_rate,
        debt.currency,
        debt.start_date,
        debt.expected_end_date,
        debt.frequency,
        debt.repayment_period || null,
        debt.period_unit || null,
        debt.manual_end_date ? 1 : 0,
        debt.notes ?? null
      ]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error adding debt:', error);
    throw error;
  }
};

export const addDebtRepayment = async (repayment: DebtRepaymentInput): Promise<number> => {
  const db = getDatabase();
  
  try {
    const result = await db.runAsync(
      `INSERT INTO debt_repayments (
        debt_id, amount, repayment_date, frequency, notes
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        repayment.debt_id,
        repayment.amount,
        repayment.repayment_date,
        repayment.frequency,
        repayment.notes ?? null
      ]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error adding debt repayment:', error);
    throw error;
  }
};

const calculateOutstandingAmount = async (db: any, debtId: number): Promise<number> => {
  const result = await db.getFirstAsync(
    `SELECT 
      d.total_amount,
      COALESCE(
        (SELECT SUM(amount) 
         FROM debt_repayments 
         WHERE debt_id = d.id
        ), 
        0
      ) as total_paid
     FROM debts d
     WHERE d.id = ?`,
    [debtId]
  ) as { total_amount: number, total_paid: number } | undefined;
  
  return result ? result.total_amount - result.total_paid : 0;
};

export const getDebtWithRepayments = async (debtId: number): Promise<Debt & { repayments: DebtRepayment[] }> => {
  const db = getDatabase();
  const debt = await db.getFirstAsync<Debt>('SELECT * FROM debts WHERE id = ?', [debtId]);
  if (!debt) throw new Error('Debt not found');

  const repayments = await db.getAllAsync<DebtRepayment>(
    'SELECT * FROM debt_repayments WHERE debt_id = ? ORDER BY repayment_date DESC',
    [debtId]
  );

  const remaining_amount = await calculateOutstandingAmount(db, debtId);

  return {
    ...debt,
    remaining_amount,
    repayments
  };
};

export const getDebts = async (): Promise<Debt[]> => {
  const db = getDatabase();
  const debts = await db.getAllAsync<Debt & { total_paid: number }>(`
    SELECT d.*, 
           COALESCE(
             (SELECT SUM(dr.amount) 
              FROM debt_repayments dr 
              WHERE dr.debt_id = d.id
             ), 
             0
           ) as total_paid
    FROM debts d
    ORDER BY d.expected_end_date ASC
  `);
  
  // Calculate remaining amount based on sum of individual repayments
  return debts.map(debt => ({
    ...debt,
    remaining_amount: debt.total_amount - (debt.total_paid || 0)
  }));
};

export const getDebtRepayments = async (debtId: number): Promise<DebtRepayment[]> => {
  const db = getDatabase();
  return await db.getAllAsync<DebtRepayment>(`
    SELECT dr.*, e.name as expense_name
    FROM debt_repayments dr
    LEFT JOIN expenses e ON dr.expense_id = e.id
    WHERE dr.debt_id = ? 
    ORDER BY dr.repayment_date DESC`,
    [debtId]
  );
};

export const getDebtPaymentStatus = async (debtId: number): Promise<DebtPaymentStatus[]> => {
  const db = getDatabase();
  return await db.getAllAsync<DebtPaymentStatus>(
    'SELECT * FROM debt_payment_status WHERE debt_id = ? ORDER BY month DESC',
    [debtId]
  );
};

export const getDebtSummary = async (): Promise<DebtSummary> => {
  const db = getDatabase();
  
  try {
    const debts = await getDebts();
    const incomes = await getIncomes();

    // Calculate monthly income
    const monthlyIncome = incomes
      .filter(i => i.frequency === 'monthly')
      .reduce((sum, i) => sum + i.amount, 0);

    // Calculate payment schedules for each debt
    const debtsWithSchedules = debts.map(debt => {
      const schedule = calculatePaymentSchedule(debt);
      return {
        ...debt,
        monthlyPayment: schedule.paymentAmount,
        nextPaymentDate: schedule.nextPaymentDate,
        nextPaymentAmount: schedule.nextPaymentAmount
      };
    });

    // Calculate monthly repayment total using the calculated schedules
    const monthlyRepaymentTotal = debtsWithSchedules.reduce((total, debt) => {
      return total + (debt.monthlyPayment || 0);
    }, 0);

    // Find next upcoming repayment from calculated schedules
    const upcomingRepayment = debtsWithSchedules
      .filter(debt => debt.remaining_amount > 0)
      .sort((a, b) => a.nextPaymentDate.getTime() - b.nextPaymentDate.getTime())[0];

    const summary: DebtSummary = {
      totalOutstanding: debts.reduce((sum, d) => sum + d.remaining_amount, 0),
      activeDebts: debts.length,
      highestInterestDebt: debts.reduce((max: Debt | null, debt) => 
        !max || debt.interest_rate > max.interest_rate ? debt : max, null),
      upcomingRepayment: upcomingRepayment ? {
        debt: upcomingRepayment,
        repayment: {
          debt_id: upcomingRepayment.id!,
          amount: upcomingRepayment.nextPaymentAmount,
          repayment_date: upcomingRepayment.nextPaymentDate.toISOString(),
          frequency: upcomingRepayment.frequency
        }
      } : null,
      debtToIncomeRatio: monthlyIncome > 0 
        ? (monthlyRepaymentTotal / monthlyIncome) * 100 
        : 0,
      monthlyRepaymentTotal,
      debts: debtsWithSchedules,
      chartData: {
        barData: debtsWithSchedules.map(debt => ({
          value: debt.remaining_amount,
          label: debt.creditor,
          frontColor: '#4B7BE5',
        })),
        lineData: debtsWithSchedules.map(debt => ({
          value: debt.interest_rate,
          dataPointText: `${debt.interest_rate}%`,
          label: debt.creditor,
        })),
      },
      // Get payment history and penalties
      missedPayments: 0, // Will be calculated below
      totalPenalties: 0, // Will be calculated below
      paymentHistory: [] // Will be populated below
    };

    // Get payment history and calculate penalties
    const paymentHistory = await Promise.all(
      summary.debts.map(async (debt) => {
        const status = await getDebtPaymentStatus(debt.id!);
        const consecutiveMissed = status.reduce((acc, curr) => {
          if (curr.status === 'missed') return acc + 1;
          return 0;
        }, 0);
        
        const penaltyRate = calculatePenaltyRate(debt.interest_rate, consecutiveMissed);
        
        return status.map(s => ({
          month: s.month,
          status: s.status,
          originalAmount: debt.total_amount || 0,
          penaltyAmount: s.status === 'missed' ? calculateTotalPenalties(
            debt.remaining_amount,
            debt.interest_rate,
            penaltyRate,
            1
          ) : 0
        }));
      })
    );

    const flattenedHistory = paymentHistory.flat();
    summary.paymentHistory = flattenedHistory.sort((a, b) => b.month.localeCompare(a.month));
    summary.missedPayments = flattenedHistory.filter(p => p.status === 'missed').length;
    summary.totalPenalties = flattenedHistory.reduce((sum, p) => sum + p.penaltyAmount, 0);

    return summary;
  } catch (error) {
    console.error('Error getting debt summary:', error);
    throw error;
  }
};

export const updateDebtAmount = async (id: number, newAmount: number): Promise<void> => {
  const db = getDatabase();
  await db.runAsync(
    'UPDATE debts SET remaining_amount = ? WHERE id = ?',
    [newAmount, id]
  );
};

export const deleteDebt = async (id: number): Promise<void> => {
  const db = getDatabase();
  await db.runAsync('DELETE FROM debts WHERE id = ?', [id]);
};

export const markDebtAsPaidOff = async (debtId: number): Promise<void> => {
  const db = getDatabase();
  
  try {
    await db.execAsync('BEGIN TRANSACTION;');

    try {
      // Get the debt first
      const debt = await db.getFirstAsync<Debt>(
        'SELECT * FROM debts WHERE id = ?',
        [debtId]
      );
      
      if (!debt) throw new Error('Debt not found');

      // Add final repayment for remaining amount
      await db.runAsync(
        `INSERT INTO debt_repayments (
          debt_id, amount, repayment_date, frequency, notes
        ) VALUES (?, ?, date('now'), 'One-time', ?)`,
        [debtId, debt.remaining_amount, 'Final payment - Marked as paid off']
      );

      // Mark all pending expenses for this debt as paid
      await db.runAsync(
        `UPDATE expenses 
         SET status = 'paid', paid_date = date('now')
         WHERE linked_item_type = 'debt' 
         AND linked_item_id = ? 
         AND status = 'pending'`,
        [debtId]
      );

      // Update debt_payment_status for current month
      const currentMonth = new Date().toISOString().substring(0, 7);
      await db.runAsync(
        `INSERT OR REPLACE INTO debt_payment_status 
         (debt_id, month, status, penalty_rate) 
         VALUES (?, ?, 'paid', 0)`,
        [debtId, currentMonth]
      );

      await db.execAsync('COMMIT;');
    } catch (error) {
      await db.execAsync('ROLLBACK;');
      throw error;
    }
  } catch (error) {
    console.error('Error marking debt as paid off:', error);
    throw error;
  }
};

export const deleteDebtWithRelated = async (debtId: number): Promise<void> => {
  const db = getDatabase();
  
  try {
    await db.execAsync('BEGIN TRANSACTION;');

    try {
      // Delete related expenses
      await db.runAsync(
        `DELETE FROM expenses 
         WHERE linked_item_type = 'debt' AND linked_item_id = ?`,
        [debtId]
      );

      // Delete related repayments (should cascade automatically)
      await db.runAsync(
        'DELETE FROM debt_repayments WHERE debt_id = ?',
        [debtId]
      );

      // Delete related payment status records (should cascade automatically)
      await db.runAsync(
        'DELETE FROM debt_payment_status WHERE debt_id = ?',
        [debtId]
      );

      // Finally delete the debt itself
      await db.runAsync('DELETE FROM debts WHERE id = ?', [debtId]);

      await db.execAsync('COMMIT;');
    } catch (error) {
      await db.execAsync('ROLLBACK;');
      throw error;
    }
  } catch (error) {
    console.error('Error deleting debt and related records:', error);
    throw error;
  }
};
