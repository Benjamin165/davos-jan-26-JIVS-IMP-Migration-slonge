import express from 'express';
import db from '../models/database.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  generatePredictions,
  generateVisualizationConfig,
  getApiKey,
  saveApiKey,
  validateApiKey
} from '../services/openaiService.js';
import {
  calculateTrend,
  getDateGroupExpression,
  getDateFilterExpression
} from '../services/trendAnalyzer.js';

const router = express.Router();

// Get AI-powered recommendations based on data patterns
router.get('/recommendations', authenticateToken, (req, res, next) => {
  try {
    const recommendations = [];

    // Analyze reconciliation data for patterns
    const failedCount = db.prepare('SELECT COUNT(*) as count FROM reconciliation_data WHERE load_status = "failed"').get().count;
    const criticalCount = db.prepare('SELECT COUNT(*) as count FROM reconciliation_data WHERE severity = "critical"').get().count;
    const warningCount = db.prepare('SELECT COUNT(*) as count FROM reconciliation_data WHERE severity = "high" OR load_status = "warning"').get().count;

    // Critical items recommendation
    if (criticalCount > 0) {
      const criticalItems = db.prepare(`
        SELECT source_object, error_message
        FROM reconciliation_data
        WHERE severity = 'critical'
        LIMIT 3
      `).all();

      recommendations.push({
        id: 'critical-items',
        type: 'alert',
        priority: 1,
        title: `${criticalCount} Critical Items Require Immediate Attention`,
        description: `There are ${criticalCount} items with critical severity that should be addressed first.`,
        reason: 'Critical severity items can block entire migration workflows and should be resolved with highest priority.',
        action: 'Review critical items',
        link: '/dashboard?severity=critical',
        details: criticalItems.map(i => i.source_object).slice(0, 3)
      });
    }

    // Failed items pattern analysis
    if (failedCount > 0) {
      const failurePatterns = db.prepare(`
        SELECT error_message, COUNT(*) as count
        FROM reconciliation_data
        WHERE load_status = 'failed' AND error_message IS NOT NULL
        GROUP BY error_message
        ORDER BY count DESC
        LIMIT 3
      `).all();

      if (failurePatterns.length > 0 && failurePatterns[0].count > 5) {
        recommendations.push({
          id: 'common-failure',
          type: 'warning',
          priority: 2,
          title: 'Common Failure Pattern Detected',
          description: `${failurePatterns[0].count} items failed with the same error pattern. Fixing this could resolve multiple issues at once.`,
          reason: `The error "${failurePatterns[0].error_message?.substring(0, 50)}..." appears frequently.`,
          action: 'View failure pattern',
          link: '/dashboard?status=failed'
        });
      }
    }

    // Test rule failure analysis
    const testRuleFailures = db.prepare('SELECT COUNT(*) as count FROM test_rules_data WHERE status = "fail"').get().count;
    if (testRuleFailures > 0) {
      const topFailingRules = db.prepare(`
        SELECT rule_type, COUNT(*) as count
        FROM test_rules_data
        WHERE status = 'fail'
        GROUP BY rule_type
        ORDER BY count DESC
        LIMIT 1
      `).get();

      if (topFailingRules) {
        recommendations.push({
          id: 'test-rule-focus',
          type: 'info',
          priority: 3,
          title: `Focus on ${topFailingRules.rule_type} Rules`,
          description: `${topFailingRules.count} test rules of type "${topFailingRules.rule_type}" are failing. These may have a common root cause.`,
          reason: 'Grouping similar failures often reveals systematic issues that can be fixed with a single solution.',
          action: 'View test rules',
          link: `/test-rules?rule_type=${topFailingRules.rule_type}`
        });
      }
    }

    // Data quality recommendation
    const lowQualityCount = db.prepare(`
      SELECT COUNT(*) as count FROM reconciliation_data
      WHERE data_quality_score IS NOT NULL AND data_quality_score < 0.7
    `).get().count;

    if (lowQualityCount > 100) {
      recommendations.push({
        id: 'data-quality',
        type: 'info',
        priority: 4,
        title: 'Data Quality Improvement Opportunity',
        description: `${lowQualityCount} records have low data quality scores. Improving source data quality could reduce migration errors.`,
        reason: 'Records with quality scores below 70% are more likely to encounter issues during migration.',
        action: 'Review low quality data',
        link: '/dashboard'
      });
    }

    // Success rate trend (mock - would need historical data)
    const totalCompleted = db.prepare('SELECT COUNT(*) as count FROM reconciliation_data WHERE load_status = "completed"').get().count;
    const totalRecords = db.prepare('SELECT COUNT(*) as count FROM reconciliation_data').get().count;
    const successRate = totalRecords > 0 ? (totalCompleted / totalRecords) * 100 : 0;

    if (successRate > 80) {
      recommendations.push({
        id: 'success-milestone',
        type: 'success',
        priority: 5,
        title: 'Great Progress!',
        description: `Migration success rate is at ${successRate.toFixed(1)}%. You're on track!`,
        reason: 'A success rate above 80% indicates the migration is progressing well.',
        dismissible: true
      });
    }

    // Sort by priority
    recommendations.sort((a, b) => a.priority - b.priority);

    res.json({
      recommendations,
      generatedAt: new Date().toISOString(),
      summary: {
        totalRecommendations: recommendations.length,
        critical: recommendations.filter(r => r.type === 'alert').length,
        warnings: recommendations.filter(r => r.type === 'warning').length,
        suggestions: recommendations.filter(r => r.type === 'info').length
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Fallback keyword-based parsing when OpenAI is not configured
 */
function parseVisualizationWithKeywords(prompt) {
  const promptLower = prompt.toLowerCase();

  let chartType = 'bar';
  let dataSource = 'reconciliation';
  let groupBy = 'load_status';
  let filterField = null;
  let filterValue = null;

  // Detect chart type
  if (promptLower.includes('pie') || promptLower.includes('circle') || promptLower.includes('donut')) {
    chartType = promptLower.includes('donut') ? 'donut' : 'pie';
  } else if (promptLower.includes('line') || promptLower.includes('trend') || promptLower.includes('over time')) {
    chartType = 'line';
  } else if (promptLower.includes('area')) {
    chartType = 'area';
  } else if (promptLower.includes('table') || promptLower.includes('list')) {
    chartType = 'table';
  }

  // Detect data source
  if (promptLower.includes('test') || promptLower.includes('rule') || promptLower.includes('validation')) {
    dataSource = 'test_rules';
  }

  // Detect grouping
  if (promptLower.includes('by status') || promptLower.includes('status')) {
    groupBy = dataSource === 'test_rules' ? 'status' : 'load_status';
  } else if (promptLower.includes('by severity') || promptLower.includes('severity')) {
    groupBy = 'severity';
  } else if (promptLower.includes('by type') || promptLower.includes('by object') || promptLower.includes('object')) {
    groupBy = dataSource === 'test_rules' ? 'object_name' : 'source_object';
  } else if (promptLower.includes('by phase') || promptLower.includes('phase')) {
    groupBy = 'phase';
  } else if (promptLower.includes('by category') || promptLower.includes('category')) {
    groupBy = 'category';
  }

  // Detect filters
  if (promptLower.includes('failed') || promptLower.includes('failure')) {
    filterField = dataSource === 'test_rules' ? 'status' : 'load_status';
    filterValue = dataSource === 'test_rules' ? 'fail' : 'failed';
  } else if (promptLower.includes('critical')) {
    filterField = 'severity';
    filterValue = 'critical';
  } else if (promptLower.includes('success') || promptLower.includes('passed') || promptLower.includes('completed')) {
    filterField = dataSource === 'test_rules' ? 'status' : 'load_status';
    filterValue = dataSource === 'test_rules' ? 'pass' : 'completed';
  }

  return {
    chartType,
    dataSource,
    groupBy,
    filter: filterField ? { field: filterField, value: filterValue } : null,
    title: prompt.substring(0, 50),
    reasoning: null
  };
}

/**
 * Fetch preview data based on visualization config
 */
function fetchVisualizationPreviewData(config) {
  const { dataSource, groupBy, filter } = config;
  const tableName = dataSource === 'test_rules' ? 'test_rules_data' : 'reconciliation_data';

  let query = `SELECT ${groupBy}, COUNT(*) as count FROM ${tableName}`;
  const params = [];

  if (filter && filter.field && filter.value) {
    query += ` WHERE ${filter.field} = ?`;
    params.push(filter.value);
  }

  query += ` GROUP BY ${groupBy} ORDER BY count DESC LIMIT 10`;

  const rawData = db.prepare(query).all(...params);

  return rawData.map(row => ({
    name: row[groupBy] || 'Unknown',
    value: row.count
  }));
}

// Generate visualization from natural language prompt
router.post('/generate-visual', authenticateToken, async (req, res, next) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Check if OpenAI API key is configured
    const apiKey = getApiKey();
    let config;
    let aiPowered = false;

    if (apiKey) {
      // Use OpenAI for intelligent parsing
      try {
        config = await generateVisualizationConfig(prompt);
        aiPowered = true;
      } catch (aiError) {
        console.error('OpenAI visualization generation failed, falling back to keywords:', aiError.message);
        // Fall back to keyword parsing if OpenAI fails
        config = parseVisualizationWithKeywords(prompt);
      }
    } else {
      // Use fallback keyword-based parsing
      config = parseVisualizationWithKeywords(prompt);
    }

    // Fetch actual preview data
    const previewData = fetchVisualizationPreviewData(config);

    // Build visualization config
    const visualConfig = {
      name: aiPowered ? `AI: ${config.title}` : `Custom: ${config.title}`,
      type: config.chartType,
      config: {
        dataSource: config.dataSource,
        groupBy: config.groupBy,
        filter: config.filter,
        title: config.title,
        colors: ['#2E5BFF', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6'],
        showLegend: true,
        animate: true
      }
    };

    res.json({
      message: aiPowered ? 'Visualization generated with AI' : 'Visualization generated successfully',
      visualization: visualConfig,
      previewData,
      interpretation: {
        chartType: config.chartType,
        dataSource: config.dataSource,
        groupBy: config.groupBy,
        filter: config.filter ? `${config.filter.field} = ${config.filter.value}` : 'none',
        reasoning: config.reasoning,
        aiPowered
      }
    });

  } catch (error) {
    next(error);
  }
});

// Dismiss a recommendation
router.post('/recommendations/:id/dismiss', authenticateToken, (req, res, next) => {
  try {
    const { id } = req.params;

    // In a real app, this would store dismissed recommendations per user
    // For now, just acknowledge the dismiss
    res.json({ message: 'Recommendation dismissed', id });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ai/predict
 * Generate AI-powered predictions for data quality trends
 */
router.post('/predict', authenticateToken, async (req, res, next) => {
  try {
    const {
      object_name,
      prediction_periods = 7,
      period_type = 'daily'
    } = req.body;

    // Check if API key is configured
    const apiKey = getApiKey();
    if (!apiKey) {
      return res.status(400).json({
        error: 'OpenAI API key not configured',
        code: 'API_KEY_NOT_CONFIGURED',
        message: 'Please configure your OpenAI API key in Settings to use AI predictions.'
      });
    }

    // Get historical data for the object or overall
    const dateGroup = getDateGroupExpression(period_type);
    const dateFilter = getDateFilterExpression(period_type, 30);

    let whereCondition = `created_at >= ${dateFilter}`;
    const params = [];

    if (object_name) {
      whereCondition += ' AND object_name = ?';
      params.push(object_name);
    }

    const query = `
      SELECT
        ${dateGroup} as period,
        SUM(fail_count) as fail_count,
        SUM(pass_count) as pass_count,
        SUM(total_count) as total_count,
        CAST(SUM(fail_count) AS FLOAT) / NULLIF(SUM(total_count), 0) * 100 as fail_rate
      FROM test_rules_data
      WHERE ${whereCondition}
      GROUP BY ${dateGroup}
      ORDER BY period ASC
    `;

    const historicalData = db.prepare(query).all(...params);

    if (historicalData.length < 3) {
      return res.status(400).json({
        error: 'Insufficient data',
        code: 'INSUFFICIENT_DATA',
        message: 'At least 3 periods of historical data are required for predictions.'
      });
    }

    // Calculate current trend
    const trend = calculateTrend(historicalData);

    // Generate predictions using OpenAI
    const predictions = await generatePredictions({
      historicalData,
      trend,
      objectName: object_name || 'All Objects',
      predictionPeriods: parseInt(prediction_periods),
      periodType: period_type
    });

    res.json({
      object_name: object_name || 'all',
      period_type,
      historical_periods: historicalData.length,
      ...predictions
    });

  } catch (error) {
    if (error.message?.includes('API key')) {
      return res.status(401).json({
        error: 'Invalid API key',
        code: 'INVALID_API_KEY',
        message: 'The configured OpenAI API key is invalid or has expired.'
      });
    }
    next(error);
  }
});

/**
 * POST /api/ai/settings/config
 * Save OpenAI API key
 */
router.post('/settings/config', authenticateToken, async (req, res, next) => {
  try {
    const { api_key } = req.body;

    if (!api_key || api_key.trim().length === 0) {
      return res.status(400).json({
        error: 'API key is required'
      });
    }

    // Validate the API key before saving
    const isValid = await validateApiKey(api_key);
    if (!isValid) {
      return res.status(400).json({
        error: 'Invalid API key',
        message: 'The provided API key could not be validated. Please check that it is correct.'
      });
    }

    // Save the API key
    saveApiKey(api_key);

    res.json({
      success: true,
      message: 'API key configured successfully'
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ai/settings/status
 * Check if OpenAI API key is configured
 */
router.get('/settings/status', authenticateToken, (req, res, next) => {
  try {
    const apiKey = getApiKey();
    const isConfigured = !!apiKey;

    res.json({
      configured: isConfigured,
      provider: 'openai',
      model: 'gpt-4o',
      features: {
        predictions: isConfigured,
        analysis: isConfigured
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/ai/settings/config
 * Remove OpenAI API key
 */
router.delete('/settings/config', authenticateToken, (req, res, next) => {
  try {
    // Remove the API key by saving empty value
    const stmt = db.prepare(`
      DELETE FROM app_settings WHERE key = 'openai_api_key'
    `);
    stmt.run();

    res.json({
      success: true,
      message: 'API key removed successfully'
    });

  } catch (error) {
    next(error);
  }
});

export default router;
