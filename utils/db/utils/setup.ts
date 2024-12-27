import * as SQLite from 'expo-sqlite';
import { seedInvestmentTypes } from './seedDatabase';

let db: SQLite.SQLiteDatabase;

export const initDatabase = async () => {
  try {
    db = await SQLite.openDatabaseAsync('wealthwise.db');
    
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS income (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount DECIMAL(10,2) NOT NULL,
        currency TEXT NOT NULL,
        category TEXT NOT NULL,
        frequency TEXT NOT NULL,
        date TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency TEXT NOT NULL,
        category TEXT NOT NULL,
        comment TEXT,
        date TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      INSERT OR IGNORE INTO settings (key, value) VALUES ('default_currency', 'USD');

      CREATE TABLE IF NOT EXISTS budget_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        allocated DECIMAL(10,2) NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('want', 'need', 'savings')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS debts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        creditor TEXT NOT NULL,
        amount REAL DEFAULT NULL,
        interest_rate REAL NOT NULL DEFAULT 0,
        currency TEXT NOT NULL,
        start_date TEXT,
        due_date TEXT,
        frequency TEXT NOT NULL,
        payment_amount REAL NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Create investments_types table first
      CREATE TABLE IF NOT EXISTS investments_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        risk_level TEXT DEFAULT 'Medium' CHECK(risk_level IN ('Low', 'Medium', 'High')),
        liquidity TEXT DEFAULT 'Liquid' CHECK(liquidity IN ('Liquid', 'Illiquid')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(name)
      );

      -- Drop existing investments table if exists
      DROP TABLE IF EXISTS investments;
      
      -- Create new simplified investments table
      CREATE TABLE IF NOT EXISTS investments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        current_value DECIMAL(15,2) NOT NULL DEFAULT 0.00,
        liquidity TEXT DEFAULT 'Liquid' CHECK(liquidity IN ('Liquid', 'Illiquid')),
        risk_level TEXT DEFAULT 'Medium' CHECK(risk_level IN ('Low', 'Medium', 'High')),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (type) REFERENCES investments_types(name)
      );

      -- Create new contributions table
      CREATE TABLE IF NOT EXISTS contributions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        investment_id INTEGER NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        contribution_date TEXT NOT NULL,
        frequency TEXT DEFAULT 'One-time' 
          CHECK(frequency IN ('One-time', 'Weekly', 'Monthly', 'Yearly')),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (investment_id) REFERENCES investments(id)
          ON DELETE CASCADE
      );

      -- Create index for faster lookups
      CREATE INDEX IF NOT EXISTS idx_contributions_investment_id 
        ON contributions(investment_id);

      -- Create trigger to update investment updated_at
      CREATE TRIGGER IF NOT EXISTS update_investment_timestamp 
        AFTER UPDATE ON investments
        BEGIN
          UPDATE investments 
          SET updated_at = CURRENT_TIMESTAMP 
          WHERE id = NEW.id;
        END;

      -- Add country_code to settings if not exists
      INSERT OR IGNORE INTO settings (key, value) VALUES ('country_code', 'US');
      
      -- Set default country to Kenya
      INSERT OR IGNORE INTO settings (key, value) VALUES ('country_code', 'KE');
    `);

    // Seed investment types after table creation
    await seedInvestmentTypes(db);

    console.log('Database initialization successful');
    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};
