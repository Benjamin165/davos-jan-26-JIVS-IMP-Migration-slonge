import express from 'express';
import db from '../models/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all migration runs
router.get('/', authenticateToken, (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = 'SELECT * FROM migration_runs';
    let countQuery = 'SELECT COUNT(*) as total FROM migration_runs';
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      countQuery += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY started_at DESC LIMIT ? OFFSET ?';

    const runs = db.prepare(query).all(...params, parseInt(limit), offset);
    const { total } = db.prepare(countQuery).get(...params.slice(0, status ? 1 : 0));

    res.json({
      runs: runs.map(run => ({
        ...run,
        successRate: run.total_objects > 0
          ? ((run.successful_objects / run.total_objects) * 100).toFixed(1)
          : 0
      })),
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

// Get single run
router.get('/:id', authenticateToken, (req, res, next) => {
  try {
    const { id } = req.params;

    const run = db.prepare('SELECT * FROM migration_runs WHERE id = ?').get(id);

    if (!run) {
      return res.status(404).json({ error: 'Migration run not found' });
    }

    res.json({
      ...run,
      successRate: run.total_objects > 0
        ? ((run.successful_objects / run.total_objects) * 100).toFixed(1)
        : 0
    });
  } catch (error) {
    next(error);
  }
});

// Compare two runs
router.get('/compare/:id1/:id2', authenticateToken, (req, res, next) => {
  try {
    const { id1, id2 } = req.params;

    const run1 = db.prepare('SELECT * FROM migration_runs WHERE id = ?').get(id1);
    const run2 = db.prepare('SELECT * FROM migration_runs WHERE id = ?').get(id2);

    if (!run1 || !run2) {
      return res.status(404).json({ error: 'One or both migration runs not found' });
    }

    // Calculate differences
    const comparison = {
      run1: {
        ...run1,
        successRate: run1.total_objects > 0
          ? parseFloat(((run1.successful_objects / run1.total_objects) * 100).toFixed(1))
          : 0
      },
      run2: {
        ...run2,
        successRate: run2.total_objects > 0
          ? parseFloat(((run2.successful_objects / run2.total_objects) * 100).toFixed(1))
          : 0
      },
      differences: {
        totalObjects: run2.total_objects - run1.total_objects,
        successfulObjects: run2.successful_objects - run1.successful_objects,
        failedObjects: run2.failed_objects - run1.failed_objects,
        warningObjects: (run2.warning_objects || 0) - (run1.warning_objects || 0),
        successRateDiff: 0 // Calculate below
      }
    };

    // Calculate success rate difference
    const rate1 = run1.total_objects > 0 ? (run1.successful_objects / run1.total_objects) * 100 : 0;
    const rate2 = run2.total_objects > 0 ? (run2.successful_objects / run2.total_objects) * 100 : 0;
    comparison.differences.successRateDiff = parseFloat((rate2 - rate1).toFixed(1));

    // Determine overall trend
    if (comparison.differences.successRateDiff > 0) {
      comparison.trend = 'improved';
    } else if (comparison.differences.successRateDiff < 0) {
      comparison.trend = 'regressed';
    } else {
      comparison.trend = 'unchanged';
    }

    // Summary
    comparison.summary = {
      improved: comparison.differences.successfulObjects > 0,
      regressed: comparison.differences.failedObjects > 0,
      totalChanges: Math.abs(comparison.differences.successfulObjects) + Math.abs(comparison.differences.failedObjects)
    };

    res.json(comparison);
  } catch (error) {
    next(error);
  }
});

// Get latest run
router.get('/latest', authenticateToken, (req, res, next) => {
  try {
    const run = db.prepare('SELECT * FROM migration_runs ORDER BY started_at DESC LIMIT 1').get();

    if (!run) {
      return res.status(404).json({ error: 'No migration runs found' });
    }

    res.json({
      ...run,
      successRate: run.total_objects > 0
        ? ((run.successful_objects / run.total_objects) * 100).toFixed(1)
        : 0
    });
  } catch (error) {
    next(error);
  }
});

export default router;
