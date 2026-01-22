import express from 'express';
import db from '../models/database.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  calculateTrend,
  determineWarningLevel,
  comparePeriods,
  getDateGroupExpression,
  getDateFilterExpression
} from '../services/trendAnalyzer.js';

const router = express.Router();

/**
 * GET /api/trends/timeline
 * Get time-series aggregation of test rule fail counts
 */
router.get('/timeline', authenticateToken, (req, res, next) => {
  try {
    const {
      period = 'daily',
      limit = 30,
      object_name,
      start_date,
      end_date
    } = req.query;

    const dateGroup = getDateGroupExpression(period);
    const dateFilter = getDateFilterExpression(period, parseInt(limit));

    let whereConditions = [`created_at >= ${dateFilter}`];
    let params = [];

    if (object_name) {
      whereConditions.push('object_name = ?');
      params.push(object_name);
    }

    if (start_date) {
      whereConditions.push('created_at >= ?');
      params.push(start_date);
    }

    if (end_date) {
      whereConditions.push('created_at <= ?');
      params.push(end_date);
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    const query = `
      SELECT
        ${dateGroup} as period,
        SUM(fail_count) as fail_count,
        SUM(pass_count) as pass_count,
        SUM(total_count) as total_count,
        CAST(SUM(fail_count) AS FLOAT) / NULLIF(SUM(total_count), 0) * 100 as fail_rate,
        COUNT(DISTINCT object_name) as unique_objects,
        SUM(CASE WHEN severity = 'critical' THEN fail_count ELSE 0 END) as critical_fails,
        SUM(CASE WHEN severity = 'high' THEN fail_count ELSE 0 END) as high_fails,
        SUM(CASE WHEN severity = 'medium' THEN fail_count ELSE 0 END) as medium_fails,
        SUM(CASE WHEN severity = 'low' THEN fail_count ELSE 0 END) as low_fails
      FROM test_rules_data
      ${whereClause}
      GROUP BY ${dateGroup}
      ORDER BY period ASC
    `;

    const data = db.prepare(query).all(...params);

    // Calculate trend
    const trend = calculateTrend(data);

    // Calculate latest fail rate for warning detection
    const latestFailRate = data.length > 0 ? (data[data.length - 1].fail_rate || 0) : 0;
    const warning = determineWarningLevel(trend, latestFailRate);

    // Get metadata
    const metadata = {
      period_type: period,
      total_periods: data.length,
      earliest_date: data.length > 0 ? data[0].period : null,
      latest_date: data.length > 0 ? data[data.length - 1].period : null
    };

    res.json({
      data: data.map(d => ({
        ...d,
        fail_rate: d.fail_rate ? parseFloat(d.fail_rate.toFixed(2)) : 0,
        by_severity: {
          critical: d.critical_fails || 0,
          high: d.high_fails || 0,
          medium: d.medium_fails || 0,
          low: d.low_fails || 0
        }
      })),
      trend,
      warning,
      metadata
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/trends/objects/:objectName/timeline
 * Get time-series for a specific object
 */
router.get('/objects/:objectName/timeline', authenticateToken, (req, res, next) => {
  try {
    const { objectName } = req.params;
    const { period = 'daily', limit = 30 } = req.query;

    const dateGroup = getDateGroupExpression(period);
    const dateFilter = getDateFilterExpression(period, parseInt(limit));

    const query = `
      SELECT
        ${dateGroup} as period,
        SUM(fail_count) as fail_count,
        SUM(pass_count) as pass_count,
        SUM(total_count) as total_count,
        CAST(SUM(fail_count) AS FLOAT) / NULLIF(SUM(total_count), 0) * 100 as fail_rate
      FROM test_rules_data
      WHERE object_name = ? AND created_at >= ${dateFilter}
      GROUP BY ${dateGroup}
      ORDER BY period ASC
    `;

    const timeline = db.prepare(query).all(objectName);

    // Calculate trend
    const trend = calculateTrend(timeline);

    // Period comparison (current vs previous)
    const midpoint = Math.floor(timeline.length / 2);
    const firstHalf = timeline.slice(0, midpoint);
    const secondHalf = timeline.slice(midpoint);

    const period1 = {
      total_fail_count: firstHalf.reduce((sum, d) => sum + (d.fail_count || 0), 0),
      avg_fail_rate: firstHalf.length > 0
        ? firstHalf.reduce((sum, d) => sum + (d.fail_rate || 0), 0) / firstHalf.length
        : 0
    };

    const period2 = {
      total_fail_count: secondHalf.reduce((sum, d) => sum + (d.fail_count || 0), 0),
      avg_fail_rate: secondHalf.length > 0
        ? secondHalf.reduce((sum, d) => sum + (d.fail_rate || 0), 0) / secondHalf.length
        : 0
    };

    const comparison = comparePeriods(period1, period2);

    res.json({
      object_name: objectName,
      timeline: timeline.map(d => ({
        ...d,
        fail_rate: d.fail_rate ? parseFloat(d.fail_rate.toFixed(2)) : 0
      })),
      trend,
      comparison: {
        previous_period_fail_count: period1.total_fail_count,
        current_period_fail_count: period2.total_fail_count,
        ...comparison
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/trends/compare
 * Compare two time periods
 */
router.get('/compare', authenticateToken, (req, res, next) => {
  try {
    const {
      period1_start,
      period1_end,
      period2_start,
      period2_end,
      object_name
    } = req.query;

    if (!period1_start || !period1_end || !period2_start || !period2_end) {
      return res.status(400).json({
        error: 'Missing required parameters: period1_start, period1_end, period2_start, period2_end'
      });
    }

    let objectFilter = '';
    const params1 = [period1_start, period1_end];
    const params2 = [period2_start, period2_end];

    if (object_name) {
      objectFilter = ' AND object_name = ?';
      params1.push(object_name);
      params2.push(object_name);
    }

    const aggregateQuery = `
      SELECT
        SUM(fail_count) as total_fail_count,
        SUM(pass_count) as total_pass_count,
        SUM(total_count) as total_count,
        AVG(CAST(fail_count AS FLOAT) / NULLIF(total_count, 0) * 100) as avg_fail_rate,
        COUNT(*) as record_count
      FROM test_rules_data
      WHERE created_at >= ? AND created_at <= ?${objectFilter}
    `;

    const period1Data = db.prepare(aggregateQuery).get(...params1);
    const period2Data = db.prepare(aggregateQuery).get(...params2);

    const comparison = comparePeriods(period1Data, period2Data);

    res.json({
      period1: {
        label: `${period1_start} to ${period1_end}`,
        start: period1_start,
        end: period1_end,
        total_fail_count: period1Data.total_fail_count || 0,
        total_pass_count: period1Data.total_pass_count || 0,
        avg_fail_rate: period1Data.avg_fail_rate ? parseFloat(period1Data.avg_fail_rate.toFixed(2)) : 0,
        record_count: period1Data.record_count || 0
      },
      period2: {
        label: `${period2_start} to ${period2_end}`,
        start: period2_start,
        end: period2_end,
        total_fail_count: period2Data.total_fail_count || 0,
        total_pass_count: period2Data.total_pass_count || 0,
        avg_fail_rate: period2Data.avg_fail_rate ? parseFloat(period2Data.avg_fail_rate.toFixed(2)) : 0,
        record_count: period2Data.record_count || 0
      },
      difference: comparison
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/trends/objects
 * List objects with their fail count trends
 */
router.get('/objects', authenticateToken, (req, res, next) => {
  try {
    const { limit = 20, sort_by = 'fail_count', sort_order = 'desc' } = req.query;

    // Get objects with aggregated stats
    const query = `
      SELECT
        object_name,
        SUM(fail_count) as total_fail_count,
        SUM(pass_count) as total_pass_count,
        SUM(total_count) as total_count,
        CAST(SUM(fail_count) AS FLOAT) / NULLIF(SUM(total_count), 0) * 100 as fail_rate,
        COUNT(*) as rule_count,
        MAX(created_at) as last_updated
      FROM test_rules_data
      WHERE object_name IS NOT NULL
      GROUP BY object_name
      ORDER BY ${sort_by === 'fail_rate' ? 'fail_rate' : 'total_fail_count'} ${sort_order.toUpperCase()}
      LIMIT ?
    `;

    const objects = db.prepare(query).all(parseInt(limit));

    // For each object, get a mini trend (last 7 periods)
    const objectsWithTrend = objects.map(obj => {
      const trendQuery = `
        SELECT
          DATE(created_at) as period,
          SUM(fail_count) as fail_count
        FROM test_rules_data
        WHERE object_name = ? AND created_at >= date('now', '-7 days')
        GROUP BY DATE(created_at)
        ORDER BY period ASC
      `;
      const miniTimeline = db.prepare(trendQuery).all(obj.object_name);
      const trend = calculateTrend(miniTimeline);

      return {
        ...obj,
        fail_rate: obj.fail_rate ? parseFloat(obj.fail_rate.toFixed(2)) : 0,
        trend_direction: trend.direction,
        trend_slope: trend.slope,
        sparkline: miniTimeline.map(t => t.fail_count)
      };
    });

    res.json({
      objects: objectsWithTrend,
      total: objects.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/trends/summary
 * Get overall trend summary statistics
 */
router.get('/summary', authenticateToken, (req, res, next) => {
  try {
    // Get timeline for trend calculation
    const timelineQuery = `
      SELECT
        DATE(created_at) as period,
        SUM(fail_count) as fail_count,
        SUM(pass_count) as pass_count,
        SUM(total_count) as total_count
      FROM test_rules_data
      WHERE created_at >= date('now', '-30 days')
      GROUP BY DATE(created_at)
      ORDER BY period ASC
    `;
    const timeline = db.prepare(timelineQuery).all();
    const trend = calculateTrend(timeline);

    // Get current totals
    const currentStats = db.prepare(`
      SELECT
        SUM(fail_count) as total_fail_count,
        SUM(pass_count) as total_pass_count,
        SUM(total_count) as total_count,
        CAST(SUM(fail_count) AS FLOAT) / NULLIF(SUM(total_count), 0) * 100 as overall_fail_rate
      FROM test_rules_data
    `).get();

    // Get worst performing object
    const worstObject = db.prepare(`
      SELECT
        object_name,
        SUM(fail_count) as fail_count,
        CAST(SUM(fail_count) AS FLOAT) / NULLIF(SUM(total_count), 0) * 100 as fail_rate
      FROM test_rules_data
      WHERE object_name IS NOT NULL
      GROUP BY object_name
      ORDER BY fail_count DESC
      LIMIT 1
    `).get();

    // Get warning status
    const warning = determineWarningLevel(
      trend,
      currentStats.overall_fail_rate || 0
    );

    res.json({
      current: {
        total_fail_count: currentStats.total_fail_count || 0,
        total_pass_count: currentStats.total_pass_count || 0,
        total_count: currentStats.total_count || 0,
        overall_fail_rate: currentStats.overall_fail_rate
          ? parseFloat(currentStats.overall_fail_rate.toFixed(2))
          : 0
      },
      trend,
      warning,
      worst_object: worstObject ? {
        name: worstObject.object_name,
        fail_count: worstObject.fail_count,
        fail_rate: worstObject.fail_rate
          ? parseFloat(worstObject.fail_rate.toFixed(2))
          : 0
      } : null,
      timeline_periods: timeline.length
    });
  } catch (error) {
    next(error);
  }
});

export default router;
