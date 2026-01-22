/**
 * OpenAI Service for AI-powered predictions and visualizations
 */
import db from '../models/database.js';

// System prompt for migration data quality analysis
const PREDICTION_SYSTEM_PROMPT = `You are a data migration quality analyst for SAP S/4HANA migrations using JIVS IMP.
You analyze test rule execution data to identify trends and predict future data quality issues.

Context:
- "notok" or "fail_count" represents records that failed validation rules
- "pass_count" represents records that passed validation
- Lower fail counts indicate better data quality
- Critical threshold is typically 5% fail rate or absolute count based on object type

Your task is to:
1. Analyze the historical trend of fail counts
2. Predict future fail counts with confidence intervals
3. Estimate when critical thresholds will be reached (if trending up) or when issues will be resolved (if trending down)
4. Provide actionable recommendations for migration teams

Always respond with valid JSON.`;

// System prompt for visualization generation
const VISUALIZATION_SYSTEM_PROMPT = `You are a data visualization expert for SAP S/4HANA migration data using JIVS IMP.
Given a natural language request, determine the best visualization configuration.

Available data sources:

1. reconciliation: Migration reconciliation records (3,975 records)
   RECOMMENDED groupBy fields (use these for best results):
   - load_status: completed, failed, pending, warning (USE THIS for status/failure charts)
   - severity: critical, high, medium, low, info (USE THIS for severity breakdown)
   - source_object: SAP source table names like LFA1, KNA1, VBAK (USE THIS for "by object" requests)

   Other fields (less useful for grouping):
   - target_object: target system object names
   - phase: numeric migration phases (1.0, 2.0, 23.0, 33.0, etc.)

2. test_rules: Validation test rules (4,398 records)
   RECOMMENDED groupBy fields:
   - object_name: name of the object being tested (USE THIS for test rule breakdown)
   - status: pass, fail (USE THIS for pass/fail distribution)
   - category: category of the rule

   Other fields:
   - rule_name: name of the validation rule
   - rule_type: type of validation rule

Available chart types:
- pie: Best for showing proportions/distribution (status breakdown, pass/fail ratio)
- donut: Like pie with center hole, good for percentages
- bar: Best for comparing quantities across many categories (by object, by severity)
- line: Best for showing trends over time
- area: Like line but filled, good for volume over time
- table: Best for detailed data with multiple columns

IMPORTANT Guidelines:
- For "status" or "failure" requests on reconciliation data: use groupBy="load_status"
- For "severity" requests: use groupBy="severity"
- For "by object" or "by type" on reconciliation: use groupBy="source_object"
- For test rules "by object": use groupBy="object_name"
- Default to load_status for general reconciliation requests
- Default to object_name for general test rules requests
- Use pie/donut for distributions with few categories (2-6 items)
- Use bar when there could be many categories (objects, etc.)

Always respond with valid JSON only. No markdown, no explanations.`;

/**
 * Get the configured OpenAI API key from database
 * @returns {string|null} API key or null if not configured
 */
export function getApiKey() {
  try {
    const setting = db.prepare(
      "SELECT value FROM app_settings WHERE key = 'openai_api_key'"
    ).get();
    return setting?.value || null;
  } catch (error) {
    console.error('Error getting API key:', error);
    return null;
  }
}

/**
 * Save OpenAI API key to database
 * @param {string} apiKey - The API key to save
 */
export function saveApiKey(apiKey) {
  db.prepare(`
    INSERT INTO app_settings (key, value, encrypted, updated_at)
    VALUES ('openai_api_key', ?, 0, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updated_at = CURRENT_TIMESTAMP
  `).run(apiKey);
}

/**
 * Validate an OpenAI API key
 * @param {string} apiKey - The API key to validate
 * @returns {Promise<boolean>} Whether the key is valid
 */
