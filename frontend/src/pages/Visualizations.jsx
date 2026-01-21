import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  Table,
  Plus,
  X,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  Check,
  Sparkles,
  LayoutGrid,
  Copy,
  ChevronRight,
  ChevronLeft,
  Save,
  Filter,
  Settings2,
  Database,
  Wand2,
  Send,
  MessageSquare
} from 'lucide-react'
import {
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  LineChart as RechartsLine,
  Line,
  AreaChart,
  Area,
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

// Chart type icons and labels
const CHART_TYPES = {
  bar: { icon: BarChart3, label: 'Bar Chart', color: 'text-blue-400' },
  line: { icon: LineChart, label: 'Line Chart', color: 'text-green-400' },
  pie: { icon: PieChart, label: 'Pie Chart', color: 'text-purple-400' },
  area: { icon: TrendingUp, label: 'Area Chart', color: 'text-orange-400' },
  donut: { icon: PieChart, label: 'Donut Chart', color: 'text-pink-400' },
  table: { icon: Table, label: 'Data Table', color: 'text-gray-400' }
}

// Template categories
const CATEGORIES = [
  { id: 'all', label: 'All Templates' },
  { id: 'status', label: 'Status Overview' },
  { id: 'performance', label: 'Performance' },
  { id: 'comparison', label: 'Comparison' },
  { id: 'trends', label: 'Trends' }
]

// Sample data for previews
const SAMPLE_DATA = [
  { name: 'Completed', value: 1962, fill: '#10B981' },
  { name: 'Running', value: 502, fill: '#F59E0B' },
  { name: 'Pending', value: 541, fill: '#3B82F6' },
  { name: 'Failed', value: 484, fill: '#EF4444' },
  { name: 'Warning', value: 487, fill: '#F97316' }
]

// Chart Preview Component
function ChartPreview({ type, data = SAMPLE_DATA, small = false }) {
  const height = small ? 120 : 200

  if (type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
          <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} />
          <Tooltip />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )
  }

  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLine data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
          <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
        </RechartsLine>
      </ResponsiveContainer>
    )
  }

  if (type === 'pie' || type === 'donut') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPie>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={type === 'donut' ? 30 : 0}
            outerRadius={small ? 40 : 60}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip />
        </RechartsPie>
      </ResponsiveContainer>
    )
  }

  if (type === 'area') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
          <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} />
          <Tooltip />
          <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  if (type === 'table') {
    return (
      <div className={cn("overflow-auto", small ? "max-h-28" : "max-h-48")}>
        <table className="w-full text-xs">
          <thead className="bg-dark-700">
            <tr>
              <th className="px-2 py-1 text-left">Name</th>
              <th className="px-2 py-1 text-right">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-600">
            {data.slice(0, small ? 3 : 5).map((row, i) => (
              <tr key={i}>
                <td className="px-2 py-1">{row.name}</td>
                <td className="px-2 py-1 text-right">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return null
}

// Template Card Component
function TemplateCard({ template, onSelect, onPreview }) {
  const typeConfig = CHART_TYPES[template.type] || CHART_TYPES.bar
  const Icon = typeConfig.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden hover:border-primary-500/50 transition-all cursor-pointer group"
      onClick={() => onSelect(template)}
    >
      {/* Preview */}
      <div className="h-40 bg-dark-900/50 p-4 relative">
        <ChartPreview type={template.type} small />
        <div className="absolute inset-0 bg-dark-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onPreview(template)
            }}
            className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onSelect(template)
            }}
            className="p-2 rounded-lg bg-primary-500 hover:bg-primary-600 transition-colors"
          >
            <Copy className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={cn("w-4 h-4", typeConfig.color)} />
          <span className="text-xs text-gray-400">{typeConfig.label}</span>
          {template.is_system_template && (
            <span className="ml-auto px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400 text-xs">
              System
            </span>
          )}
        </div>
        <h3 className="font-medium truncate">{template.name}</h3>
        {template.config?.description && (
          <p className="text-sm text-gray-400 mt-1 line-clamp-2">{template.config.description}</p>
        )}
      </div>
    </motion.div>
  )
}

