import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { GitCompare, TrendingUp, TrendingDown, Minus, RefreshCw, Filter, Eye, EyeOff, Download, FileText, FileSpreadsheet, FileJson } from 'lucide-react'
import api from '../utils/api'
import { cn } from '../utils/cn'

export default function Comparison() {
  const [runs, setRuns] = useState([])
  const [selectedRun1, setSelectedRun1] = useState('')
  const [selectedRun2, setSelectedRun2] = useState('')
  const [comparison, setComparison] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingRuns, setIsLoadingRuns] = useState(true)
  const [showChangedOnly, setShowChangedOnly] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

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

  // Export comparison report
  const handleExportComparison = async (format) => {
    if (!comparison) return

    setIsExporting(true)
    setShowExportMenu(false)

    try {
      const exportData = {
        title: 'Migration Run Comparison Report',
        generatedAt: new Date().toISOString(),
        run1: {
          name: comparison.run1.name,
          date: comparison.run1.started_at,
          totalObjects: comparison.run1.total_objects,
          successful: comparison.run1.successful_objects,
          failed: comparison.run1.failed_objects,
          successRate: comparison.run1.successRate
        },
        run2: {
          name: comparison.run2.name,
          date: comparison.run2.started_at,
          totalObjects: comparison.run2.total_objects,
          successful: comparison.run2.successful_objects,
          failed: comparison.run2.failed_objects,
          successRate: comparison.run2.successRate
        },
        differences: comparison.differences,
        trend: comparison.trend
      }

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `comparison_report_${Date.now()}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else if (format === 'csv') {
        const csvRows = [
          ['Comparison Report'],
          ['Generated:', new Date().toLocaleString()],
          [''],
          ['Metric', comparison.run1.name, comparison.run2.name, 'Difference'],
          ['Total Objects', comparison.run1.total_objects, comparison.run2.total_objects, comparison.differences.totalObjects],
          ['Successful', comparison.run1.successful_objects, comparison.run2.successful_objects, comparison.differences.successfulObjects],
          ['Failed', comparison.run1.failed_objects, comparison.run2.failed_objects, comparison.differences.failedObjects],
          ['Success Rate', comparison.run1.successRate + '%', comparison.run2.successRate + '%', comparison.differences.successRateDiff + '%'],
          [''],
          ['Overall Trend:', comparison.trend]
        ]
        const csvContent = csvRows.map(row => row.join(',')).join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `comparison_report_${Date.now()}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else if (format === 'pdf') {
        // Generate printable HTML
        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Comparison Report</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #333; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
              th { background-color: #f5f5f5; }
              .trend { font-size: 18px; font-weight: bold; padding: 10px; border-radius: 5px; display: inline-block; }
              .improved { background-color: #d4edda; color: #155724; }
              .regressed { background-color: #f8d7da; color: #721c24; }
              .unchanged { background-color: #e2e3e5; color: #383d41; }
            </style>
          </head>
          <body>
            <h1>Migration Run Comparison Report</h1>
            <p>Generated: ${new Date().toLocaleString()}</p>
            <p class="trend ${comparison.trend}">${comparison.trend.toUpperCase()}</p>
            <table>
              <tr>
                <th>Metric</th>
                <th>${comparison.run1.name}</th>
                <th>${comparison.run2.name}</th>
                <th>Difference</th>
              </tr>
              <tr><td>Total Objects</td><td>${comparison.run1.total_objects}</td><td>${comparison.run2.total_objects}</td><td>${comparison.differences.totalObjects}</td></tr>
              <tr><td>Successful</td><td>${comparison.run1.successful_objects}</td><td>${comparison.run2.successful_objects}</td><td>${comparison.differences.successfulObjects}</td></tr>
              <tr><td>Failed</td><td>${comparison.run1.failed_objects}</td><td>${comparison.run2.failed_objects}</td><td>${comparison.differences.failedObjects}</td></tr>
              <tr><td>Success Rate</td><td>${comparison.run1.successRate}%</td><td>${comparison.run2.successRate}%</td><td>${comparison.differences.successRateDiff}%</td></tr>
            </table>
          </body>
          </html>
        `
        const printWindow = window.open('', '_blank')
        printWindow.document.write(html)
        printWindow.document.close()
        printWindow.print()
      }
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setIsExporting(false)
    }
  }

  // Create a list of comparison metrics for filtering
  const comparisonMetrics = useMemo(() => {
    if (!comparison) return []
    return [
      {
        name: 'Total Objects',
        run1Value: comparison.run1.total_objects,
        run2Value: comparison.run2.total_objects,
        diff: comparison.differences.totalObjects,
        hasChanged: comparison.differences.totalObjects !== 0
      },
      {
        name: 'Successful',
        run1Value: comparison.run1.successful_objects,
        run2Value: comparison.run2.successful_objects,
        diff: comparison.differences.successfulObjects,
        hasChanged: comparison.differences.successfulObjects !== 0,
        color: 'success'
      },
      {
        name: 'Failed',
        run1Value: comparison.run1.failed_objects,
        run2Value: comparison.run2.failed_objects,
        diff: comparison.differences.failedObjects,
        hasChanged: comparison.differences.failedObjects !== 0,
        color: 'error',
        inverse: true
      },
      {
        name: 'Warnings',
        run1Value: comparison.run1.warning_objects || 0,
        run2Value: comparison.run2.warning_objects || 0,
        diff: (comparison.run2.warning_objects || 0) - (comparison.run1.warning_objects || 0),
        hasChanged: (comparison.run2.warning_objects || 0) !== (comparison.run1.warning_objects || 0),
        color: 'warning',
        inverse: true
      },
      {
        name: 'Success Rate',
        run1Value: comparison.run1.successRate + '%',
        run2Value: comparison.run2.successRate + '%',
        diff: comparison.differences.successRateDiff,
        hasChanged: comparison.differences.successRateDiff !== 0,
        suffix: '%'
      }
    ]
  }, [comparison])

  // Filter metrics based on showChangedOnly
  const filteredMetrics = useMemo(() => {
    if (showChangedOnly) {
      return comparisonMetrics.filter(metric => metric.hasChanged)
    }
    return comparisonMetrics
  }, [comparisonMetrics, showChangedOnly])

  const changedCount = comparisonMetrics.filter(m => m.hasChanged).length
  const unchangedCount = comparisonMetrics.filter(m => !m.hasChanged).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Run Comparison</h1>
          <p className="text-gray-400">Compare migration runs side by side</p>
        </div>
        {comparison && (
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting}
              className="btn-secondary px-4 py-2"
            >
              <Download className={cn('w-4 h-4 mr-2', isExporting && 'animate-pulse')} />
              Export
            </button>
            {showExportMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-48 bg-dark-800 border border-dark-600 rounded-lg shadow-xl z-50"
              >
                <div className="py-1">
                  <button
                    onClick={() => handleExportComparison('pdf')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-dark-700 flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-red-400" />
                    Export as PDF
                  </button>
                  <button
                    onClick={() => handleExportComparison('csv')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-dark-700 flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-green-400" />
                    Export as CSV
                  </button>
                  <button
                    onClick={() => handleExportComparison('json')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-dark-700 flex items-center gap-2"
                  >
                    <FileJson className="w-4 h-4 text-blue-400" />
                    Export as JSON
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}
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

          {/* Filter Controls */}
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Filter className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-400">
                  {changedCount} changed, {unchangedCount} unchanged
                </span>
              </div>
              <button
                onClick={() => setShowChangedOnly(!showChangedOnly)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                  showChangedOnly
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-700 hover:bg-dark-600 text-gray-300'
                )}
              >
                {showChangedOnly ? (
                  <>
                    <Eye className="w-4 h-4" />
                    Show Changed Only
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4" />
                    Show All
                  </>
                )}
              </button>
            </div>
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

          {/* Detailed Comparison Table */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-dark-600">
              <h3 className="text-lg font-semibold">
                Detailed Comparison
                {showChangedOnly && (
                  <span className="text-sm font-normal text-primary-400 ml-2">
                    (Showing changed only)
                  </span>
                )}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Metric</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">{comparison.run1.name}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">{comparison.run2.name}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Difference</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-600">
                  {filteredMetrics.length > 0 ? (
                    filteredMetrics.map((metric, index) => (
                      <tr key={metric.name} className={cn(
                        'hover:bg-dark-700/30 transition-colors',
                        metric.hasChanged && 'bg-dark-700/20'
                      )}>
                        <td className="px-4 py-3 text-sm font-medium">{metric.name}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-400">{metric.run1Value}</td>
                        <td className={cn(
                          'px-4 py-3 text-sm text-right font-medium',
                          metric.color === 'success' && 'text-success-400',
                          metric.color === 'error' && 'text-error-400',
                          metric.color === 'warning' && 'text-warning-400'
                        )}>
                          {metric.run2Value}
                        </td>
                        <td className={cn(
                          'px-4 py-3 text-sm text-right font-medium',
                          metric.diff > 0 && !metric.inverse && 'text-success-400',
                          metric.diff < 0 && !metric.inverse && 'text-error-400',
                          metric.diff > 0 && metric.inverse && 'text-error-400',
                          metric.diff < 0 && metric.inverse && 'text-success-400'
                        )}>
                          {formatDiff(metric.diff, metric.suffix || '')}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {metric.hasChanged ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-500/20 text-primary-400">
                              Changed
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-500/20 text-gray-400">
                              No Change
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                        {showChangedOnly ? 'No changes detected between runs' : 'No data to display'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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
