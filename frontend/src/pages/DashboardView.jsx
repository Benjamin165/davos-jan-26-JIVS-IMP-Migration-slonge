import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  LayoutDashboard,
  RefreshCw,
  Star,
  Edit2,
  Settings,
  Plus,
  Database,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp
} from 'lucide-react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import api from '../utils/api'
import { cn } from '../utils/cn'

// Chart colors
const COLORS = {
  completed: '#10B981',
  failed: '#EF4444',
  running: '#F59E0B',
  pending: '#3B82F6',
  warning: '#F97316'
}

// Custom Tooltip for charts
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-800 border border-dark-600 rounded-lg p-3 shadow-xl">
        <p className="text-white font-medium">{label || payload[0].name}</p>
        <p className="text-gray-400">
          Count: <span className="text-white font-bold">{payload[0].value?.toLocaleString()}</span>
        </p>
      </div>
    )
  }
  return null
}

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

export default function DashboardView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState(null)
  const [summary, setSummary] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDashboard = async () => {
    try {
      setIsLoading(true)
      const [dashboardRes, summaryRes] = await Promise.all([
        api.get(`/dashboards/${id}`),
        api.get('/reconciliation/summary')
      ])
      setDashboard(dashboardRes.data)
      setSummary(summaryRes.data)
      setError(null)
    } catch (err) {
      setError('Failed to load dashboard')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [id])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-dark-700 rounded-lg animate-pulse" />
          <div className="h-8 w-48 bg-dark-700 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/dashboards')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboards
        </button>
        <div className="p-4 rounded-lg bg-error-500/20 border border-error-500/50 text-error-400">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboards')}
            className="p-2 rounded-lg hover:bg-dark-700 transition-colors"
            title="Back to Dashboards"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{dashboard?.name}</h1>
                {dashboard?.is_default && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary-500/20 text-primary-400 text-xs">
                    <Star className="w-3 h-3 fill-current" />
                    Default
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-sm">
                Created {new Date(dashboard?.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchDashboard}
            className="btn-secondary px-4 py-2"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summary ? (
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
        ) : (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
          <div className="h-64">
            {summary ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Completed', value: summary.completed || 0, fill: COLORS.completed },
                    { name: 'Running', value: summary.running || 0, fill: COLORS.running },
                    { name: 'Pending', value: summary.pending || 0, fill: COLORS.pending },
                    { name: 'Failed', value: summary.failed || 0, fill: COLORS.failed },
                    { name: 'Warning', value: summary.warnings || 0, fill: COLORS.warning }
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                  <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
                    {[
                      { name: 'Completed', fill: COLORS.completed },
                      { name: 'Running', fill: COLORS.running },
                      { name: 'Pending', fill: COLORS.pending },
                      { name: 'Failed', fill: COLORS.failed },
                      { name: 'Warning', fill: COLORS.warning }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="animate-pulse">Loading chart...</div>
              </div>
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
          <div className="h-64">
            {summary ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Completed', value: summary.completed || 0 },
                      { name: 'Running', value: summary.running || 0 },
                      { name: 'Pending', value: summary.pending || 0 },
                      { name: 'Failed', value: summary.failed || 0 },
                      { name: 'Warning', value: summary.warnings || 0 }
                    ].filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: '#9CA3AF' }}
                  >
                    <Cell fill={COLORS.completed} />
                    <Cell fill={COLORS.running} />
                    <Cell fill={COLORS.pending} />
                    <Cell fill={COLORS.failed} />
                    <Cell fill={COLORS.warning} />
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="animate-pulse">Loading chart...</div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Dashboard Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold mb-4">Dashboard Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-dark-700/50">
            <p className="text-xs text-gray-400 mb-1">Dashboard ID</p>
            <p className="font-mono">{dashboard?.id}</p>
          </div>
          <div className="p-4 rounded-lg bg-dark-700/50">
            <p className="text-xs text-gray-400 mb-1">Name</p>
            <p className="font-medium">{dashboard?.name}</p>
          </div>
          <div className="p-4 rounded-lg bg-dark-700/50">
            <p className="text-xs text-gray-400 mb-1">Created</p>
            <p className="font-medium">{new Date(dashboard?.created_at).toLocaleDateString()}</p>
          </div>
          <div className="p-4 rounded-lg bg-dark-700/50">
            <p className="text-xs text-gray-400 mb-1">Status</p>
            <p className="font-medium">{dashboard?.is_default ? 'Default Dashboard' : 'Custom Dashboard'}</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
