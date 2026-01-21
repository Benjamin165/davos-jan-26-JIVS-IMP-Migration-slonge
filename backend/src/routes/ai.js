import express from 'express';
import db from '../models/database.js';
import { authenticateToken } from '../middleware/auth.js';

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

// Generate visualization from natural language prompt
router.post('/generate-visual', authenticateToken, (req, res, next) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const promptLower = prompt.toLowerCase();

    // Simple NLP-like parsing for visualization generation
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
    if (promptLower.includes('by status')) {
      groupBy = dataSource === 'test_rules' ? 'status' : 'load_status';
    } else if (promptLower.includes('by severity')) {
      groupBy = 'severity';
    } else if (promptLower.includes('by type') || promptLower.includes('by object')) {
      groupBy = dataSource === 'test_rules' ? 'rule_type' : 'object_type';
    } else if (promptLower.includes('by phase')) {
      groupBy = 'phase';
    } else if (promptLower.includes('by category')) {
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

    // Generate the visualization config
    const visualConfig = {
      name: `Custom: ${prompt.substring(0, 50)}`,
      type: chartType,
      config: {
        dataSource,
        groupBy,
        filter: filterField ? { field: filterField, value: filterValue } : null,
        title: prompt,
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
        showLegend: true,
        animate: true
      }
    };

    // Actually fetch the data for preview
    let previewData;
    if (dataSource === 'test_rules') {
      let query = `SELECT ${groupBy}, COUNT(*) as count FROM test_rules_data`;
      const params = [];
      if (filterField) {
        query += ` WHERE ${filterField} = ?`;
        params.push(filterValue);
      }
      query += ` GROUP BY ${groupBy} ORDER BY count DESC LIMIT 10`;
      previewData = db.prepare(query).all(...params);
    } else {
      let query = `SELECT ${groupBy}, COUNT(*) as count FROM reconciliation_data`;
      const params = [];
      if (filterField) {
        query += ` WHERE ${filterField} = ?`;
        params.push(filterValue);
      }
      query += ` GROUP BY ${groupBy} ORDER BY count DESC LIMIT 10`;
      previewData = db.prepare(query).all(...params);
    }

    res.json({
      message: 'Visualization generated successfully',
      visualization: visualConfig,
      previewData: previewData.map(row => ({
        name: row[groupBy] || 'Unknown',
        value: row.count
      })),
      interpretation: {
        chartType,
        dataSource,
        groupBy,
        filter: filterField ? `${filterField} = ${filterValue}` : 'none'
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

export default router;
