import express from 'express';
import db from '../models/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get test rules with filtering and pagination
router.get('/', authenticateToken, (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      severity,
      rule_type,
      category,
      failed_only,
      sort_by = 'id',
      sort_order = 'asc'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereConditions = [];
    let params = [];

    if (search) {
      whereConditions.push('(test_rule_name LIKE ? OR object_name LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      whereConditions.push('status = ?');
      params.push(status);
    }

    if (severity) {
      whereConditions.push('severity = ?');
      params.push(severity);
    }

    if (rule_type) {
      whereConditions.push('rule_type = ?');
      params.push(rule_type);
    }

    if (category) {
      whereConditions.push('category = ?');
      params.push(category);
    }

    if (failed_only === 'true') {
      whereConditions.push('status = "fail"');
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Validate sort columns
    const validSortColumns = ['id', 'test_rule_name', 'status', 'severity', 'pass_count', 'fail_count', 'total_count', 'rule_type'];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'id';
    const sortDirection = sort_order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    // Get total count
    const { total } = db.prepare(`SELECT COUNT(*) as total FROM test_rules_data ${whereClause}`).get(...params);

    // Get paginated data
    const data = db.prepare(`
      SELECT * FROM test_rules_data
      ${whereClause}
      ORDER BY ${sortColumn} ${sortDirection}
      LIMIT ? OFFSET ?
    `).all(...params, parseInt(limit), offset);

    res.json({
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get failures only (prominently displayed)
router.get('/failures', authenticateToken, (req, res, next) => {
  try {
    const { limit = 50, severity } = req.query;

    let query = `
      SELECT * FROM test_rules_data
      WHERE status = 'fail'
    `;
    const params = [];

    if (severity) {
      query += ' AND severity = ?';
      params.push(severity);
    }

    query += `
      ORDER BY CASE severity
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        ELSE 4
      END, fail_count DESC
      LIMIT ?
    `;
    params.push(parseInt(limit));

    const failures = db.prepare(query).all(...params);

    const { total } = db.prepare("SELECT COUNT(*) as total FROM test_rules_data WHERE status = 'fail'").get();

    res.json({
      failures,
      totalFailures: total
    });
  } catch (error) {
    next(error);
  }
});

// Get summary statistics
router.get('/summary', authenticateToken, (req, res, next) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as count FROM test_rules_data').get().count;
    const passed = db.prepare("SELECT COUNT(*) as count FROM test_rules_data WHERE status = 'pass'").get().count;
    const failed = db.prepare("SELECT COUNT(*) as count FROM test_rules_data WHERE status = 'fail'").get().count;
    const warnings = db.prepare("SELECT COUNT(*) as count FROM test_rules_data WHERE status = 'warning'").get().count;
    const pending = db.prepare("SELECT COUNT(*) as count FROM test_rules_data WHERE status = 'pending'").get().count;

    // Aggregated counts
    const { total_pass_count } = db.prepare('SELECT SUM(pass_count) as total_pass_count FROM test_rules_data').get();
    const { total_fail_count } = db.prepare('SELECT SUM(fail_count) as total_fail_count FROM test_rules_data').get();

    // By rule type
    const byRuleType = db.prepare(`
      SELECT rule_type, COUNT(*) as rule_count,
             SUM(CASE WHEN status = 'pass' THEN 1 ELSE 0 END) as passed,
             SUM(CASE WHEN status = 'fail' THEN 1 ELSE 0 END) as failed
      FROM test_rules_data
      WHERE rule_type IS NOT NULL
      GROUP BY rule_type
      ORDER BY failed DESC
    `).all();

    // By category
    const byCategory = db.prepare(`
      SELECT category, COUNT(*) as count,
             SUM(CASE WHEN status = 'pass' THEN 1 ELSE 0 END) as passed,
             SUM(CASE WHEN status = 'fail' THEN 1 ELSE 0 END) as failed
      FROM test_rules_data
      WHERE category IS NOT NULL
      GROUP BY category
      ORDER BY failed DESC
    `).all();

    // By severity
    const bySeverity = db.prepare(`
      SELECT severity, COUNT(*) as count,
             SUM(CASE WHEN status = 'fail' THEN 1 ELSE 0 END) as failed
      FROM test_rules_data
      GROUP BY severity
      ORDER BY CASE severity
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        ELSE 4
      END
    `).all();

    const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;

    res.json({
      total,
      passed,
      failed,
      warnings,
      pending,
      passRate: parseFloat(passRate),
      totalPassCount: total_pass_count || 0,
      totalFailCount: total_fail_count || 0,
      byRuleType,
      byCategory,
      bySeverity
    });
  } catch (error) {
    next(error);
  }
});

// Get single rule
router.get('/:id', authenticateToken, (req, res, next) => {
  try {
    const { id } = req.params;

    const rule = db.prepare('SELECT * FROM test_rules_data WHERE id = ?').get(id);

    if (!rule) {
      return res.status(404).json({ error: 'Test rule not found' });
    }

    // Get related rules (same object or rule type)
    const related = db.prepare(`
      SELECT id, test_rule_name, status, severity, fail_count
      FROM test_rules_data
      WHERE (object_name = ? OR rule_type = ?) AND id != ?
      LIMIT 5
    `).all(rule.object_name, rule.rule_type, id);

    res.json({
      ...rule,
      related
    });
  } catch (error) {
    next(error);
  }
});

// Get grouped by rule type (for collapsible sections)
router.get('/grouped/by-type', authenticateToken, (req, res, next) => {
  try {
    const ruleTypes = db.prepare('SELECT DISTINCT rule_type FROM test_rules_data WHERE rule_type IS NOT NULL ORDER BY rule_type').all();

    const grouped = ruleTypes.map(({ rule_type }) => {
      const rules = db.prepare(`
        SELECT id, test_rule_name, status, severity, pass_count, fail_count, object_name
        FROM test_rules_data
        WHERE rule_type = ?
        ORDER BY CASE status WHEN 'fail' THEN 0 ELSE 1 END, fail_count DESC
      `).all(rule_type);

      const summary = {
        total: rules.length,
        passed: rules.filter(r => r.status === 'pass').length,
        failed: rules.filter(r => r.status === 'fail').length
      };

      return {
        rule_type,
        summary,
        rules
      };
    });

    res.json({ grouped });
  } catch (error) {
    next(error);
  }
});

// Get filter options
router.get('/filters/options', authenticateToken, (req, res, next) => {
  try {
    const statuses = db.prepare('SELECT DISTINCT status FROM test_rules_data WHERE status IS NOT NULL ORDER BY status').all();
    const severities = db.prepare('SELECT DISTINCT severity FROM test_rules_data WHERE severity IS NOT NULL ORDER BY severity').all();
    const ruleTypes = db.prepare('SELECT DISTINCT rule_type FROM test_rules_data WHERE rule_type IS NOT NULL ORDER BY rule_type').all();
    const categories = db.prepare('SELECT DISTINCT category FROM test_rules_data WHERE category IS NOT NULL ORDER BY category').all();

    res.json({
      statuses: statuses.map(s => s.status),
      severities: severities.map(s => s.severity),
      ruleTypes: ruleTypes.map(r => r.rule_type),
      categories: categories.map(c => c.category)
    });
  } catch (error) {
    next(error);
  }
});

export default router;
