import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GitCompare, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react'
import api from '../utils/api'
import { cn } from '../utils/cn'

export default function Comparison() {
  const [runs, setRuns] = useState([])
  const [selectedRun1, setSelectedRun1] = useState('')
  const [selectedRun2, setSelectedRun2] = useState('')
  const [comparison, setComparison] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingRuns, setIsLoadingRuns] = useState(true)

  useEffect(() => {
    fetchRuns()
  }, [])

  const fetchRuns = async () => {
    try {
      const response = await api.get('/runs')
      setRuns(response.data.runs || [])
      // Auto-select first two runs if available
      if (response.data.runs?.length >= 2) {
        setSelectedRun1(response.data.runs[1].id.toString())
        setSelectedRun2(response.data.runs[0].id.toString())
      }
    } catch (err) {
      console.error('Failed to load runs:', err)
    } finally {
      setIsLoadingRuns(false)
    }
  }

  const handleCompare = async () => {
    if (!selectedRun1 || !selectedRun2) return

    setIsLoading(true)
    try {
      const response = await api.get(`/runs/compare/${selectedRun1}/${selectedRun2}`)
      setComparison(response.data)
    } catch (err) {
      console.error('Failed to compare runs:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (selectedRun1 && selectedRun2) {
      handleCompare()
    }
  }, [selectedRun1, selectedRun2])

  const DiffIndicator = ({ value, inverse = false }) => {
    if (value === 0) {
      return <Minus className="w-4 h-4 text-gray-400" />
    }
    const isPositive = inverse ? value < 0 : value > 0
    return isPositive ? (
      <TrendingUp className="w-4 h-4 text-success-400" />
    ) : (
      <TrendingDown className="w-4 h-4 text-error-400" />
    )
  }

  const formatDiff = (value, suffix = '') => {
    if (value === 0) return '—'
    const prefix = value > 0 ? '+' : ''
    return `${prefix}${value}${suffix}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Run Comparison</h1>
        <p className="text-gray-400">Compare migration runs side by side</p>
      </div>

      {/* Run Selection */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              First Run (Baseline)
            </label>
            <select
              value={selectedRun1}
              onChange={(e) => setSelectedRun1(e.target.value)}
              className="input"
              disabled={isLoadingRuns}
            >
              <option value="">Select a run...</option>
              {runs.map((run) => (
                <option key={run.id} value={run.id}>
                  {run.name} - {new Date(run.started_at).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center">
            <GitCompare className="w-8 h-8 text-primary-400" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Second Run (Current)
            </label>
            <select
              value={selectedRun2}
              onChange={(e) => setSelectedRun2(e.target.value)}
              className="input"
              disabled={isLoadingRuns}
            >
              <option value="">Select a run...</option>
              {runs.map((run) => (
                <option key={run.id} value={run.id}>
                  {run.name} - {new Date(run.started_at).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="card p-8 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary-400 mx-auto mb-4" />
          <p className="text-gray-400">Comparing runs...</p>
        </div>
      )}

      {/* Comparison Results */}
      {comparison && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Trend Banner */}
          <div className={cn(
            'card p-6 text-center',
            comparison.trend === 'improved' && 'border-success-500/50',
            comparison.trend === 'regressed' && 'border-error-500/50'
          )}>
            <div className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-full',
              comparison.trend === 'improved' && 'bg-success-500/20 text-success-400',
              comparison.trend === 'regressed' && 'bg-error-500/20 text-error-400',
              comparison.trend === 'unchanged' && 'bg-gray-500/20 text-gray-400'
            )}>
              {comparison.trend === 'improved' && <TrendingUp className="w-5 h-5" />}
              {comparison.trend === 'regressed' && <TrendingDown className="w-5 h-5" />}
              {comparison.trend === 'unchanged' && <Minus className="w-5 h-5" />}
              <span className="font-semibold capitalize">
                {comparison.trend === 'improved' ? 'Improvement Detected' :
                 comparison.trend === 'regressed' ? 'Regression Detected' : 'No Change'}
              </span>
            </div>
            <p className="mt-2 text-gray-400">
              Success rate changed by {formatDiff(comparison.differences.successRateDiff, '%')}
            </p>
          </div>

          {/* Side by Side Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Run 1 */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">{comparison.run1.name}</h3>
              <p className="text-sm text-gray-400 mb-4">
                {new Date(comparison.run1.started_at).toLocaleString()}
              </p>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Objects</span>
                  <span className="font-medium">{comparison.run1.total_objects}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Successful</span>
                  <span className="font-medium text-success-400">{comparison.run1.successful_objects}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Failed</span>
                  <span className="font-medium text-error-400">{comparison.run1.failed_objects}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Success Rate</span>
                  <span className="font-medium">{comparison.run1.successRate}%</span>
                </div>
              </div>
            </div>

            {/* Run 2 */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">{comparison.run2.name}</h3>
              <p className="text-sm text-gray-400 mb-4">
                {new Date(comparison.run2.started_at).toLocaleString()}
              </p>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Objects</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{comparison.run2.total_objects}</span>
                    <DiffIndicator value={comparison.differences.totalObjects} />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Successful</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-success-400">{comparison.run2.successful_objects}</span>
                    <DiffIndicator value={comparison.differences.successfulObjects} />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Failed</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-error-400">{comparison.run2.failed_objects}</span>
                    <DiffIndicator value={comparison.differences.failedObjects} inverse />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Success Rate</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{comparison.run2.successRate}%</span>
                    <DiffIndicator value={comparison.differences.successRateDiff} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Changes Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-dark-700/50">
                <p className="text-2xl font-bold">
                  {formatDiff(comparison.differences.totalObjects)}
                </p>
                <p className="text-sm text-gray-400">Total Objects</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-dark-700/50">
                <p className={cn(
                  'text-2xl font-bold',
                  comparison.differences.successfulObjects > 0 ? 'text-success-400' :
                  comparison.differences.successfulObjects < 0 ? 'text-error-400' : ''
                )}>
                  {formatDiff(comparison.differences.successfulObjects)}
                </p>
                <p className="text-sm text-gray-400">Successful</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-dark-700/50">
                <p className={cn(
                  'text-2xl font-bold',
                  comparison.differences.failedObjects < 0 ? 'text-success-400' :
                  comparison.differences.failedObjects > 0 ? 'text-error-400' : ''
                )}>
                  {formatDiff(comparison.differences.failedObjects)}
                </p>
                <p className="text-sm text-gray-400">Failed</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-dark-700/50">
                <p className={cn(
                  'text-2xl font-bold',
                  comparison.differences.successRateDiff > 0 ? 'text-success-400' :
                  comparison.differences.successRateDiff < 0 ? 'text-error-400' : ''
                )}>
                  {formatDiff(comparison.differences.successRateDiff, '%')}
                </p>
                <p className="text-sm text-gray-400">Success Rate</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* No selection state */}
      {!comparison && !isLoading && (
        <div className="card p-8 text-center text-gray-400">
          <GitCompare className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Select two migration runs to compare their results</p>
        </div>
      )}
    </div>
  )
}
