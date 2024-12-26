import { Investment, InvestmentInput, InvestmentType, Contribution, ContributionInput } from '../types/investment';
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
    const investments = await db.getAllAsync<Investment & { type_name?: string; type_description?: string }>(
      `SELECT 
        i.*,
        it.name as type_name,
        it.description as type_description,
        it.risk_category as type_risk_category,
        it.country_code as type_country_code
      FROM investments i
      LEFT JOIN investment_types it ON i.id = it.id
      ORDER BY i.created_at DESC`
    );

    // Transform the results to include the investment_type object
    return investments.map(inv => ({
      ...inv,
      investment_type: inv.type_name ? {
        id: inv.investment_type_id,
        name: inv.type_name,
        description: inv.type_description,
        risk_category: "Low",
        country_code: "KE",
        is_active: true
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
    const investment = await db.getFirstAsync<Investment & { type_name?: string; type_description?: string }>(
      `SELECT 
        i.*,
        it.name as type_name,
        it.description as type_description,
        it.risk_category as type_risk_category,
        it.country_code as type_country_code
      FROM investments i
      LEFT JOIN investment_types it ON i.id = it.id
      WHERE i.id = ?`,
      [id]
    );

    if (!investment) return null;

    return {
      ...investment,
      investment_type: investment.type_name ? {
        id: investment.investment_type_id,
        name: investment.type_name,
        description: investment.type_description,
        risk_category: "Low",
        country_code: "KE",
        is_active: true
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
    const values = entries.map(([_, value]) => value ?? null);

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
