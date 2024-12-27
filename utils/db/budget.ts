import { calculatePaymentSchedule } from '../calculations/debt';
import { BudgetCategory, BudgetSummary } from '../types/budget';
import { Debt } from '../types/debt';
import { Expense, ExpenseCategory } from '../types/expense';
import { getIncomes } from './income';
import { getDatabase } from './utils/setup';
import { getDefaultCurrency } from './utils/settings';

// Helper to determine category type based on expense category type
const getCategoryType = (categoryType: string): 'want' | 'need' | 'savings' | 'debt' => {
  switch (categoryType) {
    case 'investment':
      return 'savings';
    case 'debt':
      return 'debt';
    case 'general':
    default:
      return 'need'; // Default general expenses as needs, can be customized
  }
};

// Function to generate colors for unknown categories
const getDefaultColor = (category: string): string => {
  // Generate a consistent color based on the category string
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 70%)`; // Using HSL for consistent lightness
};

// Add color mapping for categories
const categoryColors: Record<string, string> = {
  'Food': '#FF6B6B',
  'Transport': '#4ECDC4',
  'Bills': '#45B7D1',
  'Rent': '#FFB6C1',
  'Education': '#98FB98',
  'Healthcare': '#87CEEB',
  'Entertainment': '#DDA0DD',
  'Shopping': '#F0E68C',
  'Travel': '#E6E6FA',
  'Investment': '#98FB98',
  'Emergency Fund': '#FFA07A',
  'Retirement': '#87CEFA',
  'Debt': '#FF4040'  // Adding a red color for debt
};

export const getBudgetSummary = async (): Promise<BudgetSummary> => {
  const db = getDatabase();
  
  try {
    // Get default currency along with other data
    const [incomes, expenses, categories, defaultCurrency] = await Promise.all([
      getIncomes(),
      db.getAllAsync<Expense>(`
        SELECT e.*, ec.name as category_name, ec.type as category_type, ec.icon 
        FROM expenses e
        JOIN expense_categories ec ON e.category_id = ec.id
      `),
      db.getAllAsync<ExpenseCategory>('SELECT * FROM expense_categories'),
      getDefaultCurrency()
    ]);

    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Group expenses by category and calculate totals
    const categoryGroups = expenses.reduce((acc, expense) => {
      const categoryName = expense.category_name;
      if (!acc[categoryName]) {
        acc[categoryName] = {
          spent: 0,
          currency: expense.currency,
          type: getCategoryType(expense.linked_item_type || 'general')
        };
      }
      acc[categoryName].spent += expense.amount;
      return acc;
    }, {} as Record<string, { spent: number; currency: string; type: 'want' | 'need' | 'savings' | 'debt' }>);

    // Transform into categories array with proper mapping
    const budgetCategories = Object.entries(categoryGroups).map(([name, data]) => ({
      name,
      allocated: data.spent, // Using spent amount as allocated since we don't have preset budgets
      spent: data.spent,
      percentage: (data.spent / totalExpenses) * 100,
      type: data.type,
      currency: data.currency,
      color: categoryColors[name] || getDefaultColor(name)
    }));

    // Calculate distribution
    const distribution = budgetCategories.reduce((acc, category) => {
      const key = category.type as keyof typeof acc;
      acc[key] = (acc[key] || 0) + category.allocated;
      return acc;
    }, { wants: 0, needs: 0, savings: 0, debt: 0 });

    return {
      totalIncome,
      totalExpenses,
      unallocatedAmount: totalIncome - totalExpenses,
      categories: budgetCategories.sort((a, b) => b.spent - a.spent),
      distribution,
      currency: defaultCurrency
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

interface BudgetInsight {
  monthlyChange: number;
  highestIncrease: {
    category: string;
    percentage: number;
  };
  upcomingBills: number;
  savingsProgress: number;
}

export const calculateBudgetInsights = async (): Promise<BudgetInsight> => {
  const db = getDatabase();
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  try {
    // Calculate month-over-month change
    const [currentMonthTotal] = await db.getAllAsync<{ total: number }>(`
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM expenses 
      WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ?
    `, [currentMonth.toString().padStart(2, '0'), currentYear.toString()]);

    const [lastMonthTotal] = await db.getAllAsync<{ total: number }>(`
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM expenses 
      WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ?
    `, [(currentMonth - 1).toString().padStart(2, '0'), currentYear.toString()]);

    const monthlyChange = lastMonthTotal.total === 0 ? 0 : 
      ((currentMonthTotal.total - lastMonthTotal.total) / lastMonthTotal.total) * 100;

    // Calculate highest increase category
    const categoryChanges = await db.getAllAsync<{ category_name: string, change_percentage: number }>(`
      WITH CurrentMonth AS (
        SELECT ec.name as category_name, SUM(e.amount) as amount
        FROM expenses e
        JOIN expense_categories ec ON e.category_id = ec.id
        WHERE strftime('%m', e.date) = ? AND strftime('%Y', e.date) = ?
        GROUP BY ec.name
      ),
      LastMonth AS (
        SELECT ec.name as category_name, SUM(e.amount) as amount
        FROM expenses e
        JOIN expense_categories ec ON e.category_id = ec.id
        WHERE strftime('%m', e.date) = ? AND strftime('%Y', e.date) = ?
        GROUP BY ec.name
      )
      SELECT 
        cm.category_name,
        ((cm.amount - COALESCE(lm.amount, 0)) / COALESCE(lm.amount, 1) * 100) as change_percentage
      FROM CurrentMonth cm
      LEFT JOIN LastMonth lm ON cm.category_name = lm.category_name
      WHERE lm.amount > 0
      ORDER BY change_percentage DESC
      LIMIT 1
    `, [
      currentMonth.toString().padStart(2, '0'), 
      currentYear.toString(),
      (currentMonth - 1).toString().padStart(2, '0'), 
      currentYear.toString()
    ]);

    // Count upcoming bills
    const [upcomingBillsCount] = await db.getAllAsync<{ count: number }>(`
      SELECT COUNT(*) as count 
      FROM expenses e
      JOIN expense_categories ec ON e.category_id = ec.id
      WHERE ec.type = 'general' 
      AND date BETWEEN date('now') AND date('now', '+7 days')
    `);

    // Calculate savings progress
    const [savingsProgress] = await db.getAllAsync<{ progress: number }>(`
      WITH MonthlyTarget AS (
        SELECT SUM(allocated) as target
        FROM budget_categories
        WHERE type = 'savings'
      ),
      CurrentSavings AS (
        SELECT COALESCE(SUM(amount), 0) as current
        FROM expenses e
        JOIN expense_categories ec ON e.category_id = ec.id
        WHERE ec.type = 'investment'
        AND strftime('%m', date) = ? AND strftime('%Y', date) = ?
      )
      SELECT CASE 
        WHEN mt.target > 0 THEN (cs.current / mt.target * 100)
        ELSE 0 
      END as progress
      FROM MonthlyTarget mt, CurrentSavings cs
    `, [currentMonth.toString().padStart(2, '0'), currentYear.toString()]);

    // Cache the insights
    await db.runAsync(`
      INSERT OR REPLACE INTO budget_insights 
      (month, year, total_spending, mom_change, highest_increase_category, 
       highest_increase_percentage, upcoming_bills_count, savings_goal_progress)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      currentMonth.toString().padStart(2, '0'),
      currentYear,
      currentMonthTotal.total,
      monthlyChange,
      categoryChanges[0]?.category_name,
      categoryChanges[0]?.change_percentage,
      upcomingBillsCount.count,
      savingsProgress.progress
    ]);

    return {
      monthlyChange,
      highestIncrease: {
        category: categoryChanges[0]?.category_name || 'None',
        percentage: categoryChanges[0]?.change_percentage || 0
      },
      upcomingBills: upcomingBillsCount.count,
      savingsProgress: savingsProgress.progress
    };
  } catch (error) {
    console.error('Error calculating budget insights:', error);
    throw error;
  }
};
