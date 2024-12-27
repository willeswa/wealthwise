import { Expense, ExpenseInput, ExpenseCategory, ExpenseStatus } from '../types/expense';
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

    // Only handle investment contributions immediately
    if (expense.linked_item_type === 'investment') {
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

const handleDebtRepayment = async (
  db: any,
  expense: Expense,
  status: ExpenseStatus,
  paidDate?: string
): Promise<void> => {
  if (!expense.linked_item_id || expense.linked_item_type !== 'debt') return;

  const month = (expense.due_date || expense.date).substring(0, 7);

  try {
    // Remove existing repayment linked to this expense
    await db.runAsync(
      `DELETE FROM debt_repayments 
       WHERE expense_id = ?`,
      [expense.id]
    );

    // Remove existing payment status
    await db.runAsync(
      `DELETE FROM debt_payment_status 
       WHERE debt_id = ? 
       AND month = ?`,
      [expense.linked_item_id, month]
    );

    if (status === 'paid') {
      // Add new repayment record with expense_id
      await db.runAsync(
        `INSERT INTO debt_repayments (
          debt_id, expense_id, amount, repayment_date, frequency, notes
        ) VALUES (?, ?, ?, ?, 'One-time', ?)`,
        [
          expense.linked_item_id,
          expense.id,
          expense.amount,
          paidDate || expense.date,
          `Repayment from expense ${expense.id}`
        ]
      );

      // Add new payment status for paid
      await db.runAsync(
        `INSERT INTO debt_payment_status 
         (debt_id, month, status, penalty_rate) 
         VALUES (?, ?, 'paid', 0)`,
        [expense.linked_item_id, month]
      );
    } else if (status === 'missed') {
      // Only add payment status for missed payments
      await db.runAsync(
        `INSERT INTO debt_payment_status 
         (debt_id, month, status, penalty_rate) 
         VALUES (?, ?, 'missed', 0)`,
        [expense.linked_item_id, month]
      );
    }
  } catch (error) {
    console.error('Error handling debt repayment:', error);
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

export const updateExpenseStatus = async (
  id: number, 
  status: ExpenseStatus,
  paidDate?: string
): Promise<void> => {
  const db = getDatabase();
  
  try {
    // Get expense first outside transaction
    const expense = await getExpenseById(id);
    if (!expense) throw new Error('Expense not found');

    // Start transaction
    await db.execAsync('BEGIN TRANSACTION;');

    try {
      // Update expense status
      await db.runAsync(
        `UPDATE expenses 
         SET status = ?, paid_date = ? 
         WHERE id = ?`,
        [status, paidDate || null, id]
      );

      // Handle debt repayment if this is a debt-linked expense
      if (expense.linked_item_type === 'debt') {
        await handleDebtRepayment(db, expense, status, paidDate);
      }

      // Commit transaction
      await db.execAsync('COMMIT;');
    } catch (error) {
      // Rollback transaction on error
      await db.execAsync('ROLLBACK;');
      throw error;
    }
  } catch (error) {
    console.error('Error updating expense status:', error);
    throw error;
  }
};

export const getUnpaidExpenses = async (month: string): Promise<Expense[]> => {
  const db = getDatabase();
  return await db.getAllAsync<Expense>(
    `SELECT * FROM expenses 
     WHERE strftime('%Y-%m', due_date) = ? 
     AND status = 'pending'`,
    [month]
  );
};
