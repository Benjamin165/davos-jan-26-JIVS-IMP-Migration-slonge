import bcrypt from 'bcryptjs';
import db, { initializeDatabase } from './models/database.js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize the database schema first
initializeDatabase();

console.log('Starting database seeding...');

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

// Seed reconciliation data (mock data simulating migration results)
function seedReconciliationData() {
  console.log('Seeding reconciliation data...');

  const objectTypes = ['Table', 'View', 'Procedure', 'Function', 'Index', 'Sequence', 'Trigger'];
  const statuses = ['completed', 'completed', 'completed', 'completed', 'failed', 'running', 'pending', 'warning'];
  const severities = ['info', 'info', 'low', 'medium', 'high', 'critical'];
  const phases = ['Extract', 'Transform', 'Load', 'Validate', 'Reconcile'];
  const sourceObjects = [
    'ANAMBANK', 'ANACUSTOMER', 'BATCHES', 'TRANSACTIONS', 'ACCOUNTS', 'LOANS',
    'DEPOSITS', 'TRANSFERS', 'PAYMENTS', 'CARDS', 'CUSTOMERS', 'BRANCHES',
    'EMPLOYEES', 'PRODUCTS', 'SERVICES', 'CONTRACTS', 'DOCUMENTS', 'AUDITS',
    'REPORTS', 'NOTIFICATIONS', 'SCHEDULES', 'ALERTS', 'LOGS', 'CONFIGS'
  ];

  const errorMessages = [
    null, null, null, null, null, // Most successful
    'Data type mismatch in column transformation',
    'Foreign key constraint violation',
    'Duplicate key error during load',
    'Null value in non-nullable column',
    'Row count mismatch after transformation',
    'Connection timeout during data transfer',
    'Invalid date format encountered',
    'Maximum column length exceeded'
  ];

  const count = 3976; // As specified in the spec
  const stmt = db.prepare(`
    INSERT INTO reconciliation_data (
      source_object, target_object, source_row_count, target_row_count,
      transformation_rule, load_status, phase, severity, error_message,
      execution_time, object_type, source_system, target_system,
      matched_records, unmatched_records, data_quality_score
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction(() => {
    for (let i = 0; i < count; i++) {
      const sourceObj = sourceObjects[Math.floor(Math.random() * sourceObjects.length)];
      const suffix = `_${String(i).padStart(4, '0')}`;
      const sourceRowCount = Math.floor(Math.random() * 100000);
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const targetRowCount = status === 'completed' ? sourceRowCount : Math.floor(sourceRowCount * (0.9 + Math.random() * 0.1));
      const severity = status === 'failed' || status === 'warning'
        ? severities[Math.floor(Math.random() * severities.length)]
        : 'info';
      const errorMsg = status === 'failed' || status === 'warning'
        ? errorMessages[Math.floor(Math.random() * errorMessages.length)]
        : null;

      stmt.run(
        sourceObj + suffix,
        'TGT_' + sourceObj + suffix,
        sourceRowCount,
        targetRowCount,
        `TR_${sourceObj}_RULE`,
        status,
        phases[Math.floor(Math.random() * phases.length)],
        severity,
        errorMsg,
        (Math.random() * 120).toFixed(2),
        objectTypes[Math.floor(Math.random() * objectTypes.length)],
        'SOURCE_DB',
        'TARGET_DB',
        Math.floor(targetRowCount * 0.95),
        Math.floor(targetRowCount * 0.05),
        (0.6 + Math.random() * 0.4).toFixed(2)
      );
    }
  });

  insertMany();
  console.log(`  - Created ${count} reconciliation records`);
}

// Seed test rules data
function seedTestRulesData() {
  console.log('Seeding test rules data...');

  const ruleTypes = ['NOT NULL', 'FORMAT', 'RANGE', 'REFERENCE', 'UNIQUE', 'BUSINESS'];
  const statuses = ['pass', 'pass', 'pass', 'pass', 'fail', 'warning', 'pending'];
  const severities = ['low', 'medium', 'medium', 'high', 'critical'];
  const categories = ['Data Integrity', 'Format Validation', 'Business Rules', 'Referential Integrity', 'Uniqueness'];
  const objects = [
    'CUSTOMER', 'ACCOUNT', 'TRANSACTION', 'LOAN', 'DEPOSIT', 'PAYMENT',
    'CARD', 'BRANCH', 'EMPLOYEE', 'PRODUCT', 'CONTRACT'
  ];

  const ruleTemplates = [
    { name: 'NOT_NULL_CHECK', sql: 'SELECT COUNT(*) FROM {obj} WHERE {col} IS NULL', type: 'NOT NULL' },
    { name: 'EMAIL_FORMAT', sql: 'SELECT COUNT(*) FROM {obj} WHERE email NOT LIKE "%@%.%"', type: 'FORMAT' },
    { name: 'DATE_RANGE', sql: 'SELECT COUNT(*) FROM {obj} WHERE created_date < "2000-01-01"', type: 'RANGE' },
    { name: 'FK_CHECK', sql: 'SELECT COUNT(*) FROM {obj} a WHERE NOT EXISTS (SELECT 1 FROM {ref})', type: 'REFERENCE' },
    { name: 'UNIQUE_CHECK', sql: 'SELECT {col}, COUNT(*) FROM {obj} GROUP BY {col} HAVING COUNT(*) > 1', type: 'UNIQUE' },
    { name: 'AMOUNT_POSITIVE', sql: 'SELECT COUNT(*) FROM {obj} WHERE amount <= 0', type: 'BUSINESS' }
  ];

  const columns = ['id', 'name', 'email', 'phone', 'address', 'date', 'amount', 'status', 'type', 'code'];

  const count = 4399; // As specified in the spec
  const stmt = db.prepare(`
    INSERT INTO test_rules_data (
      test_rule_name, sql_condition, pass_count, fail_count, total_count,
      status, rule_type, severity, object_name, description, category
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction(() => {
    for (let i = 0; i < count; i++) {
      const obj = objects[Math.floor(Math.random() * objects.length)];
      const col = columns[Math.floor(Math.random() * columns.length)];
      const template = ruleTemplates[Math.floor(Math.random() * ruleTemplates.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      const totalCount = Math.floor(Math.random() * 10000) + 100;
      let passCount, failCount;

      if (status === 'pass') {
        passCount = totalCount;
        failCount = 0;
      } else if (status === 'fail') {
        failCount = Math.floor(Math.random() * (totalCount * 0.3)) + 1;
        passCount = totalCount - failCount;
      } else {
        failCount = Math.floor(Math.random() * 10);
        passCount = totalCount - failCount;
      }

      stmt.run(
        `${template.name}_${obj}_${col}_${i}`,
        template.sql.replace('{obj}', obj).replace('{col}', col).replace('{ref}', objects[0]),
        passCount,
        failCount,
        totalCount,
        status,
        template.type,
        severities[Math.floor(Math.random() * severities.length)],
        obj,
        `Validates ${template.type.toLowerCase()} constraint on ${obj}.${col}`,
        categories[Math.floor(Math.random() * categories.length)]
      );
    }
  });

  insertMany();
  console.log(`  - Created ${count} test rule records`);
}

// Seed migration runs for comparison feature
function seedMigrationRuns() {
  console.log('Seeding migration runs...');

  const runs = [
    { name: 'Initial Migration Run', status: 'completed', total: 3500, success: 3000, failed: 350, warning: 150 },
    { name: 'Second Migration Run', status: 'completed', total: 3600, success: 3200, failed: 280, warning: 120 },
    { name: 'Third Migration Run', status: 'completed', total: 3800, success: 3500, failed: 200, warning: 100 },
    { name: 'Current Run', status: 'running', total: 3976, success: 3600, failed: 250, warning: 126 }
  ];

  const stmt = db.prepare(`
    INSERT INTO migration_runs (name, started_at, completed_at, status, total_objects, successful_objects, failed_objects, warning_objects)
    VALUES (?, datetime('now', ?), ?, ?, ?, ?, ?, ?)
  `);

  runs.forEach((run, idx) => {
    const daysAgo = `-${(runs.length - idx) * 7} days`;
    const completedAt = run.status === 'completed' ? `datetime('now', '${daysAgo}', '+2 hours')` : null;

    stmt.run(
      run.name,
      daysAgo,
      run.status === 'completed' ? new Date(Date.now() - (runs.length - idx) * 7 * 24 * 60 * 60 * 1000).toISOString() : null,
      run.status,
      run.total,
      run.success,
      run.failed,
      run.warning
    );
  });

  console.log(`  - Created ${runs.length} migration runs`);
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
    INSERT INTO visualizations (user_id, name, type, config, is_template, is_system_template)
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

  const notifications = [
    { userId: 2, type: 'alert', title: '47 Critical Failures Detected', message: 'Review critical items in the reconciliation dashboard.' },
    { userId: 2, type: 'warning', title: 'Migration Run Approaching Deadline', message: 'Current run is 78% complete with 22% remaining.' },
    { userId: 2, type: 'info', title: 'New AI Recommendations Available', message: 'Based on recent patterns, we have suggestions to improve success rate.' },
    { userId: 2, type: 'success', title: 'Previous Run Completed Successfully', message: 'Migration run completed with 89% success rate.' }
  ];

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
    await seedUsers();
    seedDashboards();
    seedReconciliationData();
    seedTestRulesData();
    seedMigrationRuns();
    seedVisualizationTemplates();
    seedNotifications();

    console.log('\nDatabase seeding completed successfully!');
    console.log('\nDefault credentials:');
    console.log('  Admin: admin@jivs.com / admin123');
    console.log('  User:  user@jivs.com / user123');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
