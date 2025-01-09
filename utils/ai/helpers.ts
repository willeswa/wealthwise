import { addDays, differenceInDays, format, isAfter, subMonths } from "date-fns";
import { getDatabase } from "../db/utils/setup";
import { usePreferencesStore } from '../../store/preferences-store';

const CHECK_EXPIRY = true; // Toggle for debugging

interface EligibilityResult {
  eligible: boolean;
  reason?: string;
  nextAvailableDate?: Date;
}

interface BudgetDataPoint {
  date: string;
  amount: number;
  category: string;
  type: 'expense' | 'income';
}

interface DebtDataPoint {
  creditor: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
}

interface InvestmentDataPoint {
  name: string;
  currentValue: number;
  type: string;
  performance: {
    date: string;
    value: number;
    returnRate: number;
  }[];
}

interface AIAnalysisData {
  monthlyIncome: number;
  recurringExpenses: {
    category: string;
    amount: number;
    frequency: string;
  }[];
  spendingTrends: {
    currentMonth: BudgetDataPoint[];
    previousMonth: BudgetDataPoint[];
  };
  savingsRate: number;
  debts: DebtDataPoint[];
  investments: InvestmentDataPoint[];
  budgetCategories: {
    name: string;
    allocated: number;
    spent: number;
    type: string;
  }[];
  country: string;
  goal: string;
}

export async function clearOldInsights(): Promise<void> {
  const db = getDatabase();
  try {
    await db.execAsync(`
      DELETE FROM ai_insights 
      WHERE created_at < datetime('now', '-1 day')
      OR valid_until < datetime('now')
    `);
  } catch (error) {
    console.error('Error clearing old insights:', error);
  }
}

export async function checkAIInsightsEligibility(): Promise<EligibilityResult> {
  const db = getDatabase();

  try {
    // Check existing insights first
    if (CHECK_EXPIRY) {
      const latestInsight = await db.getFirstAsync<{ created_at: string }>(`
        SELECT created_at FROM ai_insights
        ORDER BY created_at DESC LIMIT 1
      `);

      if (latestInsight) {
        const lastInsightDate = new Date(latestInsight.created_at);
        const daysSinceLastInsight = differenceInDays(new Date(), lastInsightDate);
        
        if (daysSinceLastInsight < 7) {
          return {
            eligible: false,
            reason: "Recent insights are still valid",
            nextAvailableDate: addDays(lastInsightDate, 7)
          };
        }
      }
    }

    const incomeCount = await db.getFirstAsync<{count: number}>(`
      SELECT COUNT(*) as count FROM income
    `);
    
    if (incomeCount?.count === 0) {
      return {
        eligible: false,
        reason: "Record at least one income source first"
      };
    }

    const categoryCount = await db.getFirstAsync<{count: number}>(`
      SELECT COUNT(DISTINCT category_id) as count 
      FROM expenses
    `);

    if (categoryCount && categoryCount.count < 3) {
      return {
        eligible: false,
        reason: "Record expenses in at least 3 different categories"
      };
    }

    const lastRequest = await db.getFirstAsync<{value: string}>(`
      SELECT value FROM settings 
      WHERE key = 'last_ai_insight_date'
    `);

    if (lastRequest) {
      const lastRequestDate = new Date(lastRequest.value);
      const currentDate = new Date();
      
      if (format(lastRequestDate, 'yyyy-MM') === format(currentDate, 'yyyy-MM')) {
        const nextAvailableDate = addDays(lastRequestDate, 7);
        
        if (isAfter(nextAvailableDate, currentDate)) {
          return {
            eligible: false,
            reason: "Next insight available in a few days",
            nextAvailableDate
          };
        }
      }
    }

    return { eligible: true };

  } catch (error) {
    console.error('Error checking eligibility:', error);
    throw error;
  }
}

export async function updateLastInsightRequest(): Promise<void> {
  const db = getDatabase();
  
  try {
    await db.execAsync(`
      INSERT OR REPLACE INTO settings (key, value)
      VALUES ('last_ai_insight_date', datetime('now'))
    `);
  } catch (error) {
    throw error;
  }
}

