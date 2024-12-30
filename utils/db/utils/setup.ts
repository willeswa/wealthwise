import * as SQLite from 'expo-sqlite';
import { seedInvestmentTypes } from './seedDatabase';

let db: SQLite.SQLiteDatabase | null = null;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const executeWithRetry = async (operation: () => Promise<any>, retries = MAX_RETRIES): Promise<any> => {
  try {
    return await operation();
  } catch (error: any) {
    if (retries > 0 && error.message?.includes('database table is locked')) {
      await wait(RETRY_DELAY);
      return executeWithRetry(operation, retries - 1);
    }
    throw error;
  }
};

export const initDatabase = async () => {
  try {
    if (db) {
      // If database is already initialized, close it first
      await db.closeAsync();
    }

    db = await SQLite.openDatabaseAsync('wealthwise.db');
    
    await executeWithRetry(async () => {
      if (!db) throw new Error('Database not initialized');
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        PRAGMA busy_timeout = 5000;
        PRAGMA foreign_keys = ON;
        
        -- First check if the expenses table exists
        CREATE TABLE IF NOT EXISTS _temp_check (name TEXT);
        INSERT INTO _temp_check (name) 
        SELECT 'expenses_exists' 
        WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='expenses');
        
        -- Create the new expenses table with all columns
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
          status TEXT CHECK(status IN ('pending', 'paid', 'missed')) DEFAULT 'pending',
          due_date TEXT,
          paid_date TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES expense_categories(id)
        );

        -- Create income table
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
          ('Housing', 'general', 'home', 'Housing costs'),
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

        -- Create new debts table with repayment period fields
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
          repayment_period INTEGER,
          period_unit TEXT CHECK(period_unit IN ('Weeks', 'Months', 'Years')),
          manual_end_date BOOLEAN DEFAULT 0,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Create debt_repayments table
        CREATE TABLE IF NOT EXISTS debt_repayments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          debt_id INTEGER NOT NULL,
          expense_id INTEGER,
          amount REAL NOT NULL,
          repayment_date TEXT NOT NULL,
          frequency TEXT DEFAULT 'One-time' 
            CHECK(frequency IN ('One-time', 'Weekly', 'Monthly', 'Yearly')),
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (debt_id) REFERENCES debts(id)
            ON DELETE CASCADE,
          FOREIGN KEY (expense_id) REFERENCES expenses(id)
            ON DELETE SET NULL
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

        -- Create new contributions table with expense_id included
        DROP TABLE IF EXISTS contributions;
        CREATE TABLE IF NOT EXISTS contributions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          investment_id INTEGER NOT NULL,
          amount DECIMAL(15,2) NOT NULL,
          contribution_date TEXT NOT NULL,
          frequency TEXT DEFAULT 'One-time' 
            CHECK(frequency IN ('One-time', 'Weekly', 'Monthly', 'Yearly')),
          notes TEXT,
          expense_id INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (investment_id) REFERENCES investments(id)
            ON DELETE CASCADE,
          FOREIGN KEY (expense_id) REFERENCES expenses(id)
            ON DELETE SET NULL
        );

        -- Create index for faster lookups
        CREATE INDEX IF NOT EXISTS idx_contributions_investment_id 
          ON contributions(investment_id);

        -- Create index for expense relationships
        CREATE INDEX IF NOT EXISTS idx_contributions_expense_id
          ON contributions(expense_id);

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

        -- Add last_ai_insight_date to settings if not exists
        INSERT OR IGNORE INTO settings (key, value) 
        VALUES ('last_ai_insight_date', '2000-01-01');

        -- Create insights table for caching calculated metrics
        CREATE TABLE IF NOT EXISTS budget_insights (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          month TEXT NOT NULL,
          year INTEGER NOT NULL,
          total_spending DECIMAL(15,2) NOT NULL,
          mom_change DECIMAL(5,2),
          highest_increase_category TEXT,
          highest_increase_percentage DECIMAL(5,2),
          upcoming_bills_count INTEGER,
          savings_goal_progress DECIMAL(5,2),
          last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(month, year)
        );

        -- Create trigger to update last_calculated timestamp
        CREATE TRIGGER IF NOT EXISTS update_insights_timestamp 
        AFTER UPDATE ON budget_insights
        BEGIN
          UPDATE budget_insights 
          SET last_calculated = CURRENT_TIMESTAMP 
          WHERE id = NEW.id;
        END;

        -- Create debt_payment_status table
        CREATE TABLE IF NOT EXISTS debt_payment_status (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          debt_id INTEGER NOT NULL,
          month TEXT NOT NULL, -- YYYY-MM format
          status TEXT CHECK(status IN ('paid', 'missed')) NOT NULL,
          penalty_rate DECIMAL(5,2) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (debt_id) REFERENCES debts(id) ON DELETE CASCADE,
          UNIQUE(debt_id, month)
        );

        -- Create index for faster lookups
        CREATE INDEX IF NOT EXISTS idx_debt_payment_status 
          ON debt_payment_status(debt_id, month);

        -- Create investment_performance table
        CREATE TABLE IF NOT EXISTS investment_performance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          investment_id INTEGER NOT NULL,
          value DECIMAL(15,2) NOT NULL,
          return_rate DECIMAL(6,2),
          date TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (investment_id) REFERENCES investments(id)
            ON DELETE CASCADE
        );

        -- Create index for faster lookups
        CREATE INDEX IF NOT EXISTS idx_investment_performance 
          ON investment_performance(investment_id, date);

        -- Create trigger to automatically track performance when value changes
        CREATE TRIGGER IF NOT EXISTS track_investment_performance
        AFTER UPDATE OF current_value ON investments
        BEGIN
          INSERT INTO investment_performance (
            investment_id, 
            value,
            return_rate,
            date
          ) 
          VALUES (
            NEW.id,
            NEW.current_value,
            CASE 
              WHEN (SELECT value FROM investment_performance 
                    WHERE investment_id = NEW.id 
                    ORDER BY date DESC LIMIT 1) IS NOT NULL 
              THEN (
                (NEW.current_value - (SELECT value FROM investment_performance 
                                    WHERE investment_id = NEW.id 
                                    ORDER BY date DESC LIMIT 1)) /
                (SELECT value FROM investment_performance 
                 WHERE investment_id = NEW.id 
                 ORDER BY date DESC LIMIT 1) * 100
              )
              ELSE 0
            END,
            date('now')
          );
        END;

        -- Remove duplicate triggers first
        DROP TRIGGER IF EXISTS handle_investment_expense;
        DROP TRIGGER IF EXISTS handle_investment_expense_deletion;

        -- Create single trigger for investment expense creation
        CREATE TRIGGER IF NOT EXISTS handle_investment_expense
        AFTER INSERT ON expenses
        WHEN NEW.linked_item_type = 'investment'
        BEGIN
          -- Only create contribution record
          INSERT INTO contributions (
            investment_id,
            amount,
            contribution_date,
            frequency,
            notes,
            expense_id
          ) VALUES (
            NEW.linked_item_id,
            NEW.amount,
            NEW.date,
            'One-time',
            NEW.comment,
            NEW.id
          );
          
          -- Update investment value only if expense is already paid
          UPDATE investments
          SET current_value = CASE 
            WHEN NEW.status = 'paid' THEN current_value + NEW.amount
            ELSE current_value
          END
          WHERE id = NEW.linked_item_id;
        END;

        -- Create trigger for expense status changes
        CREATE TRIGGER IF NOT EXISTS handle_investment_expense_status
        AFTER UPDATE OF status ON expenses
        WHEN NEW.linked_item_type = 'investment'
        BEGIN
          UPDATE investments
          SET current_value = CASE 
            WHEN NEW.status = 'paid' AND OLD.status != 'paid' 
              THEN current_value + NEW.amount
            WHEN OLD.status = 'paid' AND NEW.status != 'paid' 
              THEN current_value - NEW.amount
            ELSE current_value
          END
          WHERE id = NEW.linked_item_id;
        END;

        -- Create single trigger for expense deletion
        CREATE TRIGGER IF NOT EXISTS handle_investment_expense_deletion
        BEFORE DELETE ON expenses
        WHEN OLD.linked_item_type = 'investment'
        BEGIN
          -- Only revert the investment value if expense was paid
          UPDATE investments
          SET current_value = CASE 
            WHEN OLD.status = 'paid' THEN current_value - OLD.amount
            ELSE current_value
          END
          WHERE id = OLD.linked_item_id;
          
          -- Delete associated contribution
          DELETE FROM contributions
          WHERE expense_id = OLD.id;
        END;

        -- Update settings table with new AI-related settings if not exists
        INSERT OR IGNORE INTO settings (key, value) VALUES 
          ('ai_enabled', 'true'),
          ('ai_insight_frequency', '7'),
          ('ai_personalization_level', 'balanced');

        -- Create AI insights table
        CREATE TABLE IF NOT EXISTS ai_insights (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL CHECK(type IN ('spending', 'saving', 'alert', 'recommendation')),
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          category TEXT,
          amount DECIMAL(10,2),
          impact_score INTEGER CHECK(impact_score BETWEEN 1 AND 10),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          valid_until TIMESTAMP,
          acted_on BOOLEAN DEFAULT 0,
          dismissed BOOLEAN DEFAULT 0
        );

        -- Create index for faster lookups on active insights
        CREATE INDEX IF NOT EXISTS idx_active_insights 
        ON ai_insights(created_at, valid_until, dismissed)
        WHERE dismissed = 0;

        -- Create AI insight actions table
        CREATE TABLE IF NOT EXISTS ai_insight_actions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          insight_id INTEGER NOT NULL,
          action_type TEXT NOT NULL CHECK(action_type IN ('applied', 'dismissed', 'saved')),
          action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          notes TEXT,
          FOREIGN KEY (insight_id) REFERENCES ai_insights(id)
            ON DELETE CASCADE
        );

        -- Create trigger to automatically expire old insights
        CREATE TRIGGER IF NOT EXISTS expire_old_insights
        AFTER INSERT ON ai_insights
        BEGIN
          UPDATE ai_insights 
          SET dismissed = 1
          WHERE valid_until < CURRENT_TIMESTAMP 
          AND dismissed = 0;
        END;

        -- Create trigger to track insight effectiveness
        CREATE TRIGGER IF NOT EXISTS track_insight_action
        AFTER INSERT ON ai_insight_actions
        BEGIN
          UPDATE ai_insights
          SET acted_on = CASE 
            WHEN NEW.action_type IN ('applied', 'saved') THEN 1
            ELSE acted_on
          END
          WHERE id = NEW.insight_id;
        END;

        -- Create investment insights table
        CREATE TABLE IF NOT EXISTS investment_insights (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            impact TEXT,
            action_required TEXT,
            urgency TEXT,
            source TEXT,
            affected_investments TEXT,
            rationale TEXT,
            requirements TEXT,
            potential_return TEXT,
            insight_type TEXT CHECK(insight_type IN ('daily', 'weekly')) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            acted_on BOOLEAN DEFAULT 0,
            dismissed BOOLEAN DEFAULT 0
        );

        -- Create index for active insights
        CREATE INDEX IF NOT EXISTS idx_active_investment_insights 
        ON investment_insights(created_at, insight_type, dismissed)
        WHERE dismissed = 0;
      `);
    });

    // Seed investment types after table creation
    await seedInvestmentTypes(db);

    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    if (db) {
      try {
        await db.closeAsync();
      } catch (closeError) {
        console.error('Error closing database:', closeError);
      }
    }
    db = null;
    throw error;
  }
};

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};

// Add cleanup function
export const closeDatabase = async () => {
  if (db) {
    await db.closeAsync();
    db = null;
  }
};
