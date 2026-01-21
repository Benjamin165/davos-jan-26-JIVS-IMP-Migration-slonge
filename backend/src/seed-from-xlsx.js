import xlsx from 'xlsx';
import bcrypt from 'bcryptjs';
import db, { initializeDatabase } from './models/database.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration - paths to XLSX files
// Checks both backend/data/ and project root data/ folders
function findXlsxFile(filename) {
  const locations = [
    join(__dirname, '../data', filename),           // backend/data/
    join(__dirname, '../../data', filename),        // project root data/
  ];
  for (const loc of locations) {
    if (fs.existsSync(loc)) return loc;
  }
  return locations[0]; // Return first location for error message
}

const RECON_DATA_FILE = process.env.RECON_XLSX_PATH || findXlsxFile('challenge-1-recon-data.xlsx');
const TESTRULE_DATA_FILE = process.env.TESTRULE_XLSX_PATH || findXlsxFile('challenge-1-testrule-data.xlsx');

// Initialize the database schema first
initializeDatabase();

console.log('Starting database seeding from XLSX files...');
console.log('');

// Helper function to read XLSX file and convert to JSON
function readXlsxFile(filePath, sheetIndex = 0) {
  if (!fs.existsSync(filePath)) {
    console.error(`  ERROR: File not found: ${filePath}`);
    console.error(`  Please place your XLSX files in the backend/data/ folder`);
    return null;
  }

  console.log(`  Reading: ${filePath}`);
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[sheetIndex];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);
  console.log(`  Found ${data.length} rows in sheet "${sheetName}"`);
  return data;
}

// Map XLSX column names to database columns
// Updated to match actual JIVS challenge XLSX structure
const RECON_COLUMN_MAP = {
  // Actual JIVS XLSX columns -> Database columns
  'S_OBJ': 'source_object',
  'S_TAB': 'source_object',          // Source table (alternative)
  'T_OBJ': 'target_object',
  'T_TAB': 'target_object',          // Target table (alternative)
  'S_COUNT_S_TAB': 'source_row_count',
  'T_COUNT_TOTAL': 'target_row_count',
  'T_COUNT_TO_LOAD': 'target_row_count',  // Alternative count
  'TL1_MAP_RULE': 'transformation_rule',
  'TL2_MAP_RULE': 'transformation_rule',  // Alternative rule
  'RR_NAME': 'transformation_rule',       // Recon rule name
  'RC_STATUS': 'load_status',
  'S_DB': 'source_system',
  'T_SYS': 'target_system',
  'TR_COUNT': 'matched_records',
  'TR_COUNT_NOTOK': 'unmatched_records',
  'T_COUNT_JIVS_DEL_MARK': 'duplicate_records',
  'RR_COUNT': 'matched_records',          // Recon rule count
  'RC_COUNT_DATE': 'created_at',
  'RR_DATE': 'created_at',
  'TR_DATE': 'created_at',
  'TL1_DOMAIN_RULE': 'mapping_type',
  'TL2_SETTING': 'validation_status',
  'T_COUNT_FLD': 'data_quality_score',
  'T_COUNT_ACTIVE_MAP': 'execution_time',
  'T_COUNT_MANUAL_EDIT': 'error_message',
  'RR_VERSION': 'phase',
  'TL2_COUNT_CONS': 'severity',
  // Generic fallbacks
  'SourceObject': 'source_object',
  'TargetObject': 'target_object',
  'Status': 'load_status',
};

