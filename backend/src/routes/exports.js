import express from 'express';
import db from '../models/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Export to CSV
router.post('/csv', authenticateToken, (req, res, next) => {
  try {
    const { data_type = 'reconciliation', filters = {} } = req.body;

    let data;
    let columns;

    if (data_type === 'reconciliation') {
      let query = 'SELECT * FROM reconciliation_data';
      const conditions = [];
      const params = [];

      if (filters.status) {
        conditions.push('load_status = ?');
        params.push(filters.status);
      }
      if (filters.severity) {
        conditions.push('severity = ?');
        params.push(filters.severity);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      data = db.prepare(query).all(...params);
      columns = ['id', 'source_object', 'target_object', 'source_row_count', 'target_row_count', 'load_status', 'severity', 'phase', 'error_message', 'created_at'];

    } else if (data_type === 'test_rules') {
      let query = 'SELECT * FROM test_rules_data';
      const conditions = [];
      const params = [];

      if (filters.status) {
        conditions.push('status = ?');
        params.push(filters.status);
      }
      if (filters.rule_type) {
        conditions.push('rule_type = ?');
        params.push(filters.rule_type);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      data = db.prepare(query).all(...params);
      columns = ['id', 'test_rule_name', 'sql_condition', 'pass_count', 'fail_count', 'total_count', 'status', 'severity', 'rule_type', 'object_name', 'created_at'];

    } else {
      return res.status(400).json({ error: 'Invalid data_type. Must be reconciliation or test_rules' });
    }

    // Generate CSV
    const csvRows = [];

    // Header row
    csvRows.push(columns.join(','));

    // Data rows
    for (const row of data) {
      const values = columns.map(col => {
        let val = row[col];
        if (val === null || val === undefined) {
          return '';
        }
        // Escape quotes and wrap in quotes if contains comma or quote
        val = String(val);
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          val = '"' + val.replace(/"/g, '""') + '"';
        }
        return val;
      });
      csvRows.push(values.join(','));
    }

    const csv = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${data_type}_export_${Date.now()}.csv`);
    res.send(csv);

  } catch (error) {
    next(error);
  }
});

// Export to JSON
router.post('/json', authenticateToken, (req, res, next) => {
  try {
    const { data_type = 'reconciliation', filters = {} } = req.body;

    let data;

    if (data_type === 'reconciliation') {
      let query = 'SELECT * FROM reconciliation_data';
      const conditions = [];
      const params = [];

      if (filters.status) {
        conditions.push('load_status = ?');
        params.push(filters.status);
      }
      if (filters.severity) {
        conditions.push('severity = ?');
        params.push(filters.severity);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      data = db.prepare(query).all(...params);

    } else if (data_type === 'test_rules') {
      let query = 'SELECT * FROM test_rules_data';
      const conditions = [];
      const params = [];

      if (filters.status) {
        conditions.push('status = ?');
        params.push(filters.status);
      }
      if (filters.rule_type) {
        conditions.push('rule_type = ?');
        params.push(filters.rule_type);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      data = db.prepare(query).all(...params);

    } else {
      return res.status(400).json({ error: 'Invalid data_type' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${data_type}_export_${Date.now()}.json`);
    res.json({
      exportedAt: new Date().toISOString(),
      dataType: data_type,
      filters,
      totalRecords: data.length,
      data
    });

  } catch (error) {
    next(error);
  }
});

// Export to PDF (returns HTML that can be printed/saved as PDF)
router.post('/pdf', authenticateToken, (req, res, next) => {
  try {
    const { data_type = 'reconciliation', filters = {}, title = 'Data Export' } = req.body;

    let data;
    let columns;
    let columnLabels;

    if (data_type === 'reconciliation') {
      let query = 'SELECT * FROM reconciliation_data';
      const conditions = [];
      const params = [];

      if (filters.status) {
        conditions.push('load_status = ?');
        params.push(filters.status);
      }
      if (filters.severity) {
        conditions.push('severity = ?');
        params.push(filters.severity);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' LIMIT 1000'; // Limit for PDF

      data = db.prepare(query).all(...params);
      columns = ['source_object', 'target_object', 'load_status', 'severity', 'error_message'];
      columnLabels = ['Source Object', 'Target Object', 'Status', 'Severity', 'Error'];

    } else if (data_type === 'test_rules') {
      let query = 'SELECT * FROM test_rules_data';
      const conditions = [];
      const params = [];

      if (filters.status) {
        conditions.push('status = ?');
        params.push(filters.status);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' LIMIT 1000';

      data = db.prepare(query).all(...params);
      columns = ['test_rule_name', 'status', 'severity', 'pass_count', 'fail_count'];
      columnLabels = ['Rule Name', 'Status', 'Severity', 'Passed', 'Failed'];

    } else {
      return res.status(400).json({ error: 'Invalid data_type' });
    }

    // Generate HTML report
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #1e293b; }
    .meta { color: #64748b; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #3b82f6; color: white; padding: 10px; text-align: left; }
    td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
    tr:nth-child(even) { background: #f8fafc; }
    .status-completed, .status-pass { color: #10b981; }
    .status-failed, .status-fail { color: #ef4444; }
    .status-warning { color: #f59e0b; }
    .severity-critical { color: #ef4444; font-weight: bold; }
    .severity-high { color: #f59e0b; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="meta">
    <p>Exported: ${new Date().toLocaleString()}</p>
    <p>Total Records: ${data.length}</p>
    ${Object.entries(filters).map(([k, v]) => v ? `<p>Filter: ${k} = ${v}</p>` : '').join('')}
  </div>
  <table>
    <thead>
      <tr>
        ${columnLabels.map(label => `<th>${label}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${data.map(row => `
        <tr>
          ${columns.map(col => {
            let val = row[col] || '';
            let className = '';
            if (col === 'load_status' || col === 'status') {
              className = `status-${val}`;
            }
            if (col === 'severity') {
              className = `severity-${val}`;
            }
            return `<td class="${className}">${val}</td>`;
          }).join('')}
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);

  } catch (error) {
    next(error);
  }
});

export default router;
