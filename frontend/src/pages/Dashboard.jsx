import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Database,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  RefreshCw
} from 'lucide-react'
import api from '../utils/api'
import { cn } from '../utils/cn'

// Summary Card Component
function SummaryCard({ title, value, icon: Icon, trend, color, delay }) {
  const colorClasses = {
    primary: 'from-primary-500/20 to-primary-600/10 border-primary-500/30',
    success: 'from-success-500/20 to-success-600/10 border-success-500/30',
    error: 'from-error-500/20 to-error-600/10 border-error-500/30',
    warning: 'from-warning-500/20 to-warning-600/10 border-warning-500/30'
  }

  const iconColors = {
    primary: 'text-primary-400',
    success: 'text-success-400',
    error: 'text-error-400',
    warning: 'text-warning-400'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn(
        'relative overflow-hidden rounded-xl p-6',
        'bg-gradient-to-br border',
        colorClasses[color]
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2 text-xs">
              <TrendingUp className="w-3 h-3 text-success-400" />
              <span className="text-success-400">{trend}</span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-lg bg-dark-800/50', iconColors[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  )
}

// Skeleton loader
function SkeletonCard() {
  return (
    <div className="rounded-xl p-6 bg-dark-800 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="h-4 w-24 bg-dark-700 rounded" />
          <div className="h-8 w-32 bg-dark-700 rounded" />
        </div>
        <div className="w-12 h-12 bg-dark-700 rounded-lg" />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.get('/reconciliation/summary')
      setSummary(response.data)
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-400">Migration reconciliation overview</p>
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

      {error && (
        <div className="p-4 rounded-lg bg-error-500/20 border border-error-500/50 text-error-400">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : summary ? (
          <>
            <SummaryCard
              title="Total Objects"
              value={summary.total?.toLocaleString() || '0'}
              icon={Database}
              color="primary"
              delay={0.1}
            />
            <SummaryCard
              title="Success Rate"
              value={`${summary.successRate || 0}%`}
              icon={CheckCircle}
              trend="+2.5% from last run"
              color="success"
              delay={0.2}
            />
            <SummaryCard
              title="Failed Items"
              value={summary.failed?.toLocaleString() || '0'}
              icon={XCircle}
              color="error"
              delay={0.3}
            />
            <SummaryCard
              title="Warnings"
              value={summary.warnings?.toLocaleString() || '0'}
              icon={AlertTriangle}
              color="warning"
              delay={0.4}
            />
          </>
        ) : null}
      </div>

      {/* Charts placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            {isLoading ? (
              <div className="animate-pulse">Loading chart...</div>
            ) : (
              <p>Chart visualization will be displayed here</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Severity Breakdown</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            {isLoading ? (
              <div className="animate-pulse">Loading chart...</div>
            ) : (
              <p>Chart visualization will be displayed here</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Stats */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="p-4 rounded-lg bg-dark-700/50">
              <p className="text-2xl font-bold text-blue-400">{summary.pending || 0}</p>
              <p className="text-sm text-gray-400">Pending</p>
            </div>
            <div className="p-4 rounded-lg bg-dark-700/50">
              <p className="text-2xl font-bold text-yellow-400">{summary.running || 0}</p>
              <p className="text-sm text-gray-400">Running</p>
            </div>
            <div className="p-4 rounded-lg bg-dark-700/50">
              <p className="text-2xl font-bold text-green-400">{summary.completed || 0}</p>
              <p className="text-sm text-gray-400">Completed</p>
            </div>
            <div className="p-4 rounded-lg bg-dark-700/50">
              <p className="text-2xl font-bold text-red-400">{summary.failed || 0}</p>
              <p className="text-sm text-gray-400">Failed</p>
            </div>
            <div className="p-4 rounded-lg bg-dark-700/50">
              <p className="text-2xl font-bold text-orange-400">{summary.warnings || 0}</p>
              <p className="text-sm text-gray-400">Warnings</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