export async function collectAIAnalysisData(): Promise<AIAnalysisData> {
  const db = getDatabase();
  const { country, primaryGoal } = usePreferencesStore.getState();
  const currentDate = new Date();
  const currentMonth = format(currentDate, 'yyyy-MM');
  const previousMonth = format(subMonths(currentDate, 1), 'yyyy-MM');

  try {
    const incomeResult = await db.getFirstAsync<{ total: number }>(`
      SELECT SUM(amount) as total 
      FROM income 
      WHERE strftime('%Y-%m', date) = ?
    `, [currentMonth]);

    const recurringExpenses = await db.getAllAsync(`
      SELECT 
        ec.name as category,
        SUM(e.amount) as amount,
        COUNT(*) as frequency
      FROM expenses e
      JOIN expense_categories ec ON e.category_id = ec.id
      WHERE strftime('%Y-%m', e.date) >= date('now', '-3 months')
      GROUP BY ec.name
      HAVING COUNT(*) >= 2
    `);

    const transactions = await db.getAllAsync(`
      SELECT 
        date,
        amount,
        ec.name as category,
        'expense' as type
      FROM expenses e
      JOIN expense_categories ec ON e.category_id = ec.id
      WHERE strftime('%Y-%m', date) IN (?, ?)
      UNION ALL
      SELECT 
        date,
        amount,
        category,
        'income' as type
      FROM income
      WHERE strftime('%Y-%m', date) IN (?, ?)
    `, [currentMonth, previousMonth, currentMonth, previousMonth]);

    const investments = await db.getAllAsync(`
      SELECT 
        i.name,
        i.current_value,
        i.type,
        json_group_array(json_object(
          'date', ip.date,
          'value', ip.value,
          'returnRate', ip.return_rate
        )) as performance
      FROM investments i
      LEFT JOIN investment_performance ip ON i.id = ip.investment_id
      GROUP BY i.id
    `);

    const debts = await db.getAllAsync<DebtDataPoint>(`
      SELECT 
        creditor,
        total_amount as totalAmount,
        remaining_amount as remainingAmount,
        interest_rate as interestRate
      FROM debts
      WHERE remaining_amount > 0
    `);

    const budgetCategories = await db.getAllAsync<{ name: string; allocated: number; type: string; spent: number }>(`
      SELECT 
        bc.name,
        bc.allocated,
        bc.type,
        COALESCE(SUM(e.amount), 0) as spent
      FROM budget_categories bc
      LEFT JOIN expenses e ON bc.name = (
        SELECT name FROM expense_categories WHERE id = e.category_id
      ) AND strftime('%Y-%m', e.date) = ?
      GROUP BY bc.name
    `, [currentMonth]);

    const totalIncome = incomeResult?.total || 0;
    const totalExpenses: any = transactions
      .filter((t: any) => t.type === 'expense' && format(new Date(t.date), 'yyyy-MM') === currentMonth)
      .reduce((sum, t: any) => sum + t.amount, 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    return {
      monthlyIncome: totalIncome,
      country,
      goal: primaryGoal.value,
      recurringExpenses: recurringExpenses.map((e: any) => ({
        category: e.category,
        amount: e.amount,
        frequency: e.frequency >= 3 ? 'monthly' : 'variable'
      })),
      spendingTrends: {
        currentMonth: transactions.filter((t: any) => format(new Date(t.date), 'yyyy-MM') === currentMonth).map((t: any) => ({
          date: t.date,
          amount: t.amount,
          category: t.category,
          type: t.type as 'expense' | 'income'
        })),
        previousMonth: transactions.filter((t: any) => format(new Date(t.date), 'yyyy-MM') === previousMonth).map((t: any) => ({
          date: t.date,
          amount: t.amount,
          category: t.category,
          type: t.type as 'expense' | 'income'
        }))
      },
      savingsRate,
      debts,
      investments: investments.map((i: any) => ({
        ...i,
        performance: JSON.parse(i.performance)
      })),
      budgetCategories
    };

  } catch (error) {
    throw new Error('Failed to collect budget analysis data');
  }
}
