import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ClipboardCheck, AlertCircle, CheckCircle, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react'
import api from '../utils/api'
import { cn } from '../utils/cn'

export default function TestRules() {
  const [summary, setSummary] = useState(null)
  const [failures, setFailures] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedRules, setExpandedRules] = useState({})

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [summaryRes, failuresRes] = await Promise.all([
        api.get('/test-rules/summary'),
        api.get('/test-rules/failures')
      ])
      setSummary(summaryRes.data)
      setFailures(failuresRes.data.failures || [])
    } catch (err) {
      console.error('Failed to load test rules data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const toggleRule = (id) => {
    setExpandedRules(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-500'
      case 'high': return 'text-orange-500'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-blue-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Test Rules</h1>
          <p className="text-gray-400">Data validation and quality checks</p>
        </div>
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="btn-secondary px-4 py-2"
        >
          <RefreshCw className={cn('w-4 h-4 mr-2', isLoading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-4"
          >
            <div className="flex items-center gap-3">
              <ClipboardCheck className="w-8 h-8 text-primary-400" />
              <div>
                <p className="text-2xl font-bold">{summary.total}</p>
                <p className="text-sm text-gray-400">Total Rules</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-4"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-success-400" />
              <div>
                <p className="text-2xl font-bold text-success-400">{summary.passed}</p>
                <p className="text-sm text-gray-400">Passed</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-4"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-error-400" />
              <div>
                <p className="text-2xl font-bold text-error-400">{summary.failed}</p>
                <p className="text-sm text-gray-400">Failed</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-success-500/20 flex items-center justify-center">
                <span className="text-success-400 font-bold">{summary.passRate}%</span>
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.passRate}%</p>
                <p className="text-sm text-gray-400">Pass Rate</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Failures Section (Problem-first display) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <div className="p-4 border-b border-dark-600">
          <h2 className="text-lg font-semibold text-error-400 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Failed Rules ({failures.length})
          </h2>
          <p className="text-sm text-gray-400">Rules requiring attention</p>
        </div>

        <div className="divide-y divide-dark-600">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">
              <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
              Loading test rules...
            </div>
          ) : failures.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <CheckCircle className="w-12 h-12 text-success-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-white">All rules passing!</p>
              <p>No failed validation rules found.</p>
            </div>
          ) : (
            failures.slice(0, 20).map((rule, idx) => (
              <div key={rule.id} className="hover:bg-dark-700/30 transition-colors">
                <button
                  onClick={() => toggleRule(rule.id)}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn('w-2 h-2 rounded-full', getSeverityColor(rule.severity).replace('text', 'bg'))} />
                    <div>
                      <p className="font-medium">{rule.test_rule_name}</p>
                      <p className="text-sm text-gray-400">{rule.object_name} - {rule.rule_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className={cn('badge', getSeverityColor(rule.severity))}>
                        {rule.severity}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-error-400 font-bold">{rule.fail_count} failures</p>
                      <p className="text-xs text-gray-400">of {rule.total_count} total</p>
                    </div>
                    {expandedRules[rule.id] ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {expandedRules[rule.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="px-4 pb-4 bg-dark-700/30"
                  >
                    <div className="p-4 rounded-lg bg-dark-800 space-y-2">
                      <div>
                        <p className="text-xs text-gray-500 uppercase">SQL Condition</p>
                        <p className="text-sm font-mono bg-dark-900 p-2 rounded mt-1 overflow-x-auto">
                          {rule.sql_condition || 'N/A'}
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-4 pt-2">
                        <div>
                          <p className="text-xs text-gray-500">Pass Count</p>
                          <p className="text-lg text-success-400">{rule.pass_count}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Fail Count</p>
                          <p className="text-lg text-error-400">{rule.fail_count}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Pass Rate</p>
                          <p className="text-lg">
                            {((rule.pass_count / rule.total_count) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            ))
          )}
        </div>

        {failures.length > 20 && (
          <div className="p-4 border-t border-dark-600 text-center">
            <button className="text-primary-400 hover:text-primary-300">
              Show all {failures.length} failed rules
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
