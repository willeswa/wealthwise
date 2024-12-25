import { Debt, DebtInput, DebtSummary } from '../types/debt';
import { getDatabase } from './setup';
import { getIncomes } from './income';

export const addDebt = async (debt: DebtInput): Promise<number> => {
  const db = getDatabase();
  const result = await db.runAsync(
    `INSERT INTO debts (creditor, amount, interest_rate, currency, start_date, 
      due_date, frequency, payment_amount, notes) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [debt.creditor, debt.amount, debt.interestRate, debt.currency, 
     debt.startDate ?? null, debt.dueDate ?? null, debt.frequency, debt.paymentAmount, debt.notes ?? null]
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
    .reduce((sum, d) => sum + d.paymentAmount, 0);

  const debtToIncomeRatio = monthlyIncome > 0 
    ? (monthlyPaymentTotal / monthlyIncome) * 100 
    : 0;

  const highestInterestDebt = debts.reduce<Debt | null>((max, debt) => 
    !max || debt.interestRate > max.interestRate ? debt : max, null);

  const upcomingPayment = debts
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .find(d => new Date(d.dueDate) >= new Date());

  return {
    totalOutstanding: debts.reduce((sum, d) => sum + d.amount, 0),
    activeDebts: debts.length,
    highestInterestDebt,
    upcomingPayment: upcomingPayment ? {
      debt: upcomingPayment,
      dueDate: upcomingPayment.dueDate,
      amount: upcomingPayment.paymentAmount
    } : null,
    debtToIncomeRatio,
    monthlyPaymentTotal,
    debts,
    chartData: {
      barData: debts.map(debt => ({
        value: debt.amount,
        label: debt.creditor,
        frontColor: '#4B7BE5',
      })),
      lineData: debts.map(debt => ({
        value: debt.interestRate,
        dataPointText: `${debt.interestRate}%`,
        label: debt.creditor,
      })),
    },
  };
};
