/**
 * Trend Analyzer Service
 * Calculates trend direction, slope, and rate of change for time-series data
 */

/**
 * Calculate linear regression slope for trend detection
 * @param {Array} data - Array of objects with period and fail_count
 * @returns {Object} Slope and trend metrics
 */
export function calculateTrend(data) {
  if (!data || data.length < 2) {
    return {
      direction: 'stable',
      slope: 0,
      rate_of_change: 0,
      is_declining: false,
      consecutive_increases: 0
    };
  }

  const n = data.length;
  const x = data.map((_, i) => i);
  const y = data.map(d => d.fail_count || 0);

  // Calculate linear regression slope
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
  const sumX2 = x.reduce((total, xi) => total + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  // Calculate rate of change (percentage)
  const firstValue = y[0] || 1;
  const lastValue = y[n - 1] || 0;
  const rateOfChange = firstValue > 0
    ? ((lastValue - firstValue) / firstValue) * 100
    : 0;

  // Count consecutive increases
  let consecutiveIncreases = 0;
  for (let i = n - 1; i > 0; i--) {
    if (y[i] > y[i - 1]) {
      consecutiveIncreases++;
    } else {
      break;
    }
  }

  // Determine direction based on slope
  // Using thresholds to avoid noise
  const SLOPE_THRESHOLD = 0.05;
  let direction = 'stable';
  if (slope > SLOPE_THRESHOLD) {
    direction = 'increasing';
  } else if (slope < -SLOPE_THRESHOLD) {
    direction = 'decreasing';
  }

  return {
    direction,
    slope: parseFloat(slope.toFixed(4)),
    rate_of_change: parseFloat(rateOfChange.toFixed(2)),
    is_declining: slope > SLOPE_THRESHOLD, // Quality declining = fail count increasing
    consecutive_increases: consecutiveIncreases
  };
}

/**
 * Warning thresholds for data quality decline
 */
export const WARNING_THRESHOLDS = {
  SLOPE_WARNING: 0.05,
  SLOPE_CRITICAL: 0.15,
  RATE_WARNING: 10,
  RATE_CRITICAL: 25,
  FAIL_RATE_WARNING: 5,
  FAIL_RATE_CRITICAL: 15,
  CONSECUTIVE_INCREASE: 3
};

/**
 * Determine warning level based on trend data
 * @param {Object} trendData - Trend analysis result
 * @param {number} latestFailRate - Current fail rate percentage
 * @returns {Object|null} Warning information or null if no warning
 */
export function determineWarningLevel(trendData, latestFailRate = 0) {
  const { slope, rate_of_change, consecutive_increases } = trendData;

  // Critical conditions
  if (
    slope > WARNING_THRESHOLDS.SLOPE_CRITICAL ||
    rate_of_change > WARNING_THRESHOLDS.RATE_CRITICAL ||
    latestFailRate > WARNING_THRESHOLDS.FAIL_RATE_CRITICAL
  ) {
    return {
      level: 'critical',
      message: 'Data quality is critically declining',
      details: `Fail count increased ${rate_of_change.toFixed(1)}% with critical trend slope`,
      cta: 'Take Immediate Action',
      ctaLink: '/test-rules?severity=critical'
    };
  }

  // Warning conditions
  if (
    slope > WARNING_THRESHOLDS.SLOPE_WARNING ||
    rate_of_change > WARNING_THRESHOLDS.RATE_WARNING ||
    consecutive_increases >= WARNING_THRESHOLDS.CONSECUTIVE_INCREASE ||
    latestFailRate > WARNING_THRESHOLDS.FAIL_RATE_WARNING
  ) {
    return {
      level: 'warning',
      message: `Data quality declining - fail count increased ${rate_of_change.toFixed(1)}%`,
      details: `${consecutive_increases} consecutive periods of increase detected`,
      cta: 'Analyze with AI',
      ctaLink: '/trends?analyze=true'
    };
  }

  return null;
}

/**
 * Calculate period-over-period comparison
 * @param {Object} period1Data - First period aggregated data
 * @param {Object} period2Data - Second period aggregated data
 * @returns {Object} Comparison result
 */
export function comparePeriods(period1Data, period2Data) {
  const p1FailCount = period1Data?.total_fail_count || 0;
  const p2FailCount = period2Data?.total_fail_count || 0;
  const p1FailRate = period1Data?.avg_fail_rate || 0;
  const p2FailRate = period2Data?.avg_fail_rate || 0;

  const failCountChange = p2FailCount - p1FailCount;
  const failRateChange = p2FailRate - p1FailRate;
  const percentChange = p1FailCount > 0
    ? ((failCountChange / p1FailCount) * 100)
    : 0;

  let trend = 'unchanged';
  if (percentChange > 5) {
    trend = 'worsening';
  } else if (percentChange < -5) {
    trend = 'improving';
  }

  return {
    fail_count_change: failCountChange,
    fail_rate_change: parseFloat(failRateChange.toFixed(2)),
    percent_change: parseFloat(percentChange.toFixed(2)),
    trend
  };
}

/**
 * Get SQL date grouping expression based on period type
 * @param {string} periodType - 'daily', 'weekly', or 'monthly'
 * @returns {string} SQL expression for grouping
 */
export function getDateGroupExpression(periodType) {
  switch (periodType) {
    case 'weekly':
      return "strftime('%Y-W%W', created_at)";
    case 'monthly':
      return "strftime('%Y-%m', created_at)";
    case 'daily':
    default:
      return "DATE(created_at)";
  }
}

/**
 * Get SQL date filter expression based on period type and limit
 * @param {string} periodType - 'daily', 'weekly', or 'monthly'
 * @param {number} limit - Number of periods
 * @param {boolean} useHistorical - If true, use data-driven date range instead of relative to today
 * @returns {string} SQL date filter
 */
export function getDateFilterExpression(periodType, limit, useHistorical = true) {
  // For historical data, get dates relative to the most recent data in the database
  // rather than relative to today's date
  if (useHistorical) {
    switch (periodType) {
      case 'weekly':
        return `(SELECT date(MAX(created_at), '-${limit * 7} days') FROM test_rules_data)`;
      case 'monthly':
        return `(SELECT date(MAX(created_at), '-${limit} months') FROM test_rules_data)`;
      case 'daily':
      default:
        return `(SELECT date(MAX(created_at), '-${limit} days') FROM test_rules_data)`;
    }
  }

  // Original behavior for relative-to-now filtering
  switch (periodType) {
    case 'weekly':
      return `date('now', '-${limit * 7} days')`;
    case 'monthly':
      return `date('now', '-${limit} months')`;
    case 'daily':
    default:
      return `date('now', '-${limit} days')`;
  }
}

export default {
  calculateTrend,
  determineWarningLevel,
  comparePeriods,
  getDateGroupExpression,
  getDateFilterExpression,
  WARNING_THRESHOLDS
};
