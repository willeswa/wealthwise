import { BudgetCategory, BudgetSummary } from '../types/budget';
import { getDatabase } from './setup';
import { getIncomes } from './income';
import { Expense } from '../types/expense';

// Helper to determine category type
const getCategoryType = (category: string): 'want' | 'need' | 'savings' => {
  // You can customize this mapping based on your needs
  const categoryMap: Record<string, 'want' | 'need' | 'savings'> = {
    'Food': 'need',
    'Transport': 'need',
    'Bills': 'need',
    'Rent': 'need',
    'Education': 'need',
    'Healthcare': 'need',
    'Entertainment': 'want',
    'Shopping': 'want',
    'Travel': 'want',
    'Investment': 'savings',
    'Emergency Fund': 'savings',
    'Retirement': 'savings'
  };

  return categoryMap[category] || 'want'; // Default to 'want' if category not found
};

export const getBudgetSummary = async (): Promise<BudgetSummary> => {
  const db = getDatabase();
  
  try {
    // Get all incomes and expenses
    const [incomes, expenses] = await Promise.all([
      getIncomes(),
      db.getAllAsync<Expense>('SELECT * FROM expenses')
    ]);

    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Group expenses by category and calculate totals
    const categoryGroups = expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = {
          spent: 0,
          type: getCategoryType(expense.category)
        };
      }
      acc[expense.category].spent += expense.amount;
      return acc;
    }, {} as Record<string, { spent: number; type: 'want' | 'need' | 'savings' }>);

    // Transform into categories array
    const categories = Object.entries(categoryGroups).map(([name, data]) => ({
      name,
      allocated: data.spent, // Using spent amount as allocated since we don't have preset budgets
      spent: data.spent,
      percentage: (data.spent / totalExpenses) * 100,
      type: data.type
    }));

    // Calculate distribution
    const distribution = categories.reduce((acc, category) => {
      acc[`${category.type}s`] += category.allocated;
      return acc;
    }, { wants: 0, needs: 0, savings: 0 });

    return {
      totalIncome,
      totalExpenses,
      unallocatedAmount: totalIncome - totalExpenses,
      categories: categories.sort((a, b) => b.spent - a.spent), // Sort by spent amount
      distribution
    };
  } catch (error) {
    console.error('Error getting budget summary:', error);
    throw error;
  }
};

export const addBudgetCategory = async (category: Omit<BudgetCategory, 'id' | 'created_at'>): Promise<number> => {
  const db = getDatabase();
  try {
    const result = await db.runAsync(
      'INSERT INTO budget_categories (name, allocated, type) VALUES (?, ?, ?)',
      [category.name, category.allocated, category.type]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error adding budget category:', error);
    throw error;
  }
};

export const updateBudgetCategory = async (id: number, updates: Partial<BudgetCategory>): Promise<void> => {
  const db = getDatabase();
  const validUpdates = ['name', 'allocated', 'type'];
  const updateEntries = Object.entries(updates).filter(([key]) => validUpdates.includes(key));
  
  if (updateEntries.length === 0) return;

  try {
    const setClause = updateEntries.map(([key]) => `${key} = ?`).join(', ');
    const values = [...updateEntries.map(([, value]) => value), id];
    
    await db.runAsync(
      `UPDATE budget_categories SET ${setClause} WHERE id = ?`,
      values
    );
  } catch (error) {
    console.error('Error updating budget category:', error);
    throw error;
  }
};
