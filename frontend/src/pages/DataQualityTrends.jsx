import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  AlertTriangle,
  Target,
  Activity,
  RefreshCw,
  Calendar
} from 'lucide-react'
import api from '../utils/api'
import { cn } from '../utils/cn'
import {
  TimelineChart,
  TrendSummaryCard,
  ObjectSelector,
  PeriodComparison,
  DeclineWarningBanner,
  AIPredictionPanel
} from '../components/trends'

const PERIOD_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
]

export default function DataQualityTrends() {
  const [period, setPeriod] = useState('daily')
  const [selectedObject, setSelectedObject] = useState(null)
  const [timelineData, setTimelineData] = useState(null)
  const [trend, setTrend] = useState(null)
  const [warning, setWarning] = useState(null)
  const [objects, setObjects] = useState([])
  const [summary, setSummary] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dismissedWarning, setDismissedWarning] = useState(false)

  // AI Prediction state
  const [aiConfigured, setAiConfigured] = useState(false)
  const [predictions, setPredictions] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState(null)

  // Fetch timeline data
  const fetchTimeline = useCallback(async () => {
    setIsLoading(true)
    try {
      let endpoint = '/trends/timeline'
      const params = new URLSearchParams({ period, limit: '30' })

      if (selectedObject) {
        endpoint = `/trends/objects/${encodeURIComponent(selectedObject)}/timeline`
      }

      const response = await api.get(`${endpoint}?${params}`)
      setTimelineData(response.data.data || response.data.timeline)
      setTrend(response.data.trend)
      setWarning(response.data.warning)
      setDismissedWarning(false)
    } catch (err) {
      console.error('Failed to fetch timeline:', err)
    } finally {
      setIsLoading(false)
    }
  }, [period, selectedObject])

  // Fetch objects list
  const fetchObjects = useCallback(async () => {
    try {
      const response = await api.get('/trends/objects?limit=50')
      setObjects(response.data.objects || [])
    } catch (err) {
      console.error('Failed to fetch objects:', err)
    }
  }, [])

  // Fetch summary
  const fetchSummary = useCallback(async () => {
    try {
      const response = await api.get('/trends/summary')
      setSummary(response.data)
    } catch (err) {
      console.error('Failed to fetch summary:', err)
    }
  }, [])

  // Check AI configuration
  const checkAiConfig = useCallback(async () => {
    try {
      const response = await api.get('/ai/settings/status')
      setAiConfigured(response.data.configured)
    } catch (err) {
      // Endpoint might not exist yet, that's ok
      setAiConfigured(false)
    }
  }, [])

  // Generate AI predictions
  const generatePredictions = async () => {
    setAiLoading(true)
    setAiError(null)
    try {
      const response = await api.post('/ai/predict', {
        object_name: selectedObject,
        prediction_periods: 7,
        period_type: period
      })
      setPredictions(response.data.predictions)
      setAnalysis(response.data.analysis)
    } catch (err) {
      setAiError(err.response?.data?.error || 'Failed to generate predictions')
    } finally {
      setAiLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchTimeline()
    fetchObjects()
    fetchSummary()
    checkAiConfig()
  }, [])

  // Refetch when period or object changes
  useEffect(() => {
    fetchTimeline()
    // Clear predictions when filter changes
    setPredictions(null)
    setAnalysis(null)
  }, [period, selectedObject])

  const handleRefresh = () => {
    fetchTimeline()
    fetchObjects()
    fetchSummary()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Data Quality Trends
          </h1>
          <p className="text-gray-400 text-sm">
            Track test rule failures over time and predict future trends
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <div className="flex bg-[#121212] rounded-[4px] p-1">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={cn(
                  'px-4 py-1.5 text-sm font-medium rounded-[4px] transition-all',
                  period === opt.value
                    ? 'bg-[#2E5BFF] text-white'
                    : 'text-gray-400 hover:text-white'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Object Selector */}
          <ObjectSelector
            objects={objects}
            selectedObject={selectedObject}
            onSelect={setSelectedObject}
            isLoading={isLoading}
          />

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 bg-[#262626] text-gray-300 rounded-[4px] hover:text-white hover:brightness-110 transition-all disabled:opacity-50"
          >
            <RefreshCw className={cn('w-4 h-4 mr-2', isLoading && 'animate-spin')} />
            Refresh
          </button>
        </div>
      </div>

      {/* Warning Banner */}
      <AnimatePresence>
        {warning && !dismissedWarning && (
          <DeclineWarningBanner
            warning={warning}
            onDismiss={() => setDismissedWarning(true)}
            onAnalyze={aiConfigured ? generatePredictions : undefined}
          />
        )}
      </AnimatePresence>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TrendSummaryCard
          title="Current Fail Count"
          value={summary?.current?.total_fail_count || 0}
          icon={AlertTriangle}
          color="error"
          trend={trend?.direction}
          trendValue={trend?.rate_of_change}
          delay={0}
        />
        <TrendSummaryCard
          title="Overall Fail Rate"
          value={`${summary?.current?.overall_fail_rate || 0}%`}
          icon={Activity}
          color="warning"
          delay={0.1}
        />
        <TrendSummaryCard
          title="Worst Object"
          value={summary?.worst_object?.name || 'N/A'}
          icon={Target}
          color="primary"
          delay={0.2}
        />
        <TrendSummaryCard
          title="Periods Analyzed"
          value={summary?.timeline_periods || 0}
          icon={Calendar}
          color="success"
          delay={0.3}
        />
      </div>

      {/* Timeline Chart */}
      <TimelineChart
        data={timelineData}
        isLoading={isLoading}
        showPassCount={false}
        title={selectedObject ? `Fail Count: ${selectedObject}` : 'Aggregate Fail Count Over Time'}
      />

      {/* Period Comparison */}
      {timelineData && timelineData.length > 1 && (
        <PeriodComparison
          period1={{
            label: `First Half (${period})`,
            total_fail_count: timelineData
              .slice(0, Math.floor(timelineData.length / 2))
              .reduce((sum, d) => sum + (d.fail_count || 0), 0),
            avg_fail_rate: timelineData
              .slice(0, Math.floor(timelineData.length / 2))
              .reduce((sum, d) => sum + (d.fail_rate || 0), 0) / Math.floor(timelineData.length / 2)
          }}
          period2={{
            label: `Second Half (${period})`,
            total_fail_count: timelineData
              .slice(Math.floor(timelineData.length / 2))
              .reduce((sum, d) => sum + (d.fail_count || 0), 0),
            avg_fail_rate: timelineData
              .slice(Math.floor(timelineData.length / 2))
              .reduce((sum, d) => sum + (d.fail_rate || 0), 0) / (timelineData.length - Math.floor(timelineData.length / 2))
          }}
          difference={{
            fail_count_change:
              timelineData.slice(Math.floor(timelineData.length / 2)).reduce((sum, d) => sum + (d.fail_count || 0), 0) -
              timelineData.slice(0, Math.floor(timelineData.length / 2)).reduce((sum, d) => sum + (d.fail_count || 0), 0),
            percent_change: trend?.rate_of_change || 0,
            trend: trend?.direction === 'increasing' ? 'worsening' :
                   trend?.direction === 'decreasing' ? 'improving' : 'unchanged'
          }}
          isLoading={isLoading}
        />
      )}

      {/* AI Prediction Panel */}
      <AIPredictionPanel
        predictions={predictions}
        analysis={analysis}
        historicalData={timelineData}
        isLoading={aiLoading}
        isConfigured={aiConfigured}
        onGenerate={generatePredictions}
        error={aiError}
      />

      {/* Objects with Trends */}
      {objects.length > 0 && !selectedObject && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.2 }}
          className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-md overflow-hidden"
        >
          <div className="p-4 border-b border-[#2A2A2A]">
            <h3 className="text-lg font-semibold text-white tracking-tight">
              Objects by Fail Count
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left uppercase text-[11px] font-bold text-gray-400 tracking-wider">
                    Object Name
                  </th>
                  <th className="px-4 py-3 text-left uppercase text-[11px] font-bold text-gray-400 tracking-wider">
                    Fail Count
                  </th>
                  <th className="px-4 py-3 text-left uppercase text-[11px] font-bold text-gray-400 tracking-wider">
                    Fail Rate
                  </th>
                  <th className="px-4 py-3 text-left uppercase text-[11px] font-bold text-gray-400 tracking-wider">
                    Trend
                  </th>
                  <th className="px-4 py-3 text-left uppercase text-[11px] font-bold text-gray-400 tracking-wider">
                    Sparkline
                  </th>
                </tr>
              </thead>
              <tbody>
                {objects.slice(0, 10).map((obj) => (
                  <tr
                    key={obj.object_name}
                    onClick={() => setSelectedObject(obj.object_name)}
                    className="border-b border-[#1A1A1A] hover:bg-[#222222] transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 font-medium text-white">
                      {obj.object_name}
                    </td>
                    <td className="px-4 py-3 text-error-400 font-mono">
                      {obj.total_fail_count?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {obj.fail_rate?.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-[4px]',
                        obj.trend_direction === 'increasing' && 'bg-error-500/20 text-error-400',
                        obj.trend_direction === 'decreasing' && 'bg-success-500/20 text-success-400',
                        obj.trend_direction === 'stable' && 'bg-gray-500/20 text-gray-400'
                      )}>
                        {obj.trend_direction === 'increasing' && <TrendingUp className="w-3 h-3" />}
                        {obj.trend_direction === 'decreasing' && <TrendingUp className="w-3 h-3 rotate-180" />}
                        {obj.trend_direction || 'stable'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {obj.sparkline && obj.sparkline.length > 0 && (
                        <div className="w-20 h-6 flex items-end gap-px">
                          {obj.sparkline.map((val, i) => (
                            <div
                              key={i}
                              className={cn(
                                'flex-1 rounded-sm',
                                obj.trend_direction === 'increasing' ? 'bg-error-400' :
                                obj.trend_direction === 'decreasing' ? 'bg-success-400' : 'bg-gray-400'
                              )}
                              style={{
                                height: `${Math.max(10, (val / Math.max(...obj.sparkline)) * 100)}%`
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  )
}