// Preview Modal
function PreviewModal({ template, onClose }) {
  if (!template) return null

  const typeConfig = CHART_TYPES[template.type] || CHART_TYPES.bar

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-50"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-dark-800 rounded-xl border border-dark-600 shadow-2xl z-50"
      >
        <div className="flex items-center justify-between p-4 border-b border-dark-600">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg bg-dark-700", typeConfig.color)}>
              <typeConfig.icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold">{template.name}</h2>
              <p className="text-sm text-gray-400">{typeConfig.label}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-dark-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-dark-900 rounded-lg p-4">
            <ChartPreview type={template.type} />
          </div>

          {template.config?.description && (
            <p className="mt-4 text-gray-400">{template.config.description}</p>
          )}

          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
            >
              Use This Template
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}

// Skeleton Card
function SkeletonCard() {
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden animate-pulse">
      <div className="h-40 bg-dark-700" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-20 bg-dark-700 rounded" />
        <div className="h-5 w-32 bg-dark-700 rounded" />
      </div>
    </div>
  )
}

// Data fields available for mapping
const DATA_FIELDS = [
  { id: 'status', label: 'Status', description: 'Object status (Pending, Running, Completed, Failed, Warning)' },
  { id: 'severity', label: 'Severity', description: 'Issue severity level' },
  { id: 'phase', label: 'Phase', description: 'Migration phase (Extract, Transform, Load, Validate, Reconcile)' },
  { id: 'object_type', label: 'Object Type', description: 'Type of migrated object' },
  { id: 'count', label: 'Count', description: 'Number of records' },
  { id: 'date', label: 'Date', description: 'Date/time field' }
]

// Filter options
const FILTER_OPTIONS = [
  { id: 'status', label: 'Status', values: ['Pending', 'Running', 'Completed', 'Failed', 'Warning'] },
  { id: 'severity', label: 'Severity', values: ['Critical', 'High', 'Medium', 'Low', 'Info'] },
  { id: 'phase', label: 'Phase', values: ['Extract', 'Transform', 'Load', 'Validate', 'Reconcile'] }
]

