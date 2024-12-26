import { Debt, DebtInput, DebtSummary } from '../types/debt';
import { getIncomes } from './income';
import { getDatabase } from './utils/setup';

export const addDebt = async (debt: DebtInput): Promise<number> => {
  const db = getDatabase();
  
  // Convert empty string to null for amount
  const amount = debt.amount ? debt.amount : null;
  
  const result = await db.runAsync(
    `INSERT INTO debts (creditor, amount, interest_rate, currency, start_date, 
      due_date, frequency, payment_amount, notes) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [debt.creditor, amount, debt.interest_rate, debt.currency, 
     debt.startDate ?? null, debt.dueDate ?? null, debt.frequency, debt.payment_amount, debt.notes ?? null]
  );
  return result.lastInsertRowId;
};

export const getDebts = async (): Promise<Debt[]> => {
  const db = getDatabase();
  return await db.getAllAsync<Debt>('SELECT * FROM debts ORDER BY due_date ASC');
};

export const getDebtSummary = async (): Promise<DebtSummary> => {
  const db = getDatabase();
  const debts = await getDebts();
  const incomes = await getIncomes();

  const monthlyIncome = incomes
    .filter(i => i.frequency === 'monthly')
    .reduce((sum, i) => sum + i.amount, 0);

  const monthlyPaymentTotal = debts
    .filter(d => d.frequency === 'monthly')
    .reduce((sum, d) => sum + d.payment_amount, 0);

  const debtToIncomeRatio = monthlyIncome > 0 
    ? (monthlyPaymentTotal / monthlyIncome) * 100 
    : 0;

    console.log(monthlyIncome, monthlyPaymentTotal, debtToIncomeRatio);

  const highestInterestDebt = debts.reduce<Debt | null>((max, debt) => 
    !max || debt.interest_rate > max.interest_rate ? debt : max, null);

  const upcomingPayment = debts
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .find(d => new Date(d.dueDate) >= new Date());

  return {
    totalOutstanding: debts.reduce((sum, d) => sum + (d.payment_amount || 0), 0),
    activeDebts: debts.length,
    highestInterestDebt,
    upcomingPayment: upcomingPayment ? {
      debt: upcomingPayment,
      dueDate: upcomingPayment.dueDate,
      amount: upcomingPayment.payment_amount
    } : null,
    debtToIncomeRatio,
    monthlyPaymentTotal,
    debts,
    chartData: {
      barData: debts.map(debt => ({
        value: debt.amount ?? 0,
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
};
