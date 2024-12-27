import { Expense, ExpenseInput, ExpenseCategory } from '../types/expense';
import { getDatabase } from './utils/setup';

export const getExpenseCategories = async (): Promise<ExpenseCategory[]> => {
  const db = getDatabase();
  return await db.getAllAsync<ExpenseCategory>(
    'SELECT * FROM expense_categories ORDER BY name ASC'
  );
};

export const addExpense = async (expense: ExpenseInput): Promise<number> => {
  try {
    const db = getDatabase();
    const result = await db.runAsync(
      `INSERT INTO expenses (
        name, amount, currency, category_id, linked_item_id, 
        linked_item_type, comment, date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        expense.name,
        expense.amount,
        expense.currency,
        expense.category_id,
        expense.linked_item_id || null,
        expense.linked_item_type || null,
        expense.comment || null,
        expense.date
      ]
    );

    // If this is a debt repayment or investment contribution, trigger the appropriate update
    if (expense.linked_item_type === 'debt') {
      await db.runAsync(
        `INSERT INTO debt_repayments (
          debt_id, amount, repayment_date, frequency, notes
        ) VALUES (?, ?, ?, 'One-time', ?)`,
        [expense.linked_item_id || 0, expense.amount, expense.date, expense.comment || '']
      );
    } else if (expense.linked_item_type === 'investment') {
      await db.runAsync(
        `INSERT INTO contributions (
          investment_id, amount, contribution_date, frequency, notes
        ) VALUES (?, ?, ?, 'One-time', ?)`,
        [expense.linked_item_id || 0, expense.amount, expense.date, expense.comment || '']
      );
    }

    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error;
  }
};

export const getExpenses = async (): Promise<Expense[]> => {
  try {
    const db = getDatabase();
    return await db.getAllAsync<Expense>(`
      SELECT e.*, ec.name as category_name, ec.type as category_type, 
             ec.icon as category_icon 
      FROM expenses e
      JOIN expense_categories ec ON e.category_id = ec.id
      ORDER BY e.date DESC
    `);
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
