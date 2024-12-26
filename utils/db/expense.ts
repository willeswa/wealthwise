import { Expense, ExpenseInput } from '../types/expense';
import { getDatabase } from './utils/setup';

export const addExpense = async (expense: ExpenseInput): Promise<number> => {
  try {
    const db = getDatabase();
    const result = await db.runAsync(
      'INSERT INTO expenses (amount, currency, category, comment, date) VALUES (?, ?, ?, ?, ?)',
      [expense.amount, expense.currency, expense.category, expense.comment || null, expense.date]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error;
  }
};

export const getExpenses = async (): Promise<Expense[]> => {
  try {
    const db = getDatabase();
    return await db.getAllAsync<Expense>('SELECT * FROM expenses ORDER BY date DESC');
  } catch (error) {
    console.error('Error getting expenses:', error);
    throw error;
  }
};

export const getExpenseById = async (id: number): Promise<Expense | null> => {
  try {
    const db = getDatabase();
    return await db.getFirstAsync<Expense>('SELECT * FROM expenses WHERE id = ?', id);
  } catch (error) {
    console.error('Error getting expense:', error);
    throw error;
  }
};

export const deleteExpense = async (id: number): Promise<void> => {
  try {
    const db = getDatabase();
    await db.runAsync('DELETE FROM expenses WHERE id = ?', id);
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};
