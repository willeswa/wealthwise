import { Investment, InvestmentInput, InvestmentType, Contribution, ContributionInput, RiskLevel, Liquidity, InvestmentPerformance, InvestmentInsight } from '../types/investment';
import { getDatabase } from './utils/setup';

export const addInvestment = async (investment: InvestmentInput): Promise<number> => {
  try {
    const db = getDatabase();
    const result = await db.runAsync(
      `INSERT INTO investments (
        name, type, current_value, liquidity, risk_level, notes
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        investment.name,
        investment.type,
        investment.current_value,
        investment.liquidity,
        investment.risk_level,
        investment.notes ?? null
      ]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error adding investment:', error);
    throw error;
  }
};

export const addContribution = async (contribution: ContributionInput): Promise<number> => {
  try {
    const db = getDatabase();
    
    await db.execAsync('BEGIN TRANSACTION;');
    
    try {
      const result = await db.runAsync(
        `INSERT INTO contributions (
          investment_id, amount, contribution_date, frequency, notes, expense_id
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          contribution.investment_id,
          contribution.amount,
          contribution.contribution_date,
          contribution.frequency,
          contribution.notes ?? null,
          contribution.expense_id ?? null
        ]
      );

      // Only update investment value for direct contributions (no linked expense)
      if (!contribution.expense_id) {
        await db.runAsync(
          `UPDATE investments 
           SET current_value = current_value + ? 
           WHERE id = ?`,
          [contribution.amount, contribution.investment_id]
        );
      }

      await db.execAsync('COMMIT;');
      return result.lastInsertRowId;
    } catch (error) {
      await db.execAsync('ROLLBACK;');
      throw error;
    }
  } catch (error) {
    console.error('Error adding contribution:', error);
    throw error;
  }
};



// Add new method to handle contribution deletion
export const deleteContribution = async (id: number): Promise<void> => {
  try {
    const db = getDatabase();
    
    // Get contribution details before deletion
    const contribution = await db.getFirstAsync<Contribution>(
      'SELECT * FROM contributions WHERE id = ?',
      [id]
    );

    if (!contribution) return;

    await db.execAsync('BEGIN TRANSACTION;');
    
    try {
      // Only update investment value if no expense is linked
      if (!contribution.expense_id) {
        await db.runAsync(
          `UPDATE investments 
           SET current_value = current_value - ? 
           WHERE id = ?`,
          [contribution.amount, contribution.investment_id]
        );
      }

      await db.runAsync('DELETE FROM contributions WHERE id = ?', [id]);
      
      await db.execAsync('COMMIT;');
    } catch (error) {
      await db.execAsync('ROLLBACK;');
      throw error;
    }
  } catch (error) {
    console.error('Error deleting contribution:', error);
    throw error;
  }
};

export const getContributions = async (investmentId: number): Promise<Contribution[]> => {
  try {
    const db = getDatabase();
    return await db.getAllAsync<Contribution>(
      `SELECT 
        c.*,
        e.status as expense_status,
        e.paid_date as expense_paid_date,
        CASE 
          WHEN c.expense_id IS NULL THEN true
          WHEN e.status = 'paid' THEN true
          ELSE false
        END as is_applied
       FROM contributions c
       LEFT JOIN expenses e ON c.expense_id = e.id
       WHERE c.investment_id = ? 
       ORDER BY c.contribution_date DESC`,
      [investmentId]
    );
  } catch (error) {
    console.error('Error getting contributions:', error);
    throw error;
  }
};

export const getInvestments = async (): Promise<Investment[]> => {
  try {
    const db = getDatabase();
    const investments = await db.getAllAsync<Investment>(
      `SELECT 
        i.*,
        it.description as type_description,
        it.risk_level as type_risk_level,
        it.liquidity as type_liquidity,
        COALESCE(
          (SELECT SUM(c.amount) 
           FROM contributions c
           LEFT JOIN expenses e ON c.expense_id = e.id
           WHERE c.investment_id = i.id 
           AND (c.expense_id IS NULL OR e.status = 'paid')
          ), 
          0
        ) as total_contributions
      FROM investments i
      LEFT JOIN investments_types it ON i.type = it.name
      ORDER BY i.created_at DESC`
    );

    return investments.map((inv: any) => ({
      ...inv,
      current_value: Number(inv.current_value || 0),
      investment_type: inv.type ? {
        id: 0, // We don't need this for display
        name: inv.type,
        description: inv.type_description,
        risk_level: inv.type_risk_level as RiskLevel,
        liquidity: inv.type_liquidity as Liquidity
      } : undefined
    }));
  } catch (error) {
    console.error('Error getting investments:', error);
    throw error;
  }
};

