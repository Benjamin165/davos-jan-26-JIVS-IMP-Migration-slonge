import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DATABASE_PATH || join(__dirname, '../../data/database.sqlite');

// Ensure data directory exists
const dataDir = dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

export function initializeDatabase() {
  console.log('Initializing database...');

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
      theme_preference TEXT DEFAULT 'dark' CHECK(theme_preference IN ('dark', 'light')),
      notification_settings TEXT DEFAULT '{}',
      tour_completed INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // User sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Dashboards table
  db.exec(`
    CREATE TABLE IF NOT EXISTS dashboards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      is_default INTEGER DEFAULT 0,
      layout TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Visualizations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS visualizations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      dashboard_id INTEGER,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('bar', 'line', 'pie', 'area', 'table', 'donut')),
      config TEXT DEFAULT '{}',
      is_template INTEGER DEFAULT 0,
      is_system_template INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (dashboard_id) REFERENCES dashboards(id) ON DELETE SET NULL
    )
  `);

  // Reconciliation data table
  db.exec(`
    CREATE TABLE IF NOT EXISTS reconciliation_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_object TEXT,
      target_object TEXT,
      source_row_count INTEGER DEFAULT 0,
      target_row_count INTEGER DEFAULT 0,
      transformation_rule TEXT,
      load_status TEXT DEFAULT 'pending' CHECK(load_status IN ('pending', 'running', 'completed', 'failed', 'warning')),
      phase TEXT,
      severity TEXT DEFAULT 'info' CHECK(severity IN ('info', 'low', 'medium', 'high', 'critical')),
      error_message TEXT,
      execution_time REAL DEFAULT 0,
      object_type TEXT,
      source_system TEXT,
      target_system TEXT,
      mapping_type TEXT,
      validation_status TEXT,
      data_quality_score REAL,
      matched_records INTEGER DEFAULT 0,
      unmatched_records INTEGER DEFAULT 0,
      duplicate_records INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Test rules data table
  db.exec(`
    CREATE TABLE IF NOT EXISTS test_rules_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      test_rule_name TEXT NOT NULL,
      sql_condition TEXT,
      pass_count INTEGER DEFAULT 0,
      fail_count INTEGER DEFAULT 0,
      total_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pass', 'fail', 'pending', 'warning')),
      rule_type TEXT,
      severity TEXT DEFAULT 'medium' CHECK(severity IN ('low', 'medium', 'high', 'critical')),
      object_name TEXT,
      description TEXT,
      category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migration runs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS migration_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      status TEXT DEFAULT 'running' CHECK(status IN ('running', 'completed', 'failed', 'cancelled')),
      total_objects INTEGER DEFAULT 0,
      successful_objects INTEGER DEFAULT 0,
      failed_objects INTEGER DEFAULT 0,
      warning_objects INTEGER DEFAULT 0
    )
  `);

  // Notifications table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT DEFAULT 'info' CHECK(type IN ('alert', 'warning', 'info', 'success')),
      title TEXT NOT NULL,
      message TEXT,
      is_read INTEGER DEFAULT 0,
      link TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_reconciliation_status ON reconciliation_data(load_status);
    CREATE INDEX IF NOT EXISTS idx_reconciliation_severity ON reconciliation_data(severity);
    CREATE INDEX IF NOT EXISTS idx_reconciliation_source ON reconciliation_data(source_object);
    CREATE INDEX IF NOT EXISTS idx_test_rules_status ON test_rules_data(status);
    CREATE INDEX IF NOT EXISTS idx_test_rules_type ON test_rules_data(rule_type);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
    CREATE INDEX IF NOT EXISTS idx_dashboards_user ON dashboards(user_id);
    CREATE INDEX IF NOT EXISTS idx_visualizations_user ON visualizations(user_id);
  `);

  console.log('Database initialized successfully');
}

export default db;
