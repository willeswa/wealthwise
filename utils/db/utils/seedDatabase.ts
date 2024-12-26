import { SQLiteDatabase } from 'expo-sqlite';

const INVESTMENT_TYPES = [
  {
    name: 'SACCO',
    description: 'Savings and Credit Co-operative Society',
    risk_level: 'Low',
    liquidity: 'Liquid'
  },
  {
    name: 'MMF',
    description: 'Money Market Fund',
    risk_level: 'Low',
    liquidity: 'Liquid'
  },
  {
    name: 'Stock',
    description: 'Company shares traded on stock exchange',
    risk_level: 'High',
    liquidity: 'Liquid'
  },
  {
    name: 'Land',
    description: 'Real estate property investment',
    risk_level: 'Medium',
    liquidity: 'Illiquid'
  },
  {
    name: 'Bond',
    description: 'Government or corporate bonds',
    risk_level: 'Low',
    liquidity: 'Liquid'
  }
];

export const seedInvestmentTypes = async (db: SQLiteDatabase) => {
  try {
    // Insert default investment types with correct table name
    for (const type of INVESTMENT_TYPES) {
      await db.runAsync(
        `INSERT OR IGNORE INTO investments_types (
          name, description, risk_level, liquidity
        ) VALUES (?, ?, ?, ?)`,
        [type.name, type.description, type.risk_level, type.liquidity]
      );
    }
    console.log('Investment types seeded successfully');
  } catch (error) {
    console.error('Error seeding investment types:', error);
    throw error;
  }
};
