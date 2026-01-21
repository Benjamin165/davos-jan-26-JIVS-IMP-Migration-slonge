import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ClipboardCheck, AlertCircle, CheckCircle, ChevronDown, ChevronRight, RefreshCw, Layers } from 'lucide-react'
import api from '../utils/api'
import { cn } from '../utils/cn'

export default function TestRules() {
  const [summary, setSummary] = useState(null)
  const [failures, setFailures] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedRules, setExpandedRules] = useState({})
  const [expandedGroups, setExpandedGroups] = useState({})
  const [viewMode, setViewMode] = useState('grouped') // 'grouped' or 'flat'

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

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }))
  }

  // Group failures by rule type
  const groupedFailures = useMemo(() => {
    const groups = {}
    failures.forEach(rule => {
      const ruleType = rule.rule_type || 'Other'
      if (!groups[ruleType]) {
        groups[ruleType] = []
      }
      groups[ruleType].push(rule)
    })
    return groups
  }, [failures])

  // Initialize all groups as expanded
  useEffect(() => {
    if (Object.keys(groupedFailures).length > 0 && Object.keys(expandedGroups).length === 0) {
      const initialExpanded = {}
      Object.keys(groupedFailures).forEach(group => {
        initialExpanded[group] = true
      })
      setExpandedGroups(initialExpanded)
    }
  }, [groupedFailures])

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
        <div className="p-4 border-b border-gray-200 dark:border-dark-600 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-error-500 dark:text-error-400 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Failed Rules ({failures.length})
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Rules requiring attention</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grouped')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-colors',
                viewMode === 'grouped'
                  ? 'bg-primary-500/20 text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-700/50'
              )}
            >
              <Layers className="w-4 h-4" />
              Grouped
            </button>
            <button
              onClick={() => setViewMode('flat')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-colors',
                viewMode === 'flat'
                  ? 'bg-primary-500/20 text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-700/50'
              )}
            >
              <ClipboardCheck className="w-4 h-4" />
              Flat
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-dark-600">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
              Loading test rules...
            </div>
          ) : failures.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <CheckCircle className="w-12 h-12 text-success-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 dark:text-white">All rules passing!</p>
              <p>No failed validation rules found.</p>
            </div>
          ) : viewMode === 'grouped' ? (
            // Grouped view with collapsible headers
            Object.entries(groupedFailures).map(([ruleType, rules]) => (
              <div key={ruleType}>
                {/* Group Header - Collapsible */}
                <button
                  onClick={() => toggleGroup(ruleType)}
                  className="w-full p-4 flex items-center justify-between bg-gray-50 dark:bg-dark-700/50 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    {expandedGroups[ruleType] ? (
                      <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{ruleType || 'Other'}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{rules.length} failed rules</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-full bg-error-100 dark:bg-error-500/20 text-error-600 dark:text-error-400 text-sm font-medium">
                      {rules.reduce((sum, r) => sum + r.fail_count, 0).toLocaleString()} total failures
                    </span>
                  </div>
                </button>

                {/* Expanded Group Content */}
                <AnimatePresence>
                  {expandedGroups[ruleType] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="divide-y divide-gray-100 dark:divide-dark-600/50"
                    >
                      {rules.slice(0, 10).map((rule) => (
                        <div key={rule.id} className="hover:bg-gray-50 dark:hover:bg-dark-700/30 transition-colors">
                          <button
                            onClick={() => toggleRule(rule.id)}
                            className="w-full p-4 pl-12 flex items-center justify-between text-left"
                          >
                            <div className="flex items-center gap-4">
                              <div className={cn('w-2 h-2 rounded-full', getSeverityColor(rule.severity).replace('text', 'bg'))} />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{rule.test_rule_name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{rule.object_name}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <span className={cn('badge', getSeverityColor(rule.severity))}>
                                  {rule.severity}
                                </span>
                              </div>
                              <div className="text-right">
                                <p className="text-error-500 dark:text-error-400 font-bold">{rule.fail_count} failures</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">of {rule.total_count} total</p>
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
                              className="px-4 pb-4 pl-12 bg-gray-50 dark:bg-dark-700/30"
                            >
                              <div className="p-4 rounded-lg bg-white dark:bg-dark-800 space-y-2 border border-gray-200 dark:border-dark-600">
                                <div>
                                  <p className="text-xs text-gray-500 uppercase">SQL Condition</p>
                                  <p className="text-sm font-mono bg-gray-100 dark:bg-dark-900 p-2 rounded mt-1 overflow-x-auto text-gray-900 dark:text-white">
                                    {rule.sql_condition || 'N/A'}
                                  </p>
                                </div>
                                <div className="grid grid-cols-3 gap-4 pt-2">
                                  <div>
                                    <p className="text-xs text-gray-500">Pass Count</p>
                                    <p className="text-lg text-success-500 dark:text-success-400">{rule.pass_count}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Fail Count</p>
                                    <p className="text-lg text-error-500 dark:text-error-400">{rule.fail_count}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Pass Rate</p>
                                    <p className="text-lg text-gray-900 dark:text-white">
                                      {((rule.pass_count / rule.total_count) * 100).toFixed(1)}%
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      ))}
                      {rules.length > 10 && (
                        <div className="p-3 pl-12 text-sm text-primary-500 dark:text-primary-400">
                          +{rules.length - 10} more rules in this group
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          ) : (
            // Flat view (original)
            failures.slice(0, 20).map((rule, idx) => (
              <div key={rule.id} className="hover:bg-gray-50 dark:hover:bg-dark-700/30 transition-colors">
                <button
                  onClick={() => toggleRule(rule.id)}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn('w-2 h-2 rounded-full', getSeverityColor(rule.severity).replace('text', 'bg'))} />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{rule.test_rule_name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{rule.object_name} - {rule.rule_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className={cn('badge', getSeverityColor(rule.severity))}>
                        {rule.severity}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-error-500 dark:text-error-400 font-bold">{rule.fail_count} failures</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">of {rule.total_count} total</p>
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
                    className="px-4 pb-4 bg-gray-50 dark:bg-dark-700/30"
                  >
                    <div className="p-4 rounded-lg bg-white dark:bg-dark-800 space-y-2 border border-gray-200 dark:border-dark-600">
                      <div>
                        <p className="text-xs text-gray-500 uppercase">SQL Condition</p>
                        <p className="text-sm font-mono bg-gray-100 dark:bg-dark-900 p-2 rounded mt-1 overflow-x-auto text-gray-900 dark:text-white">
                          {rule.sql_condition || 'N/A'}
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-4 pt-2">
                        <div>
                          <p className="text-xs text-gray-500">Pass Count</p>
                          <p className="text-lg text-success-500 dark:text-success-400">{rule.pass_count}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Fail Count</p>
                          <p className="text-lg text-error-500 dark:text-error-400">{rule.fail_count}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Pass Rate</p>
                          <p className="text-lg text-gray-900 dark:text-white">
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

        {viewMode === 'flat' && failures.length > 20 && (
          <div className="p-4 border-t border-gray-200 dark:border-dark-600 text-center">
            <button className="text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300">
              Show all {failures.length} failed rules
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
