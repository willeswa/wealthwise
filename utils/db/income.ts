import { Income, IncomeInput } from '../types/income';
import { getDatabase } from './setup';

export const addIncome = async (income: IncomeInput): Promise<number> => {
  try {
    const db = getDatabase();
    const result = await db.runAsync(
      'INSERT INTO income (amount, currency, category, frequency, date) VALUES (?, ?, ?, ?, ?)',
      [income.amount, income.currency, income.category, income.frequency, income.date]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error adding income:', error);
    throw error;
  }
};

export const getIncomes = async (): Promise<Income[]> => {
  try {
    const db = getDatabase();
    return await db.getAllAsync<Income>('SELECT * FROM income ORDER BY date DESC');
  } catch (error) {
    console.error('Error getting incomes:', error);
    throw error;
  }
};

export const getIncomeById = async (id: number): Promise<Income | null> => {
  try {
    const db = getDatabase();
    return await db.getFirstAsync<Income>('SELECT * FROM income WHERE id = ?', id);
  } catch (error) {
    console.error('Error getting income:', error);
    throw error;
  }
};

export const deleteIncome = async (id: number): Promise<void> => {
  try {
    const db = getDatabase();
    await db.runAsync('DELETE FROM income WHERE id = ?', id);
  } catch (error) {
    console.error('Error deleting income:', error);
    throw error;
  }
};
