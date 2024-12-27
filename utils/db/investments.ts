import { Investment, InvestmentInput, InvestmentType, Contribution, ContributionInput, RiskLevel, Liquidity } from '../types/investment';
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
    const result = await db.runAsync(
      `INSERT INTO contributions (
        investment_id, amount, contribution_date, frequency, notes
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        contribution.investment_id,
        contribution.amount,
        contribution.contribution_date,
        contribution.frequency,
        contribution.notes ?? null
      ]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error adding contribution:', error);
    throw error;
  }
};

export const getContributions = async (investmentId: number): Promise<Contribution[]> => {
  try {
    const db = getDatabase();
    return await db.getAllAsync<Contribution>(
      'SELECT * FROM contributions WHERE investment_id = ? ORDER BY contribution_date DESC',
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
        it.name as type_name,
        it.description as type_description,
        it.risk_level as type_risk_level,
        it.liquidity as type_liquidity
      FROM investments i
      LEFT JOIN investments_types it ON i.type = it.name
      ORDER BY i.created_at DESC`
    );

    return investments.map(inv => ({
      ...inv,
      investment_type: inv.name ? {
        id: inv.id,
        name: inv.name,
        description: inv.name,
        risk_level: inv.risk_level as RiskLevel,
        liquidity: inv.liquidity as Liquidity
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