export async function validateApiKey(apiKey) {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Generate predictions using OpenAI
 * @param {Object} params - Prediction parameters
 * @param {Array} params.historicalData - Historical timeline data
 * @param {Object} params.trend - Current trend analysis
 * @param {string} params.objectName - Optional object name filter
 * @param {number} params.predictionPeriods - Number of periods to predict
 * @param {string} params.periodType - 'daily', 'weekly', or 'monthly'
 * @returns {Promise<Object>} Prediction results
 */
export async function generatePredictions({
  historicalData,
  trend,
  objectName,
  predictionPeriods = 7,
  periodType = 'daily'
}) {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // Calculate statistics
  const failCounts = historicalData.map(d => d.fail_count || 0);
  const latestFailCount = failCounts[failCounts.length - 1] || 0;
  const avgFailCount = failCounts.reduce((a, b) => a + b, 0) / failCounts.length;

  // Build user prompt
  const userPrompt = `Analyze the following migration data quality timeline for ${objectName || 'all objects'}:

Historical Data (last ${historicalData.length} ${periodType} periods):
${JSON.stringify(historicalData.slice(-14), null, 2)}

Current Statistics:
- Latest fail count: ${latestFailCount}
- Average fail count: ${avgFailCount.toFixed(0)}
- Trend direction: ${trend.direction}
- Rate of change: ${trend.rate_of_change}%
- Consecutive increases: ${trend.consecutive_increases}

Please provide:
1. Prediction for the next ${predictionPeriods} ${periodType} periods with confidence levels (0.0-1.0)
2. Estimated date when fail count will reach critical threshold (5000) if trending up, OR estimated date when issues will be resolved (fail_count < 100) if trending down
3. Key insights about the pattern (2-3 bullet points)
4. Specific recommendations for the migration team (2-3 actionable items)

Respond in the following JSON format:
{
  "predictions": [
    { "period": "YYYY-MM-DD", "predicted_fail_count": number, "confidence": number, "range": { "low": number, "high": number } }
  ],
  "estimated_critical_date": "YYYY-MM-DD" or null,
  "estimated_resolution_date": "YYYY-MM-DD" or null,
  "key_insights": ["insight 1", "insight 2"],
  "recommendations": ["recommendation 1", "recommendation 2"]
}`;

  try {
    // Use gpt-4o which supports JSON mode, fall back to gpt-4-turbo if needed
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: PREDICTION_SYSTEM_PROMPT + '\n\nIMPORTANT: You must respond with valid JSON only. No markdown, no explanations, just the JSON object.' },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Clean up the response - remove markdown code blocks if present
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.slice(7);
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.slice(3);
    }
    if (cleanContent.endsWith('```')) {
      cleanContent = cleanContent.slice(0, -3);
    }
    cleanContent = cleanContent.trim();

    const parsed = JSON.parse(cleanContent);

    return {
      predictions: parsed.predictions || [],
      analysis: {
        estimated_critical_date: parsed.estimated_critical_date,
        estimated_resolution_date: parsed.estimated_resolution_date,
        key_insights: parsed.key_insights || [],
        recommendations: parsed.recommendations || []
      },
      metadata: {
        model_used: 'gpt-4o',
        historical_data_points: historicalData.length,
        generated_at: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('OpenAI prediction error:', error);
    throw error;
  }
}

/**
 * Generate visualization configuration from natural language prompt
 * @param {string} prompt - Natural language description of desired visualization
 * @returns {Promise<Object>} Visualization configuration
 */
export async function generateVisualizationConfig(prompt) {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const userPrompt = `Create a visualization configuration for this request: "${prompt}"

Respond with this exact JSON structure:
{
  "chartType": "bar|line|pie|donut|area|table",
  "dataSource": "reconciliation|test_rules",
  "groupBy": "field_name_from_available_fields",
  "filter": { "field": "field_name", "value": "value" } or null,
  "title": "descriptive title for the chart",
  "reasoning": "one sentence explaining why you chose this configuration"
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: VISUALIZATION_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Clean up the response - remove markdown code blocks if present
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.slice(7);
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.slice(3);
    }
    if (cleanContent.endsWith('```')) {
      cleanContent = cleanContent.slice(0, -3);
    }
    cleanContent = cleanContent.trim();

    const parsed = JSON.parse(cleanContent);

    // Validate required fields
    const validChartTypes = ['bar', 'line', 'pie', 'donut', 'area', 'table'];
    const validDataSources = ['reconciliation', 'test_rules'];

    if (!validChartTypes.includes(parsed.chartType)) {
      parsed.chartType = 'bar';
    }
    if (!validDataSources.includes(parsed.dataSource)) {
      parsed.dataSource = 'reconciliation';
    }

    return {
      chartType: parsed.chartType,
      dataSource: parsed.dataSource,
      groupBy: parsed.groupBy || 'load_status',
      filter: parsed.filter || null,
      title: parsed.title || prompt.substring(0, 50),
      reasoning: parsed.reasoning || 'Generated based on your request'
    };
  } catch (error) {
    console.error('OpenAI visualization config error:', error);
    throw error;
  }
}

/**
 * Check if AI is configured
 * @returns {Object} Configuration status
 */
export function getAiConfigStatus() {
  const apiKey = getApiKey();
  return {
    is_configured: !!apiKey,
    last_validated: null // Could add validation timestamp tracking
  };
}

export default {
  getApiKey,
  saveApiKey,
  validateApiKey,
  generatePredictions,
  generateVisualizationConfig,
  getAiConfigStatus
};
