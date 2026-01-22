import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ClipboardCheck, AlertCircle, CheckCircle, ChevronDown, ChevronRight, RefreshCw, Layers, TrendingUp, ArrowRight } from 'lucide-react'
import api from '../utils/api'
import { cn } from '../utils/cn'
import { TrendSparkline } from '../components/trends'

export default function TestRules() {
  const [summary, setSummary] = useState(null)
  const [failures, setFailures] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedRules, setExpandedRules] = useState({})
  const [expandedGroups, setExpandedGroups] = useState({})
  const [viewMode, setViewMode] = useState('grouped') // 'grouped' or 'flat'
  const [trendSummary, setTrendSummary] = useState(null)
  const [trendLoading, setTrendLoading] = useState(true)

  const fetchTrendSummary = async () => {
    setTrendLoading(true)
    try {
      const response = await api.get('/trends/summary')
      setTrendSummary(response.data)
    } catch (err) {
      console.error('Failed to load trend summary:', err)
    } finally {
      setTrendLoading(false)
    }
  }

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
    fetchTrendSummary()
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
      case 'critical': return 'text-error-400'
      case 'high': return 'text-error-400'
      case 'medium': return 'text-warning-400'
      case 'low': return 'text-success-400'
      default: return 'text-gray-400'
    }
  }

  const getSeverityBgColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-error-500'
      case 'high': return 'bg-error-500'
      case 'medium': return 'bg-warning-500'
      case 'low': return 'bg-success-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Test Rules</h1>
          <p className="text-gray-400 text-sm">Data validation and quality checks</p>
        </div>
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 bg-[#262626] text-gray-300 rounded-[4px] hover:text-white hover:brightness-110 transition-all disabled:opacity-50"
        >
          <RefreshCw className={cn('w-4 h-4 mr-2', isLoading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Trend Summary Widget */}
      {trendSummary && !trendLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'rounded-md p-4 border',
            trendSummary.trend?.is_declining
              ? 'bg-warning-500/10 border-warning-500/30'
              : 'bg-[#1A1A1A] border-[#2A2A2A]'
          )}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className={cn(
                'p-2 rounded-[4px]',
                trendSummary.trend?.is_declining ? 'bg-warning-500/20' : 'bg-[#2E5BFF]/20'
              )}>
                <TrendingUp className={cn(
                  'w-5 h-5',
                  trendSummary.trend?.is_declining ? 'text-warning-400' : 'text-[#2E5BFF]'
                )} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Data Quality Trend</p>
                <p className="text-xs text-gray-400">
                  {trendSummary.trend?.direction === 'increasing'
                    ? 'Fail count trending up'
                    : trendSummary.trend?.direction === 'decreasing'
                      ? 'Fail count trending down'
                      : 'Trend stable'}
                  {trendSummary.trend?.rate_of_change !== 0 && (
                    <span className={cn(
                      'ml-2',
                      trendSummary.trend?.is_declining ? 'text-warning-400' : 'text-success-400'
                    )}>
                      ({trendSummary.trend?.rate_of_change > 0 ? '+' : ''}{trendSummary.trend?.rate_of_change?.toFixed(1)}%)
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Mini Sparkline */}
              <div className="hidden md:block">
                <TrendSparkline
                  data={[
                    trendSummary.current?.total_fail_count * 0.7,
                    trendSummary.current?.total_fail_count * 0.8,
                    trendSummary.current?.total_fail_count * 0.75,
                    trendSummary.current?.total_fail_count * 0.85,
                    trendSummary.current?.total_fail_count * 0.9,
                    trendSummary.current?.total_fail_count * 0.95,
                    trendSummary.current?.total_fail_count
                  ]}
                  trend={trendSummary.trend?.direction}
                  trendValue={trendSummary.trend?.rate_of_change}
                  height={32}
                />
              </div>

              {/* View Full Analysis Link */}
              <Link
                to="/trends"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#262626] text-gray-300 rounded-[4px] text-sm hover:text-white hover:brightness-110 transition-all"
              >
                View Full Analysis
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Summary Stats - JIVS styled */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-md p-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-[4px] bg-[#2E5BFF]/20">
                <ClipboardCheck className="w-6 h-6 text-[#2E5BFF]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{summary.total}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Total Rules</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-md p-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-[4px] bg-success-500/20">
                <CheckCircle className="w-6 h-6 text-success-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-success-400">{summary.passed}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Passed</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.2 }}
            className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-md p-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-[4px] bg-error-500/20">
                <AlertCircle className="w-6 h-6 text-error-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-error-400">{summary.failed}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Failed</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.2 }}
            className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-md p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[4px] bg-success-500/20 flex items-center justify-center">
                <span className="text-success-400 font-bold text-sm">{summary.passRate}%</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{summary.passRate}%</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Pass Rate</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Failures Section - JIVS styled */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.2 }}
        className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-md overflow-hidden"
      >
        <div className="p-4 border-b border-[#2A2A2A] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-error-400 tracking-tight flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Failed Rules ({failures.length})
            </h2>
            <p className="text-sm text-gray-500">Rules requiring attention</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode('grouped')}
              className={cn(
                'px-3 py-1.5 rounded-[4px] text-sm flex items-center gap-1.5 transition-all',
                viewMode === 'grouped'
                  ? 'bg-[#2E5BFF] text-white'
                  : 'text-gray-400 hover:bg-[#262626] hover:text-white'
              )}
            >
              <Layers className="w-4 h-4" />
              Grouped
            </button>
            <button
              onClick={() => setViewMode('flat')}
              className={cn(
                'px-3 py-1.5 rounded-[4px] text-sm flex items-center gap-1.5 transition-all',
                viewMode === 'flat'
                  ? 'bg-[#2E5BFF] text-white'
                  : 'text-gray-400 hover:bg-[#262626] hover:text-white'
              )}
            >
              <ClipboardCheck className="w-4 h-4" />
              Flat
            </button>
          </div>
        </div>

        <div>
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin w-8 h-8 border-2 border-[#2E5BFF] border-t-transparent rounded-full mx-auto mb-4" />
              Loading test rules...
            </div>
          ) : failures.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <CheckCircle className="w-12 h-12 text-success-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-white">All rules passing!</p>
              <p>No failed validation rules found.</p>
            </div>
          ) : viewMode === 'grouped' ? (
            // Grouped view with collapsible headers
            Object.entries(groupedFailures).map(([ruleType, rules]) => (
              <div key={ruleType}>
                {/* Group Header - Collapsible */}
                <button
                  onClick={() => toggleGroup(ruleType)}
                  className="w-full p-4 flex items-center justify-between bg-[#111111] hover:bg-[#1A1A1A] transition-colors text-left border-b border-[#2A2A2A]"
                >
                  <div className="flex items-center gap-3">
                    {expandedGroups[ruleType] ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                    <div>
                      <h3 className="font-semibold text-white">{ruleType || 'Other'}</h3>
                      <p className="text-xs text-gray-500">{rules.length} failed rules</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-[4px] bg-error-500/20 text-error-400 text-xs font-medium">
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
                      transition={{ duration: 0.2 }}
                    >
                      {rules.slice(0, 10).map((rule) => (
                        <div key={rule.id} className="border-b border-[#1A1A1A] hover:bg-[#222222] transition-colors">
                          <button
                            onClick={() => toggleRule(rule.id)}
                            className="w-full p-4 pl-12 flex items-center justify-between text-left"
                          >
                            <div className="flex items-center gap-4">
                              <div className={cn('w-2 h-2 rounded-full', getSeverityBgColor(rule.severity))} />
                              <div>
                                <p className="font-medium text-white text-sm">{rule.test_rule_name}</p>
                                <p className="text-xs text-gray-500">{rule.object_name}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <span className={cn('px-2 py-0.5 rounded-[4px] text-xs font-medium bg-opacity-20', getSeverityColor(rule.severity), rule.severity === 'critical' || rule.severity === 'high' ? 'bg-error-500/20' : rule.severity === 'medium' ? 'bg-warning-500/20' : 'bg-success-500/20')}>
                                  {rule.severity}
                                </span>
                              </div>
                              <div className="text-right">
                                <p className="text-error-400 font-bold text-sm">{rule.fail_count} failures</p>
                                <p className="text-xs text-gray-500">of {rule.total_count} total</p>
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
                              transition={{ duration: 0.2 }}
                              className="px-4 pb-4 pl-12 bg-[#111111]"
                            >
                              <div className="p-4 rounded-md bg-[#1A1A1A] border border-[#2A2A2A] space-y-3">
                                <div>
                                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">SQL Condition</p>
                                  <p className="text-sm font-mono bg-[#0D0D0D] p-2 rounded-[4px] overflow-x-auto text-white">
                                    {rule.sql_condition || 'N/A'}
                                  </p>
                                </div>
                                <div className="grid grid-cols-3 gap-4 pt-2">
                                  <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Pass Count</p>
                                    <p className="text-lg text-success-400">{rule.pass_count}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Fail Count</p>
                                    <p className="text-lg text-error-400">{rule.fail_count}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Pass Rate</p>
                                    <p className="text-lg text-white">
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
                        <div className="p-3 pl-12 text-sm text-[#2E5BFF]">
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
            failures.slice(0, 20).map((rule) => (
              <div key={rule.id} className="border-b border-[#1A1A1A] hover:bg-[#222222] transition-colors">
                <button
                  onClick={() => toggleRule(rule.id)}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn('w-2 h-2 rounded-full', getSeverityBgColor(rule.severity))} />
                    <div>
                      <p className="font-medium text-white text-sm">{rule.test_rule_name}</p>
                      <p className="text-xs text-gray-500">{rule.object_name} - {rule.rule_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className={cn('px-2 py-0.5 rounded-[4px] text-xs font-medium', getSeverityColor(rule.severity), rule.severity === 'critical' || rule.severity === 'high' ? 'bg-error-500/20' : rule.severity === 'medium' ? 'bg-warning-500/20' : 'bg-success-500/20')}>
                        {rule.severity}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-error-400 font-bold text-sm">{rule.fail_count} failures</p>
                      <p className="text-xs text-gray-500">of {rule.total_count} total</p>
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
                    transition={{ duration: 0.2 }}
                    className="px-4 pb-4 bg-[#111111]"
                  >
                    <div className="p-4 rounded-md bg-[#1A1A1A] border border-[#2A2A2A] space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">SQL Condition</p>
                        <p className="text-sm font-mono bg-[#0D0D0D] p-2 rounded-[4px] overflow-x-auto text-white">
                          {rule.sql_condition || 'N/A'}
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-4 pt-2">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">Pass Count</p>
                          <p className="text-lg text-success-400">{rule.pass_count}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">Fail Count</p>
                          <p className="text-lg text-error-400">{rule.fail_count}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">Pass Rate</p>
                          <p className="text-lg text-white">
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
          <div className="p-4 border-t border-[#2A2A2A] text-center">
            <button className="text-[#2E5BFF] hover:brightness-110 transition-all text-sm">
              Show all {failures.length} failed rules
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
