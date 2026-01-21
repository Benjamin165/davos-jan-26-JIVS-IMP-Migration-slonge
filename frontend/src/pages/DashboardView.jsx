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
  TrendingUp,
  X,
  BarChart3,
  PieChartIcon,
  LineChart,
  Table2,
  Activity,
  Trash2,
  GripVertical,
  Save,
  Check
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

// Widget Types Library
const WIDGET_TYPES = [
  {
    id: 'summary-card',
    name: 'Summary Card',
    description: 'Display a single metric with icon',
    icon: Activity,
    category: 'metrics',
    defaultConfig: { metric: 'total', title: 'Total Objects', color: 'primary' }
  },
  {
    id: 'bar-chart',
    name: 'Bar Chart',
    description: 'Visualize data with vertical bars',
    icon: BarChart3,
    category: 'charts',
    defaultConfig: { dataSource: 'status', title: 'Status Distribution' }
  },
  {
    id: 'pie-chart',
    name: 'Pie Chart',
    description: 'Show proportions in a circular chart',
    icon: PieChartIcon,
    category: 'charts',
    defaultConfig: { dataSource: 'severity', title: 'Severity Breakdown' }
  },
  {
    id: 'line-chart',
    name: 'Line Chart',
    description: 'Track trends over time',
    icon: LineChart,
    category: 'charts',
    defaultConfig: { dataSource: 'timeline', title: 'Migration Progress' }
  },
  {
    id: 'stats-grid',
    name: 'Stats Grid',
    description: 'Multiple metrics in a grid layout',
    icon: Table2,
    category: 'metrics',
    defaultConfig: { metrics: ['pending', 'running', 'completed', 'failed'], title: 'Quick Stats' }
  }
]

