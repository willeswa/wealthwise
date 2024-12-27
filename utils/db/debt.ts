import { Debt, DebtInput, DebtSummary, DebtRepayment, DebtRepaymentInput } from '../types/debt';
import { getIncomes } from './income';
import { getDatabase } from './utils/setup';

export const addDebt = async (debt: DebtInput): Promise<number> => {
  const db = getDatabase();
  
  try {
    const result = await db.runAsync(
      `INSERT INTO debts (
        creditor, total_amount, remaining_amount, interest_rate, 
        currency, start_date, expected_end_date, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        debt.creditor,
        debt.total_amount,
        debt.total_amount, // Initially, remaining_amount equals total_amount
        debt.interest_rate,
        debt.currency,
        debt.start_date,
        debt.expected_end_date,
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

export const getDebts = async (): Promise<Debt[]> => {
  const db = getDatabase();
  return await db.getAllAsync<Debt>('SELECT * FROM debts ORDER BY expected_end_date ASC');
};

export const getDebtRepayments = async (debtId: number): Promise<DebtRepayment[]> => {
  const db = getDatabase();
  return await db.getAllAsync<DebtRepayment>(
    'SELECT * FROM debt_repayments WHERE debt_id = ? ORDER BY repayment_date DESC',
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

    // Get the latest repayment for each debt
    const upcomingRepayment = await db.getFirstAsync<{
      debt: Debt;
      repayment: DebtRepayment;
    }>(`
      SELECT d.*, r.*
      FROM debts d
      LEFT JOIN debt_repayments r ON d.id = r.debt_id
      WHERE r.repayment_date >= date('now')
      ORDER BY r.repayment_date ASC
      LIMIT 1
    `);

    // Calculate monthly repayment total
    const monthlyRepayments = await db.getAllAsync<{ total: number }>(`
      SELECT SUM(amount) as total
      FROM debt_repayments
      WHERE frequency = 'Monthly'
      AND repayment_date >= date('now', 'start of month')
      AND repayment_date < date('now', 'start of month', '+1 month')
    `);
    const monthlyRepaymentTotal = monthlyRepayments[0]?.total || 0;

    return {
      totalOutstanding: debts.reduce((sum, d) => sum + d.remaining_amount, 0),
      activeDebts: debts.length,
      highestInterestDebt: debts.reduce((max, debt) => 
        !max || debt.interest_rate > max.interest_rate ? debt : max, null),
      upcomingRepayment: upcomingRepayment || null,
      debtToIncomeRatio: monthlyIncome > 0 
        ? (monthlyRepaymentTotal / monthlyIncome) * 100 
        : 0,
      monthlyRepaymentTotal,
      debts,
      chartData: {
        barData: debts.map(debt => ({
          value: debt.remaining_amount,
          label: debt.creditor,
          frontColor: '#4B7BE5',
        })),
        lineData: debts.map(debt => ({
          value: debt.interest_rate,
          dataPointText: `${debt.interest_rate}%`,
          label: debt.creditor,
        })),
      },
    };
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