const TESTRULE_COLUMN_MAP = {
  // Actual JIVS XLSX columns -> Database columns
  'R_NAME': 'test_rule_name',
  'JIVS_TESTING_RULE': 'test_rule_name',   // Testing rule name
  'R_SQL_CODE': 'sql_condition',
  'COUNT_NOTOK': 'fail_count',
  'COUNT_TOTAL': 'total_count',
  'COUNT_DATE': 'created_at',
  'T_SYSTEM': 'category',
  'S_DB': 'category',                       // Source DB as category
  'JIVS_S_OBJECT': 'object_name',
  'JIVS_T_OBJECT': 'description',           // Target object as description
  'T_TABLE': 'object_name',                 // Target table
  'T_FIELD': 'description',                 // Target field as description
  // Generic fallbacks
  'TestRuleName': 'test_rule_name',
  'RuleName': 'test_rule_name',
  'SqlCondition': 'sql_condition',
  'PassCount': 'pass_count',
  'FailCount': 'fail_count',
  'TotalCount': 'total_count',
  'Status': 'status',
  'RuleType': 'rule_type',
  'Severity': 'severity',
  'ObjectName': 'object_name',
  'Description': 'description',
  'Category': 'category',
};

// Map row data using column mapping
function mapRowToDbColumns(row, columnMap) {
  const mapped = {};
  for (const [xlsxCol, dbCol] of Object.entries(columnMap)) {
    if (row[xlsxCol] !== undefined) {
      mapped[dbCol] = row[xlsxCol];
    }
  }
  return mapped;
}

// Normalize status values to match database constraints
function normalizeStatus(status, allowedValues, defaultValue) {
  if (!status) return defaultValue;
  const normalized = String(status).toLowerCase().trim();
  if (allowedValues.includes(normalized)) return normalized;
  // Try common mappings
  const mappings = {
    'success': 'completed',
    'passed': 'pass',
    'done': 'completed',
    'error': 'failed',
    'warn': 'warning',
  };
  return mappings[normalized] || defaultValue;
}

// Create admin and regular users
async function seedUsers() {
  console.log('Seeding users...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  try {
    db.prepare(`
      INSERT OR REPLACE INTO users (id, email, password_hash, name, role, theme_preference, notification_settings)
      VALUES (1, 'admin@jivs.com', ?, 'Admin User', 'admin', 'dark', '{"email": true, "push": true, "alerts": true}')
    `).run(adminPassword);

    db.prepare(`
      INSERT OR REPLACE INTO users (id, email, password_hash, name, role, theme_preference, notification_settings)
      VALUES (2, 'user@jivs.com', ?, 'Demo User', 'user', 'dark', '{"email": true, "push": false, "alerts": true}')
    `).run(userPassword);

    console.log('  - Created admin@jivs.com (password: admin123)');
    console.log('  - Created user@jivs.com (password: user123)');
  } catch (error) {
    console.log('  - Users already exist, skipping...');
  }
}