export const getInvestmentById = async (id: number): Promise<Investment | null> => {
  try {
    const db = getDatabase();
    const investment = await db.getFirstAsync<Investment>(
      `SELECT 
        i.*,
        it.name as type_name,
        it.description as type_description,
        it.risk_level as type_risk_level,
        it.liquidity as type_liquidity
      FROM investments i
      LEFT JOIN investments_types it ON i.type = it.name
      WHERE i.id = ?`,
      [id]
    );

    if (!investment) return null;

    return {
      ...investment,
      investment_type: investment.name ? {
        id: investment.id,
        name: investment.name,
        description: investment.name,
        risk_level: investment.risk_level as RiskLevel,
        liquidity: investment.liquidity as Liquidity
      } : undefined
    };
  } catch (error) {
    console.error('Error getting investment by id:', error);
    throw error;
  }
};

export const getInvestmentTypes = async (): Promise<InvestmentType[]> => {
  try {
    const db = getDatabase();
    return await db.getAllAsync<InvestmentType>(
      'SELECT * FROM investments_types ORDER BY name ASC'
    );
  } catch (error) {
    console.error('Error getting investment types:', error);
    throw error;
  }
};

export const updateInvestment = async (id: number, investment: Partial<InvestmentInput>): Promise<void> => {
  try {
    const db = getDatabase();
    const entries = Object.entries(investment).filter(([_, value]) => value !== undefined);
    
    if (entries.length === 0) return;

    const updates = entries.map(([key]) => `${key} = ?`).join(', ');
    const values = entries.map(([_, value]) => {
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }
      return value ?? null;
    });

    await db.runAsync(
      `UPDATE investments 
       SET ${updates}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [...values, id]
    );
  } catch (error) {
    console.error('Error updating investment:', error);
    throw error;
  }
};

export const deleteInvestment = async (id: number): Promise<void> => {
  try {
    const db = getDatabase();
    await db.runAsync('DELETE FROM investments WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting investment:', error);
    throw error;
  }
};

export const getInvestmentPerformance = async (
  investmentId: number,
  period: 'week' | 'month' | 'year' = 'month'
): Promise<InvestmentPerformance[]> => {
  try {
    const db = getDatabase();
    const periodFilter = {
      week: "date('now', '-7 days')",
      month: "date('now', '-30 days')",
      year: "date('now', '-365 days')"
    };

    return await db.getAllAsync<InvestmentPerformance>(
      `SELECT * FROM investment_performance 
       WHERE investment_id = ? 
       AND date >= ${periodFilter[period]}
       ORDER BY date ASC`,
      [investmentId]
    );
  } catch (error) {
    console.error('Error getting investment performance:', error);
    throw error;
  }
};

export const updateInvestmentValue = async (
  id: number,
  newValue: number
): Promise<void> => {
  try {
    const db = getDatabase();
    await db.runAsync(
      `UPDATE investments 
       SET current_value = ?, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [newValue, id]
    );
  } catch (error) {
    console.error('Error updating investment value:', error);
    throw error;
  }
};

export const getLatestInsights = async () => {
  try {
    const db = getDatabase();
    
    // Get most recent daily insight
    const daily = await db.getFirstAsync<InvestmentInsight>(`
      SELECT * FROM investment_insights
      WHERE insight_type = 'daily'
      AND dismissed = 0
      ORDER BY created_at DESC
      LIMIT 1
    `);

    // Get two most recent weekly insights
    const weekly = await db.getAllAsync<InvestmentInsight>(`
      SELECT * FROM investment_insights
      WHERE insight_type = 'weekly'
      AND dismissed = 0
      ORDER BY created_at DESC
      LIMIT 2
    `);

    return {
      daily: daily || null,
      weekly: weekly || []
    };
  } catch (error) {
    console.error('Error getting investment insights:', error);
    throw error;
  }
};
