import express from 'express';
import db from '../models/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get reconciliation data with filtering, sorting, and pagination
router.get('/', authenticateToken, (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      severity,
      phase,
      object_type,
      sort_by = 'id',
      sort_order = 'asc'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereConditions = [];
    let params = [];

    if (search) {
      whereConditions.push('(source_object LIKE ? OR target_object LIKE ? OR error_message LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      whereConditions.push('load_status = ?');
      params.push(status);
    }

    if (severity) {
      whereConditions.push('severity = ?');
      params.push(severity);
    }

    if (phase) {
      whereConditions.push('phase = ?');
      params.push(phase);
    }

    if (object_type) {
      whereConditions.push('object_type = ?');
      params.push(object_type);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Validate sort columns
    const validSortColumns = ['id', 'source_object', 'target_object', 'load_status', 'severity', 'phase', 'execution_time', 'created_at'];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'id';
    const sortDirection = sort_order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    // Get total count
    const { total } = db.prepare(`SELECT COUNT(*) as total FROM reconciliation_data ${whereClause}`).get(...params);

    // Get paginated data
    const data = db.prepare(`
      SELECT * FROM reconciliation_data
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
      },
      filters: {
        search,
        status,
        severity,
        phase,
        object_type
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get summary statistics
router.get('/summary', authenticateToken, (req, res, next) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as count FROM reconciliation_data').get().count;
    const completed = db.prepare("SELECT COUNT(*) as count FROM reconciliation_data WHERE load_status = 'completed'").get().count;
    const failed = db.prepare("SELECT COUNT(*) as count FROM reconciliation_data WHERE load_status = 'failed'").get().count;
    const running = db.prepare("SELECT COUNT(*) as count FROM reconciliation_data WHERE load_status = 'running'").get().count;
    const pending = db.prepare("SELECT COUNT(*) as count FROM reconciliation_data WHERE load_status = 'pending'").get().count;
    const warnings = db.prepare("SELECT COUNT(*) as count FROM reconciliation_data WHERE load_status = 'warning'").get().count;

    const successRate = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;

    res.json({
      total,
      completed,
      failed,
      running,
      pending,
      warnings,
      successRate: parseFloat(successRate)
    });
  } catch (error) {
    next(error);
  }
});

// Get stats by various dimensions
router.get('/stats', authenticateToken, (req, res, next) => {
  try {
    // Status distribution
    const byStatus = db.prepare(`
      SELECT load_status as status, COUNT(*) as count
      FROM reconciliation_data
      GROUP BY load_status
      ORDER BY count DESC
    `).all();

    // Severity distribution
    const bySeverity = db.prepare(`
      SELECT severity, COUNT(*) as count
      FROM reconciliation_data
      GROUP BY severity
      ORDER BY CASE severity
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
        ELSE 5
      END
    `).all();

    // Phase distribution
    const byPhase = db.prepare(`
      SELECT phase, COUNT(*) as count
      FROM reconciliation_data
      WHERE phase IS NOT NULL
      GROUP BY phase
      ORDER BY count DESC
    `).all();

    // Object type distribution
    const byObjectType = db.prepare(`
      SELECT object_type, COUNT(*) as count
      FROM reconciliation_data
      WHERE object_type IS NOT NULL
      GROUP BY object_type
      ORDER BY count DESC
      LIMIT 10
    `).all();

    // Top failures
    const topFailures = db.prepare(`
      SELECT source_object, target_object, error_message, severity
      FROM reconciliation_data
      WHERE load_status = 'failed'
      ORDER BY CASE severity
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        ELSE 4
      END
      LIMIT 10
    `).all();

    res.json({
      byStatus,
      bySeverity,
      byPhase,
      byObjectType,
      topFailures
    });
  } catch (error) {
    next(error);
  }
});

// Get single record
router.get('/:id', authenticateToken, (req, res, next) => {
  try {
    const { id } = req.params;

    const record = db.prepare('SELECT * FROM reconciliation_data WHERE id = ?').get(id);

    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // Get related records (same source or target object)
    const related = db.prepare(`
      SELECT id, source_object, target_object, load_status, severity
      FROM reconciliation_data
      WHERE (source_object = ? OR target_object = ?) AND id != ?
      LIMIT 5
    `).all(record.source_object, record.target_object, id);

    res.json({
      ...record,
      related
    });
  } catch (error) {
    next(error);
  }
});

// Get distinct values for filters
router.get('/filters/options', authenticateToken, (req, res, next) => {
  try {
    const statuses = db.prepare('SELECT DISTINCT load_status FROM reconciliation_data WHERE load_status IS NOT NULL ORDER BY load_status').all();
    const severities = db.prepare('SELECT DISTINCT severity FROM reconciliation_data WHERE severity IS NOT NULL ORDER BY severity').all();
    const phases = db.prepare('SELECT DISTINCT phase FROM reconciliation_data WHERE phase IS NOT NULL ORDER BY phase').all();
    const objectTypes = db.prepare('SELECT DISTINCT object_type FROM reconciliation_data WHERE object_type IS NOT NULL ORDER BY object_type').all();

    res.json({
      statuses: statuses.map(s => s.load_status),
      severities: severities.map(s => s.severity),
      phases: phases.map(p => p.phase),
      objectTypes: objectTypes.map(o => o.object_type)
    });
  } catch (error) {
    next(error);
  }
});

export default router;