// Widget Library Modal
function WidgetLibraryModal({ isOpen, onClose, onAddWidget }) {
  const [selectedWidget, setSelectedWidget] = useState(null)
  const [widgetConfig, setWidgetConfig] = useState({})
  const [step, setStep] = useState('select') // 'select' or 'configure'

  useEffect(() => {
    if (!isOpen) {
      setSelectedWidget(null)
      setWidgetConfig({})
      setStep('select')
    }
  }, [isOpen])

  const handleSelectWidget = (widget) => {
    setSelectedWidget(widget)
    setWidgetConfig({ ...widget.defaultConfig })
    setStep('configure')
  }

  const handleAddWidget = () => {
    onAddWidget({
      id: Date.now().toString(),
      type: selectedWidget.id,
      config: widgetConfig
    })
    onClose()
  }

  const handleBack = () => {
    setStep('select')
    setSelectedWidget(null)
  }

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-50"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-dark-800 rounded-xl border border-dark-600 shadow-2xl z-50 max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-600">
          <div className="flex items-center gap-2">
            {step === 'configure' && (
              <button
                onClick={handleBack}
                className="p-1 rounded hover:bg-dark-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-lg font-semibold">
              {step === 'select' ? 'Add Widget' : `Configure ${selectedWidget?.name}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-dark-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-130px)]">
          {step === 'select' ? (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm">
                Select a widget type to add to your dashboard
              </p>
              <div className="grid grid-cols-2 gap-4">
                {WIDGET_TYPES.map((widget) => {
                  const Icon = widget.icon
                  return (
                    <button
                      key={widget.id}
                      onClick={() => handleSelectWidget(widget)}
                      className="p-4 rounded-xl border border-dark-600 hover:border-primary-500/50 hover:bg-dark-700/50 transition-all text-left group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary-500/20 text-primary-400 group-hover:bg-primary-500/30 transition-colors">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-medium group-hover:text-primary-400 transition-colors">
                            {widget.name}
                          </h3>
                          <p className="text-sm text-gray-400 mt-1">
                            {widget.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Widget Title
                </label>
                <input
                  type="text"
                  value={widgetConfig.title || ''}
                  onChange={(e) => setWidgetConfig({ ...widgetConfig, title: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter widget title"
                />
              </div>

              {selectedWidget?.id === 'summary-card' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Metric
                    </label>
                    <select
                      value={widgetConfig.metric || 'total'}
                      onChange={(e) => setWidgetConfig({ ...widgetConfig, metric: e.target.value })}
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="total">Total Objects</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                      <option value="pending">Pending</option>
                      <option value="running">Running</option>
                      <option value="warnings">Warnings</option>
                      <option value="successRate">Success Rate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Color Theme
                    </label>
                    <div className="flex gap-3">
                      {['primary', 'success', 'error', 'warning'].map((color) => (
                        <button
                          key={color}
                          onClick={() => setWidgetConfig({ ...widgetConfig, color })}
                          className={cn(
                            'px-4 py-2 rounded-lg border capitalize transition-all',
                            widgetConfig.color === color
                              ? `bg-${color}-500/20 border-${color}-500 text-${color}-400`
                              : 'border-dark-600 hover:border-dark-500'
                          )}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {(selectedWidget?.id === 'bar-chart' || selectedWidget?.id === 'pie-chart') && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Data Source
                  </label>
                  <select
                    value={widgetConfig.dataSource || 'status'}
                    onChange={(e) => setWidgetConfig({ ...widgetConfig, dataSource: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="status">Status Distribution</option>
                    <option value="severity">Severity Breakdown</option>
                    <option value="phase">Phase Progress</option>
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'configure' && (
          <div className="flex justify-end gap-3 p-4 border-t border-dark-600">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddWidget}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Widget
            </button>
          </div>
        )}
      </motion.div>
    </>
  )
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

// Widget Renderer Component
function DashboardWidget({ widget, summary, onRemove, onDragStart, onDragOver, onDrop, isDragging }) {
  const widgetType = WIDGET_TYPES.find(w => w.id === widget.type)
  const Icon = widgetType?.icon || Activity

  const getMetricValue = (metric) => {
    if (!summary) return '...'
    switch (metric) {
      case 'total': return summary.total?.toLocaleString() || '0'
      case 'completed': return summary.completed?.toLocaleString() || '0'
      case 'failed': return summary.failed?.toLocaleString() || '0'
      case 'pending': return summary.pending?.toLocaleString() || '0'
      case 'running': return summary.running?.toLocaleString() || '0'
      case 'warnings': return summary.warnings?.toLocaleString() || '0'
      case 'successRate': return `${summary.successRate || 0}%`
      default: return '0'
    }
  }

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

  if (widget.type === 'summary-card') {
    const color = widget.config.color || 'primary'
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        draggable
        onDragStart={(e) => onDragStart(e, widget.id)}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, widget.id)}
        className={cn(
          'relative overflow-hidden rounded-xl p-6',
          'bg-gradient-to-br border group cursor-move',
          colorClasses[color],
          isDragging && 'opacity-50 ring-2 ring-primary-500'
        )}
      >
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-all cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
        <button
          onClick={() => onRemove(widget.id)}
          className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-dark-800/50 transition-all"
          title="Remove widget"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">{widget.config.title}</p>
            <p className="text-3xl font-bold">{getMetricValue(widget.config.metric)}</p>
          </div>
          <div className={cn('p-3 rounded-lg bg-dark-800/50', iconColors[color])}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </motion.div>
    )
  }

  if (widget.type === 'bar-chart') {
    const chartData = [
      { name: 'Completed', value: summary?.completed || 0, fill: COLORS.completed },
      { name: 'Running', value: summary?.running || 0, fill: COLORS.running },
      { name: 'Pending', value: summary?.pending || 0, fill: COLORS.pending },
      { name: 'Failed', value: summary?.failed || 0, fill: COLORS.failed },
      { name: 'Warning', value: summary?.warnings || 0, fill: COLORS.warning }
    ]
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        draggable
        onDragStart={(e) => onDragStart(e, widget.id)}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, widget.id)}
        className={cn("card p-6 relative group cursor-move", isDragging && 'opacity-50 ring-2 ring-primary-500')}
      >
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-all cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
        <button
          onClick={() => onRemove(widget.id)}
          className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-dark-700 transition-all z-10"
          title="Remove widget"
        >
          <X className="w-4 h-4" />
        </button>
        <h3 className="text-lg font-semibold mb-4">{widget.config.title}</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
              <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    )
  }

  if (widget.type === 'pie-chart') {
    const pieData = [
      { name: 'Completed', value: summary?.completed || 0 },
      { name: 'Running', value: summary?.running || 0 },
      { name: 'Pending', value: summary?.pending || 0 },
      { name: 'Failed', value: summary?.failed || 0 },
      { name: 'Warning', value: summary?.warnings || 0 }
    ].filter(item => item.value > 0)
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        draggable
        onDragStart={(e) => onDragStart(e, widget.id)}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, widget.id)}
        className={cn("card p-6 relative group cursor-move", isDragging && 'opacity-50 ring-2 ring-primary-500')}
      >
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-all cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
        <button
          onClick={() => onRemove(widget.id)}
          className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-dark-700 transition-all z-10"
          title="Remove widget"
        >
          <X className="w-4 h-4" />
        </button>
        <h3 className="text-lg font-semibold mb-4">{widget.config.title}</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={60} dataKey="value">
                <Cell fill={COLORS.completed} />
                <Cell fill={COLORS.running} />
                <Cell fill={COLORS.pending} />
                <Cell fill={COLORS.failed} />
                <Cell fill={COLORS.warning} />
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    )
  }

  if (widget.type === 'stats-grid') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        draggable
        onDragStart={(e) => onDragStart(e, widget.id)}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, widget.id)}
        className={cn("card p-6 relative group cursor-move", isDragging && 'opacity-50 ring-2 ring-primary-500')}
      >
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-all cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
        <button
          onClick={() => onRemove(widget.id)}
          className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-dark-700 transition-all z-10"
          title="Remove widget"
        >
          <X className="w-4 h-4" />
        </button>
        <h3 className="text-lg font-semibold mb-4">{widget.config.title}</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-blue-500/10 text-center">
            <p className="text-xl font-bold text-blue-400">{summary?.pending || 0}</p>
            <p className="text-xs text-gray-400">Pending</p>
          </div>
          <div className="p-3 rounded-lg bg-yellow-500/10 text-center">
            <p className="text-xl font-bold text-yellow-400">{summary?.running || 0}</p>
            <p className="text-xs text-gray-400">Running</p>
          </div>
          <div className="p-3 rounded-lg bg-green-500/10 text-center">
            <p className="text-xl font-bold text-green-400">{summary?.completed || 0}</p>
            <p className="text-xs text-gray-400">Completed</p>
          </div>
          <div className="p-3 rounded-lg bg-red-500/10 text-center">
            <p className="text-xl font-bold text-red-400">{summary?.failed || 0}</p>
            <p className="text-xs text-gray-400">Failed</p>
          </div>
        </div>
      </motion.div>
    )
  }

  // Default fallback
  return (
    <div className="card p-6 text-center text-gray-400">
      Unknown widget type: {widget.type}
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
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false)
  const [widgets, setWidgets] = useState([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [draggedWidget, setDraggedWidget] = useState(null)

  // Drag and drop handlers
  const handleDragStart = (e, widgetId) => {
    setDraggedWidget(widgetId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', widgetId)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, targetWidgetId) => {
    e.preventDefault()
    if (!draggedWidget || draggedWidget === targetWidgetId) {
      setDraggedWidget(null)
      return
    }

    // Reorder widgets
    const newWidgets = [...widgets]
    const draggedIndex = newWidgets.findIndex(w => w.id === draggedWidget)
    const targetIndex = newWidgets.findIndex(w => w.id === targetWidgetId)

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [removed] = newWidgets.splice(draggedIndex, 1)
      newWidgets.splice(targetIndex, 0, removed)
      setWidgets(newWidgets)
      setHasUnsavedChanges(true)
    }

    setDraggedWidget(null)
  }

  const fetchDashboard = async () => {
    try {
      setIsLoading(true)
      const [dashboardRes, summaryRes] = await Promise.all([
        api.get(`/dashboards/${id}`),
        api.get('/reconciliation/summary')
      ])
      setDashboard(dashboardRes.data)
      setSummary(summaryRes.data)
      // Load widgets from dashboard layout
      setWidgets(dashboardRes.data.layout || [])
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

  // Auto-hide success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const handleAddWidget = (widget) => {
    setWidgets([...widgets, widget])
    setHasUnsavedChanges(true)
  }

  const handleRemoveWidget = (widgetId) => {
    setWidgets(widgets.filter(w => w.id !== widgetId))
    setHasUnsavedChanges(true)
  }

  const handleSaveDashboard = async () => {
    setIsSaving(true)
    try {
      await api.put(`/dashboards/${id}`, { layout: widgets })
      setHasUnsavedChanges(false)
      setSuccessMessage('Dashboard saved successfully!')
    } catch (err) {
      console.error('Failed to save dashboard:', err)
    } finally {
      setIsSaving(false)
    }
  }

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
            onClick={() => setShowWidgetLibrary(true)}
            className="btn-secondary px-4 py-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Widget
          </button>
          {hasUnsavedChanges && (
            <button
              onClick={handleSaveDashboard}
              disabled={isSaving}
              className="btn-primary px-4 py-2"
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Dashboard
            </button>
          )}
          <button
            onClick={fetchDashboard}
            className="btn-secondary px-4 py-2"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-lg bg-success-500/20 border border-success-500/50 text-success-400 flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Widgets */}
      {widgets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {widgets.map((widget) => (
            <DashboardWidget
              key={widget.id}
              widget={widget}
              summary={summary}
              onRemove={handleRemoveWidget}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              isDragging={draggedWidget === widget.id}
            />
          ))}
        </div>
      )}

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

      {/* Widget Library Modal */}
      <AnimatePresence>
        {showWidgetLibrary && (
          <WidgetLibraryModal
            isOpen={showWidgetLibrary}
            onClose={() => setShowWidgetLibrary(false)}
            onAddWidget={handleAddWidget}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
