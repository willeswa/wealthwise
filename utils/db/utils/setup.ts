import * as SQLite from 'expo-sqlite';
import { seedInvestmentTypes } from './seedDatabase';

let db: SQLite.SQLiteDatabase;

export const initDatabase = async () => {
  try {
    db = await SQLite.openDatabaseAsync('wealthwise.db');
    
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
      
      CREATE TABLE IF NOT EXISTS income (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount DECIMAL(10,2) NOT NULL,
        currency TEXT NOT NULL,
        category TEXT NOT NULL,
        frequency TEXT NOT NULL,
        date TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create expense_categories table
      CREATE TABLE IF NOT EXISTS expense_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL CHECK(type IN ('general', 'investment', 'debt')),
        icon TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Drop and recreate expenses table with new structure
      DROP TABLE IF EXISTS expenses;
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency TEXT NOT NULL,
        category_id INTEGER NOT NULL,
        linked_item_id INTEGER,
        linked_item_type TEXT CHECK(linked_item_type IN ('investment', 'debt')),
        comment TEXT,
        date TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES expense_categories(id)
      );

      -- Create triggers to enforce referential integrity for linked items
      CREATE TRIGGER IF NOT EXISTS validate_investment_link
        BEFORE INSERT ON expenses
        WHEN NEW.linked_item_type = 'investment'
        BEGIN
          SELECT CASE 
            WHEN NOT EXISTS (SELECT 1 FROM investments WHERE id = NEW.linked_item_id)
            THEN RAISE(ROLLBACK, 'Invalid investment reference')
          END;
        END;

      CREATE TRIGGER IF NOT EXISTS validate_debt_link
        BEFORE INSERT ON expenses
        WHEN NEW.linked_item_type = 'debt'
        BEGIN
          SELECT CASE 
            WHEN NOT EXISTS (SELECT 1 FROM debts WHERE id = NEW.linked_item_id)
            THEN RAISE(ROLLBACK, 'Invalid debt reference')
          END;
        END;

      -- Create trigger to validate linked_item_id is not null when type is set
      CREATE TRIGGER IF NOT EXISTS validate_link_consistency
        BEFORE INSERT ON expenses
        WHEN NEW.linked_item_type IS NOT NULL
        BEGIN
          SELECT CASE 
            WHEN NEW.linked_item_id IS NULL
            THEN RAISE(ROLLBACK, 'Linked item ID is required when type is set')
          END;
        END;

      -- Seed default expense categories
      INSERT OR IGNORE INTO expense_categories (name, type, icon, description) VALUES
        ('Food', 'general', 'food', 'Food and dining expenses'),
        ('Transport', 'general', 'car', 'Transportation costs'),
        ('Shopping', 'general', 'shopping', 'General shopping'),
        ('Entertainment', 'general', 'movie', 'Entertainment expenses'),
        ('Healthcare', 'general', 'hospital', 'Medical and healthcare costs'),
        ('Education', 'general', 'school', 'Education expenses'),
        ('Rent', 'general', 'home', 'Housing costs'),
        ('Utilities', 'general', 'water', 'Utility bills'),
        ('Insurance', 'general', 'shield', 'Insurance payments'),
        ('Investment', 'investment', 'chart-line', 'Investment contributions'),
        ('Debt Repayment', 'debt', 'bank', 'Debt repayment expenses'),
        ('Other', 'general', 'dots-horizontal', 'Miscellaneous expenses');

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

      -- Drop existing debts table
      DROP TABLE IF EXISTS debts;

      -- Create new debts table
      CREATE TABLE IF NOT EXISTS debts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        creditor TEXT NOT NULL,
        total_amount REAL NOT NULL,
        remaining_amount REAL NOT NULL,
        interest_rate REAL NOT NULL DEFAULT 0,
        currency TEXT NOT NULL,
        start_date TEXT NOT NULL,
        expected_end_date TEXT NOT NULL,
        frequency TEXT NOT NULL DEFAULT 'Monthly'
          CHECK(frequency IN ('One-time', 'Weekly', 'Monthly', 'Yearly')),
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Create debt_repayments table
      CREATE TABLE IF NOT EXISTS debt_repayments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        debt_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        repayment_date TEXT NOT NULL,
        frequency TEXT DEFAULT 'One-time' 
          CHECK(frequency IN ('One-time', 'Weekly', 'Monthly', 'Yearly')),
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (debt_id) REFERENCES debts(id)
          ON DELETE CASCADE
      );

      -- Create index for faster lookups
      CREATE INDEX IF NOT EXISTS idx_debt_repayments_debt_id 
        ON debt_repayments(debt_id);

      -- Create trigger to update debt updated_at
      CREATE TRIGGER IF NOT EXISTS update_debt_timestamp 
        AFTER UPDATE ON debts
        BEGIN
          UPDATE debts 
          SET updated_at = CURRENT_TIMESTAMP 
          WHERE id = NEW.id;
        END;

      -- Create trigger to update debt remaining_amount after repayment
      CREATE TRIGGER IF NOT EXISTS update_debt_remaining_amount 
        AFTER INSERT ON debt_repayments
        BEGIN
          UPDATE debts 
          SET remaining_amount = remaining_amount - NEW.amount 
          WHERE id = NEW.debt_id;
        END;

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