// Create Visualization Modal
function CreateVisualizationModal({ onClose, onSave, initialType }) {
  const [step, setStep] = useState(1)
  const [chartType, setChartType] = useState(initialType || 'bar')
  const [name, setName] = useState('')
  const [xAxisField, setXAxisField] = useState('status')
  const [yAxisField, setYAxisField] = useState('count')
  const [filters, setFilters] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const totalSteps = 5
  const chartTypes = ['bar', 'line', 'pie', 'area', 'donut', 'table']

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter a name for your visualization')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      await onSave({
        name: name.trim(),
        type: chartType,
        config: {
          xAxis: xAxisField,
          yAxis: yAxisField,
          filters
        }
      })
    } catch (err) {
      setError(err.message || 'Failed to save visualization')
      setIsSaving(false)
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select Chart Type</h3>
            <p className="text-gray-400 text-sm">Choose the type of visualization you want to create</p>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {chartTypes.map((type) => {
                const config = CHART_TYPES[type]
                const Icon = config.icon
                return (
                  <button
                    key={type}
                    onClick={() => setChartType(type)}
                    className={cn(
                      'p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1',
                      chartType === type
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-dark-600 hover:border-dark-500 bg-dark-700/50'
                    )}
                  >
                    <Icon className={cn('w-6 h-6', config.color)} />
                    <span className="text-xs font-medium">{config.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Map Data Fields</h3>
            <p className="text-gray-400 text-sm">Configure which data fields to use for your chart axes</p>

            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {chartType === 'pie' || chartType === 'donut' ? 'Category Field' : 'X-Axis (Category)'}
                </label>
                <select
                  value={xAxisField}
                  onChange={(e) => setXAxisField(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {DATA_FIELDS.map((field) => (
                    <option key={field.id} value={field.id}>{field.label}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {DATA_FIELDS.find(f => f.id === xAxisField)?.description}
                </p>
              </div>

              {chartType !== 'pie' && chartType !== 'donut' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Y-Axis (Value)</label>
                  <select
                    value={yAxisField}
                    onChange={(e) => setYAxisField(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {DATA_FIELDS.filter(f => f.id === 'count').map((field) => (
                      <option key={field.id} value={field.id}>{field.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Configure Filters</h3>
            <p className="text-gray-400 text-sm">Optionally filter the data to display</p>

            <div className="space-y-4 mt-4">
              {FILTER_OPTIONS.map((filter) => (
                <div key={filter.id}>
                  <label className="block text-sm font-medium mb-2">{filter.label}</label>
                  <select
                    value={filters[filter.id] || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      [filter.id]: e.target.value || undefined
                    }))}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All {filter.label}s</option>
                    {filter.values.map((val) => (
                      <option key={val} value={val}>{val}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Preview Visualization</h3>
            <p className="text-gray-400 text-sm">Review how your visualization will look</p>

            <div className="bg-dark-900 rounded-lg p-6 mt-4">
              <ChartPreview type={chartType} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-dark-700/50 rounded-lg">
                <p className="text-gray-400">Chart Type</p>
                <p className="font-medium">{CHART_TYPES[chartType].label}</p>
              </div>
              <div className="p-3 bg-dark-700/50 rounded-lg">
                <p className="text-gray-400">Category Field</p>
                <p className="font-medium">{DATA_FIELDS.find(f => f.id === xAxisField)?.label}</p>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Save Visualization</h3>
            <p className="text-gray-400 text-sm">Give your visualization a name to save it</p>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Visualization Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Monthly Status Overview"
                className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-error-500/20 border border-error-500/50 text-error-400 text-sm">
                {error}
              </div>
            )}

            <div className="bg-dark-700/50 rounded-lg p-4 mt-4">
              <h4 className="font-medium mb-2">Summary</h4>
              <div className="space-y-1 text-sm text-gray-400">
                <p>Type: {CHART_TYPES[chartType].label}</p>
                <p>Category: {DATA_FIELDS.find(f => f.id === xAxisField)?.label}</p>
                <p>Filters: {Object.keys(filters).filter(k => filters[k]).length || 'None'}</p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-50"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-dark-800 rounded-xl border border-dark-600 shadow-2xl z-50 max-h-[80vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-600 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-500/20 text-primary-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold">Create Visualization</h2>
              <p className="text-sm text-gray-400">Step {step} of {totalSteps}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-dark-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-4 pt-4 shrink-0">
          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1 flex-1 rounded-full transition-colors',
                  i + 1 <= step ? 'bg-primary-500' : 'bg-dark-600'
                )}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Chart Type</span>
            <span>Data</span>
            <span>Filters</span>
            <span>Preview</span>
            <span>Save</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-dark-600 shrink-0">
          <button
            onClick={() => step > 1 && setStep(step - 1)}
            disabled={step === 1}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
              step === 1
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-gray-400 hover:text-white hover:bg-dark-700'
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-2 px-6 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={isSaving || !name.trim()}
              className={cn(
                'flex items-center gap-2 px-6 py-2 rounded-lg transition-colors',
                isSaving || !name.trim()
                  ? 'bg-primary-500/50 cursor-not-allowed'
                  : 'bg-primary-500 hover:bg-primary-600'
              )}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Visualization
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </>
  )
}

// Saved Visualization Card
function SavedVisualizationCard({ visualization, onDelete }) {
  const typeConfig = CHART_TYPES[visualization.type] || CHART_TYPES.bar
  const Icon = typeConfig.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden hover:border-primary-500/50 transition-all"
    >
      <div className="h-32 bg-dark-900/50 p-4">
        <ChartPreview type={visualization.type} small />
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={cn("w-4 h-4", typeConfig.color)} />
          <span className="text-xs text-gray-400">{typeConfig.label}</span>
        </div>
        <h3 className="font-medium truncate">{visualization.name}</h3>
        <p className="text-xs text-gray-500 mt-1">
          Created {new Date(visualization.created_at).toLocaleDateString()}
        </p>
        <div className="flex gap-2 mt-3">
          <button className="flex-1 px-3 py-1.5 text-sm bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors">
            <Eye className="w-3 h-3 inline mr-1" />
            View
          </button>
          <button
            onClick={() => onDelete(visualization.id)}
            className="px-3 py-1.5 text-sm bg-dark-700 hover:bg-error-500/20 hover:text-error-400 rounded-lg transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// AI Generated Visualization Preview
function AIGeneratedPreview({ visualization, previewData, onSave, onClose }) {
  const typeConfig = CHART_TYPES[visualization.type] || CHART_TYPES.bar
  const chartData = previewData.map((item, idx) => ({
    ...item,
    fill: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'][idx % 7]
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-800 border border-dark-600 rounded-xl p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={cn("p-2 rounded-lg bg-dark-700", typeConfig.color)}>
            <typeConfig.icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-medium">{visualization.name}</h3>
            <p className="text-xs text-gray-400">{typeConfig.label}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-dark-700 rounded">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-dark-900 rounded-lg p-4 mb-4">
        <ChartPreview type={visualization.type} data={chartData} />
      </div>

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
        >
          Discard
        </button>
        <button
          onClick={onSave}
          className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
        >
          <Save className="w-4 h-4 inline mr-2" />
          Save Visualization
        </button>
      </div>
    </motion.div>
  )
}

export default function Visualizations() {
  const [templates, setTemplates] = useState([])
  const [savedVisualizations, setSavedVisualizations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeTab, setActiveTab] = useState('templates')
  const [aiPrompt, setAiPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedVisualization, setGeneratedVisualization] = useState(null)
  const [generatedPreviewData, setGeneratedPreviewData] = useState(null)

  const fetchTemplates = async () => {
    try {
      setIsLoading(true)
      const response = await api.get('/visualizations/templates')
      setTemplates(response.data.templates)
      setError(null)
    } catch (err) {
      setError('Failed to load templates')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSavedVisualizations = async () => {
    try {
      const response = await api.get('/visualizations')
      setSavedVisualizations(response.data.visualizations)
    } catch (err) {
      console.error('Failed to load saved visualizations:', err)
    }
  }

  useEffect(() => {
    fetchTemplates()
    fetchSavedVisualizations()
  }, [])

  // Auto-hide success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const handleSelectTemplate = (template) => {
    setSuccessMessage(`Template "${template.name}" selected!`)
    setShowCreateModal(true)
  }

  const handleCreateVisualization = async (visualizationData) => {
    try {
      const response = await api.post('/visualizations', visualizationData)
      setSavedVisualizations(prev => [response.data.visualization, ...prev])
      setSuccessMessage(`Visualization "${visualizationData.name}" created successfully!`)
      setShowCreateModal(false)
      setActiveTab('saved')
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to create visualization')
    }
  }

  const handleDeleteVisualization = async (id) => {
    if (!confirm('Are you sure you want to delete this visualization?')) return

    try {
      await api.delete(`/visualizations/${id}`)
      setSavedVisualizations(prev => prev.filter(v => v.id !== id))
      setSuccessMessage('Visualization deleted successfully!')
    } catch (err) {
      setError('Failed to delete visualization')
    }
  }

  const handleGenerateFromPrompt = async () => {
    if (!aiPrompt.trim()) return

    setIsGenerating(true)
    setError(null)

    try {
      const response = await api.post('/ai/generate-visual', { prompt: aiPrompt })
      setGeneratedVisualization(response.data.visualization)
      setGeneratedPreviewData(response.data.previewData)
      setSuccessMessage('Visualization generated! Review and save below.')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate visualization')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveGeneratedVisualization = async () => {
    if (!generatedVisualization) return

    try {
      const response = await api.post('/visualizations', generatedVisualization)
      setSavedVisualizations(prev => [response.data.visualization, ...prev])
      setSuccessMessage(`Visualization "${generatedVisualization.name}" saved!`)
      setGeneratedVisualization(null)
      setGeneratedPreviewData(null)
      setAiPrompt('')
      setActiveTab('saved')
    } catch (err) {
      setError('Failed to save visualization')
    }
  }

  // Filter templates by category
  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter(t => t.config?.category === selectedCategory)

  // Group templates by type for display
  const templatesByType = filteredTemplates.reduce((acc, template) => {
    const type = template.type || 'other'
    if (!acc[type]) acc[type] = []
    acc[type].push(template)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Visualization Builder</h1>
          <p className="text-gray-400">Create custom visualizations from templates</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchTemplates}
            disabled={isLoading}
            className="btn-secondary px-4 py-2"
          >
            <RefreshCw className={cn('w-4 h-4 mr-2', isLoading && 'animate-spin')} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary px-4 py-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Custom
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

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-error-500/20 border border-error-500/50 text-error-400">
          {error}
        </div>
      )}

      {/* AI Prompt Section */}
      <div className="bg-gradient-to-r from-primary-500/10 to-purple-500/10 border border-primary-500/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Wand2 className="w-5 h-5 text-primary-400" />
          <h3 className="font-medium">AI-Powered Visualization</h3>
        </div>
        <p className="text-sm text-gray-400 mb-3">
          Describe what you want to see in plain English. Try: "show failures by object type as pie chart" or "completed items by phase"
        </p>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerateFromPrompt()}
              placeholder="Describe your visualization..."
              className="w-full pl-10 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            onClick={handleGenerateFromPrompt}
            disabled={isGenerating || !aiPrompt.trim()}
            className={cn(
              'px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2',
              isGenerating || !aiPrompt.trim()
                ? 'bg-primary-500/50 cursor-not-allowed'
                : 'bg-primary-500 hover:bg-primary-600'
            )}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Generate
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Generated Preview */}
      <AnimatePresence>
        {generatedVisualization && generatedPreviewData && (
          <AIGeneratedPreview
            visualization={generatedVisualization}
            previewData={generatedPreviewData}
            onSave={handleSaveGeneratedVisualization}
            onClose={() => {
              setGeneratedVisualization(null)
              setGeneratedPreviewData(null)
            }}
          />
        )}
      </AnimatePresence>

      {/* Tabs: Templates / Saved */}
      <div className="flex border-b border-dark-600">
        <button
          onClick={() => setActiveTab('templates')}
          className={cn(
            'px-6 py-3 font-medium transition-colors border-b-2 -mb-px',
            activeTab === 'templates'
              ? 'text-primary-400 border-primary-500'
              : 'text-gray-400 border-transparent hover:text-white'
          )}
        >
          <LayoutGrid className="w-4 h-4 inline mr-2" />
          Template Library
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={cn(
            'px-6 py-3 font-medium transition-colors border-b-2 -mb-px',
            activeTab === 'saved'
              ? 'text-primary-400 border-primary-500'
              : 'text-gray-400 border-transparent hover:text-white'
          )}
        >
          <Database className="w-4 h-4 inline mr-2" />
          Saved Visualizations
          {savedVisualizations.length > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full bg-dark-600 text-xs">
              {savedVisualizations.length}
            </span>
          )}
        </button>
      </div>

      {/* Category Filter - only show for templates tab */}
      {activeTab === 'templates' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                selectedCategory === category.id
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/50'
                  : 'bg-dark-700 text-gray-400 hover:text-white border border-transparent'
              )}
            >
              {category.label}
            </button>
          ))}
        </div>
      )}

      {/* Saved Visualizations Tab */}
      {activeTab === 'saved' && (
        <div>
          {savedVisualizations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {savedVisualizations.map((viz) => (
                <SavedVisualizationCard
                  key={viz.id}
                  visualization={viz}
                  onDelete={handleDeleteVisualization}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Database className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">No saved visualizations</h3>
              <p className="text-gray-500 mb-4">
                Create a custom visualization to see it here
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary px-6 py-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Visualization
              </button>
            </div>
          )}
        </div>
      )}

      {/* Template Library Tab */}
      {activeTab === 'templates' && (
        <>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : filteredTemplates.length > 0 ? (
            <div className="space-y-8">
              {/* If filtering by 'all', group by type */}
              {selectedCategory === 'all' ? (
                Object.entries(templatesByType).map(([type, typeTemplates]) => {
                  const typeConfig = CHART_TYPES[type] || CHART_TYPES.bar
                  return (
                    <div key={type}>
                      <div className="flex items-center gap-2 mb-4">
                        <typeConfig.icon className={cn('w-5 h-5', typeConfig.color)} />
                        <h2 className="text-lg font-semibold">{typeConfig.label}s</h2>
                        <span className="text-sm text-gray-400">({typeTemplates.length})</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {typeTemplates.map((template) => (
                          <TemplateCard
                            key={template.id}
                            template={template}
                            onSelect={handleSelectTemplate}
                            onPreview={setPreviewTemplate}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onSelect={handleSelectTemplate}
                      onPreview={setPreviewTemplate}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Sparkles className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">No templates found</h3>
              <p className="text-gray-500 mb-4">
                {selectedCategory !== 'all'
                  ? 'Try selecting a different category'
                  : 'No visualization templates available yet'}
              </p>
            </div>
          )}
        </>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {previewTemplate && (
          <PreviewModal
            template={previewTemplate}
            onClose={() => setPreviewTemplate(null)}
          />
        )}
      </AnimatePresence>

      {/* Create Visualization Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateVisualizationModal
            onClose={() => setShowCreateModal(false)}
            onSave={handleCreateVisualization}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