// Create default dashboards
function seedDashboards() {
  console.log('Seeding dashboards...');

  const dashboards = [
    { userId: 1, name: 'Admin Overview', isDefault: 1 },
    { userId: 2, name: 'My Dashboard', isDefault: 1 },
    { userId: 2, name: 'Test Rules Analysis', isDefault: 0 }
  ];

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO dashboards (user_id, name, is_default, layout)
    VALUES (?, ?, ?, '[]')
  `);

  for (const d of dashboards) {
    stmt.run(d.userId, d.name, d.isDefault);
  }

  console.log(`  - Created ${dashboards.length} dashboards`);
}

// Seed reconciliation data from XLSX
function seedReconciliationData() {
  console.log('Seeding reconciliation data from XLSX...');

  const data = readXlsxFile(RECON_DATA_FILE);
  if (!data || data.length === 0) {
    console.log('  - No reconciliation data found, skipping...');
    console.log('  - To use mock XLSX data, place your file at:');
    console.log(`    ${RECON_DATA_FILE}`);
    return;
  }

  // Clear existing data
  db.prepare('DELETE FROM reconciliation_data').run();
  console.log('  - Cleared existing reconciliation data');

  // Print first row keys to help with debugging column mapping
  if (data.length > 0) {
    console.log('  - XLSX columns found:', Object.keys(data[0]).join(', '));
  }

  const allowedStatuses = ['pending', 'running', 'completed', 'failed', 'warning'];
  const allowedSeverities = ['info', 'low', 'medium', 'high', 'critical'];

  const stmt = db.prepare(`
    INSERT INTO reconciliation_data (
      source_object, target_object, source_row_count, target_row_count,
      transformation_rule, load_status, phase, severity, error_message,
      execution_time, object_type, source_system, target_system,
      mapping_type, validation_status, data_quality_score,
      matched_records, unmatched_records, duplicate_records
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction(() => {
    for (const row of data) {
      const mapped = mapRowToDbColumns(row, RECON_COLUMN_MAP);

      // Parse numeric values
      const sourceCount = parseInt(mapped.source_row_count) || 0;
      const targetCount = parseInt(mapped.target_row_count) || 0;
      const matchedRecords = parseInt(mapped.matched_records) || 0;
      const unmatchedRecords = parseInt(mapped.unmatched_records) || 0;

      // Derive status if not set or if RC_STATUS contains custom values
      let status = mapped.load_status;
      if (!status || !allowedStatuses.includes(String(status).toLowerCase())) {
        // Try to derive from unmatched records or row count comparison
        if (unmatchedRecords > 0) {
          status = unmatchedRecords > matchedRecords ? 'failed' : 'warning';
        } else if (sourceCount > 0 && targetCount > 0) {
          const diff = Math.abs(sourceCount - targetCount);
          if (diff === 0) status = 'completed';
          else if (diff / sourceCount > 0.1) status = 'failed';
          else status = 'warning';
        } else {
          status = 'pending';
        }
      }

      // Derive severity from unmatched ratio if not set
      let severity = mapped.severity;
      if (!severity || !allowedSeverities.includes(String(severity).toLowerCase())) {
        const total = matchedRecords + unmatchedRecords;
        if (total > 0) {
          const unmatchedRatio = unmatchedRecords / total;
          if (unmatchedRatio > 0.5) severity = 'critical';
          else if (unmatchedRatio > 0.2) severity = 'high';
          else if (unmatchedRatio > 0.05) severity = 'medium';
          else if (unmatchedRatio > 0) severity = 'low';
          else severity = 'info';
        } else {
          severity = 'info';
        }
      }

      stmt.run(
        mapped.source_object || null,
        mapped.target_object || null,
        sourceCount,
        targetCount,
        mapped.transformation_rule || null,
        normalizeStatus(status, allowedStatuses, 'pending'),
        mapped.phase || null,
        normalizeStatus(severity, allowedSeverities, 'info'),
        mapped.error_message || null,
        parseFloat(mapped.execution_time) || 0,
        mapped.object_type || null,
        mapped.source_system || null,
        mapped.target_system || null,
        mapped.mapping_type || null,
        mapped.validation_status || null,
        parseFloat(mapped.data_quality_score) || null,
        matchedRecords,
        unmatchedRecords,
        parseInt(mapped.duplicate_records) || 0
      );
    }
  });

  insertMany();
  console.log(`  - Imported ${data.length} reconciliation records from XLSX`);
}

// Seed test rules data from XLSX
function seedTestRulesData() {
  console.log('Seeding test rules data from XLSX...');

  const data = readXlsxFile(TESTRULE_DATA_FILE);
  if (!data || data.length === 0) {
    console.log('  - No test rules data found, skipping...');
    console.log('  - To use mock XLSX data, place your file at:');
    console.log(`    ${TESTRULE_DATA_FILE}`);
    return;
  }

  // Clear existing data
  db.prepare('DELETE FROM test_rules_data').run();
  console.log('  - Cleared existing test rules data');

  // Print first row keys to help with debugging column mapping
  if (data.length > 0) {
    console.log('  - XLSX columns found:', Object.keys(data[0]).join(', '));
  }

  const allowedStatuses = ['pass', 'fail', 'pending', 'warning'];
  const allowedSeverities = ['low', 'medium', 'high', 'critical'];

  const stmt = db.prepare(`
    INSERT INTO test_rules_data (
      test_rule_name, sql_condition, pass_count, fail_count, total_count,
      status, rule_type, severity, object_name, description, category
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction(() => {
    for (const row of data) {
      const mapped = mapRowToDbColumns(row, TESTRULE_COLUMN_MAP);

      // Calculate pass_count from total - fail if not provided
      const totalCount = parseInt(mapped.total_count) || 0;
      const failCount = parseInt(mapped.fail_count) || 0;
      const passCount = mapped.pass_count ? parseInt(mapped.pass_count) : (totalCount - failCount);

      // Determine status from fail_count if not explicitly set
      let status = mapped.status;
      if (!status) {
        if (failCount === 0 && totalCount > 0) status = 'pass';
        else if (failCount > 0) status = 'fail';
        else status = 'pending';
      }

      // Determine severity based on fail ratio if not set
      let severity = mapped.severity;
      if (!severity && totalCount > 0) {
        const failRatio = failCount / totalCount;
        if (failRatio > 0.5) severity = 'critical';
        else if (failRatio > 0.2) severity = 'high';
        else if (failRatio > 0.05) severity = 'medium';
        else severity = 'low';
      }

      stmt.run(
        mapped.test_rule_name || `Rule_${Math.random().toString(36).substr(2, 9)}`,
        mapped.sql_condition || null,
        passCount,
        failCount,
        totalCount,
        normalizeStatus(status, allowedStatuses, 'pending'),
        mapped.rule_type || null,
        normalizeStatus(severity, allowedSeverities, 'medium'),
        mapped.object_name || null,
        mapped.description || null,
        mapped.category || null
      );
    }
  });

  insertMany();
  console.log(`  - Imported ${data.length} test rule records from XLSX`);
}

// Seed migration runs
function seedMigrationRuns() {
  console.log('Seeding migration runs...');

  // Get counts from imported data
  const reconCount = db.prepare('SELECT COUNT(*) as count FROM reconciliation_data').get();
  const completedCount = db.prepare("SELECT COUNT(*) as count FROM reconciliation_data WHERE load_status = 'completed'").get();
  const failedCount = db.prepare("SELECT COUNT(*) as count FROM reconciliation_data WHERE load_status = 'failed'").get();
  const warningCount = db.prepare("SELECT COUNT(*) as count FROM reconciliation_data WHERE load_status = 'warning'").get();

  const runs = [
    {
      name: 'Current Run (from XLSX)',
      status: 'completed',
      total: reconCount.count,
      success: completedCount.count,
      failed: failedCount.count,
      warning: warningCount.count
    }
  ];

  // Clear existing runs
  db.prepare('DELETE FROM migration_runs').run();

  const stmt = db.prepare(`
    INSERT INTO migration_runs (name, started_at, completed_at, status, total_objects, successful_objects, failed_objects, warning_objects)
    VALUES (?, datetime('now', '-1 hour'), datetime('now'), ?, ?, ?, ?, ?)
  `);

  for (const run of runs) {
    stmt.run(run.name, run.status, run.total, run.success, run.failed, run.warning);
  }

  console.log(`  - Created ${runs.length} migration run(s) based on imported data`);
}

// Seed visualization templates
function seedVisualizationTemplates() {
  console.log('Seeding visualization templates...');

  const templates = [
    {
      name: 'Status Distribution',
      type: 'pie',
      config: {
        dataSource: 'reconciliation',
        groupBy: 'load_status',
        title: 'Migration Status Distribution',
        category: 'Status'
      }
    },
    {
      name: 'Severity Breakdown',
      type: 'bar',
      config: {
        dataSource: 'reconciliation',
        groupBy: 'severity',
        title: 'Issues by Severity',
        category: 'Analysis'
      }
    },
    {
      name: 'Test Rule Results',
      type: 'donut',
      config: {
        dataSource: 'test_rules',
        groupBy: 'status',
        title: 'Test Rule Pass/Fail Rate',
        category: 'Testing'
      }
    },
    {
      name: 'Objects by Type',
      type: 'bar',
      config: {
        dataSource: 'reconciliation',
        groupBy: 'object_type',
        title: 'Objects by Type',
        category: 'Overview'
      }
    },
    {
      name: 'Phase Progress',
      type: 'area',
      config: {
        dataSource: 'reconciliation',
        groupBy: 'phase',
        title: 'Migration Phase Progress',
        category: 'Progress'
      }
    }
  ];

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO visualizations (user_id, name, type, config, is_template, is_system_template)
    VALUES (1, ?, ?, ?, 1, 1)
  `);

  for (const t of templates) {
    stmt.run(t.name, t.type, JSON.stringify(t.config));
  }

  console.log(`  - Created ${templates.length} visualization templates`);
}

// Seed sample notifications
function seedNotifications() {
  console.log('Seeding notifications...');

  // Get stats from imported data for dynamic notifications
  const failedCount = db.prepare("SELECT COUNT(*) as count FROM reconciliation_data WHERE load_status = 'failed'").get();
  const criticalCount = db.prepare("SELECT COUNT(*) as count FROM reconciliation_data WHERE severity = 'critical'").get();
  const totalCount = db.prepare("SELECT COUNT(*) as count FROM reconciliation_data").get();
  const completedCount = db.prepare("SELECT COUNT(*) as count FROM reconciliation_data WHERE load_status = 'completed'").get();

  const successRate = totalCount.count > 0 ? Math.round((completedCount.count / totalCount.count) * 100) : 0;

  const notifications = [
    {
      userId: 2,
      type: criticalCount.count > 0 ? 'alert' : 'info',
      title: `${criticalCount.count} Critical Issues Detected`,
      message: 'Review critical items in the reconciliation dashboard.'
    },
    {
      userId: 2,
      type: 'info',
      title: 'XLSX Data Imported',
      message: `Successfully loaded ${totalCount.count} reconciliation records from XLSX files.`
    },
    {
      userId: 2,
      type: successRate >= 80 ? 'success' : 'warning',
      title: `Migration ${successRate}% Complete`,
      message: `${completedCount.count} of ${totalCount.count} objects processed successfully.`
    }
  ];

  // Clear old notifications
  db.prepare('DELETE FROM notifications').run();

  const stmt = db.prepare(`
    INSERT INTO notifications (user_id, type, title, message)
    VALUES (?, ?, ?, ?)
  `);

  for (const n of notifications) {
    stmt.run(n.userId, n.type, n.title, n.message);
  }

  console.log(`  - Created ${notifications.length} notifications`);
}

// Run all seed functions
async function seed() {
  try {
    console.log('='.repeat(60));
    console.log('XLSX Data Import for JIVS IMP Migration Visual Companion');
    console.log('='.repeat(60));
    console.log('');
    console.log('Expected XLSX file locations:');
    console.log(`  - Reconciliation: ${RECON_DATA_FILE}`);
    console.log(`  - Test Rules:     ${TESTRULE_DATA_FILE}`);
    console.log('');
    console.log('(You can override paths with environment variables:');
    console.log('  RECON_XLSX_PATH and TESTRULE_XLSX_PATH)');
    console.log('');

    await seedUsers();
    seedDashboards();
    seedReconciliationData();
    seedTestRulesData();
    seedMigrationRuns();
    seedVisualizationTemplates();
    seedNotifications();

    console.log('');
    console.log('='.repeat(60));
    console.log('Database seeding from XLSX completed!');
    console.log('='.repeat(60));
    console.log('');
    console.log('Default credentials:');
    console.log('  Admin: admin@jivs.com / admin123');
    console.log('  User:  user@jivs.com / user123');
    console.log('');
    console.log('Start the backend with: npm run dev');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
