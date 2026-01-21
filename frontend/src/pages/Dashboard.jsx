import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Database,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUp,
  ArrowDown,
  ArrowUpDown
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

// Status badge component
function StatusBadge({ status }) {
  const statusConfig = {
    completed: { bg: 'bg-success-500/20', text: 'text-success-400', label: 'Completed' },
    failed: { bg: 'bg-error-500/20', text: 'text-error-400', label: 'Failed' },
    running: { bg: 'bg-warning-500/20', text: 'text-warning-400', label: 'Running' },
    pending: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Pending' },
    warning: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'Warning' }
  }
  const config = statusConfig[status] || statusConfig.pending
  return (
    <span className={cn('px-2 py-1 rounded-full text-xs font-medium', config.bg, config.text)}>
      {config.label}
    </span>
  )
}

// Severity badge component
function SeverityBadge({ severity }) {
  const severityConfig = {
    critical: { bg: 'bg-red-500/20', text: 'text-red-400' },
    high: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
    medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
    low: { bg: 'bg-green-500/20', text: 'text-green-400' }
  }
  const config = severityConfig[severity] || severityConfig.low
  return (
    <span className={cn('px-2 py-1 rounded-full text-xs font-medium capitalize', config.bg, config.text)}>
      {severity || 'N/A'}
    </span>
  )
}

// Sortable column header component
function SortableHeader({ label, column, currentSort, onSort }) {
  const isActive = currentSort.column === column
  const direction = isActive ? currentSort.direction : null

  return (
    <th
      onClick={() => onSort(column)}
      className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-dark-600/50 transition-colors select-none"
    >
      <div className="flex items-center gap-1">
        {label}
        <span className="w-4 h-4 inline-flex items-center justify-center">
          {isActive ? (
            direction === 'asc' ? (
              <ArrowUp className="w-3 h-3 text-primary-400" />
            ) : (
              <ArrowDown className="w-3 h-3 text-primary-400" />
            )
          ) : (
            <ArrowUpDown className="w-3 h-3 opacity-30" />
          )}
        </span>
      </div>
    </th>
  )
}

// Data Table component
function DataTable({ data, pagination, isLoading, onPageChange, onSearch, onFilterChange, onClearFilters, onSort, filters, searchTerm, sort }) {
  const [searchValue, setSearchValue] = useState(searchTerm || '')

  // Sync local search value with parent state
  useEffect(() => {
    setSearchValue(searchTerm || '')
  }, [searchTerm])

  const handleSearch = (e) => {
    e.preventDefault()
    onSearch(searchValue)
  }

  const handleFilterChange = (filterName, value) => {
    onFilterChange(filterName, value)
  }

  const clearFilters = () => {
    setSearchValue('')
    onClearFilters()
  }

  const handleSort = (column) => {
    onSort(column)
  }

  const hasActiveFilters = filters?.status || filters?.severity || searchValue

  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-dark-700 rounded w-64" />
          <div className="h-8 bg-dark-700 rounded" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-dark-700 rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="card overflow-hidden"
    >
      <div className="p-4 border-b border-dark-600">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h3 className="text-lg font-semibold">Reconciliation Data</h3>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Filter */}
            <select
              value={filters?.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Filter by status"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="warning">Warning</option>
            </select>

            {/* Severity Filter */}
            <select
              value={filters?.severity || ''}
              onChange={(e) => handleFilterChange('severity', e.target.value)}
              className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Filter by severity"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button type="submit" className="btn-secondary px-4 py-2 text-sm">
                Search
              </button>
            </form>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-dark-700/50">
            <tr>
              <SortableHeader label="ID" column="id" currentSort={sort} onSort={handleSort} />
              <SortableHeader label="Source Object" column="source_object" currentSort={sort} onSort={handleSort} />
              <SortableHeader label="Target Object" column="target_object" currentSort={sort} onSort={handleSort} />
              <SortableHeader label="Status" column="load_status" currentSort={sort} onSort={handleSort} />
              <SortableHeader label="Severity" column="severity" currentSort={sort} onSort={handleSort} />
              <SortableHeader label="Phase" column="phase" currentSort={sort} onSort={handleSort} />
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-600">
            {data && data.length > 0 ? (
              data.map((row) => (
                <tr key={row.id} className="hover:bg-dark-700/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono">{row.id}</td>
                  <td className="px-4 py-3 text-sm truncate max-w-[200px]" title={row.source_object}>
                    {row.source_object || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm truncate max-w-[200px]" title={row.target_object}>
                    {row.target_object || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={row.load_status} />
                  </td>
                  <td className="px-4 py-3">
                    <SeverityBadge severity={row.severity} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{row.phase || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="p-4 border-t border-dark-600 flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total?.toLocaleString()} records
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-lg hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 rounded-lg hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [tableData, setTableData] = useState([])
  const [pagination, setPagination] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [tableLoading, setTableLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({ status: '', severity: '' })
  const [sort, setSort] = useState({ column: 'id', direction: 'asc' })

  const fetchSummary = async () => {
    try {
      const response = await api.get('/reconciliation/summary')
      setSummary(response.data)
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error(err)
    }
  }

  const fetchTableData = async (page = 1, search = '', activeFilters = filters, activeSort = sort) => {
    setTableLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 20 })
      if (search) params.append('search', search)
      if (activeFilters.status) params.append('status', activeFilters.status)
      if (activeFilters.severity) params.append('severity', activeFilters.severity)
      if (activeSort.column) params.append('sort_by', activeSort.column)
      if (activeSort.direction) params.append('sort_order', activeSort.direction)
      const response = await api.get(`/reconciliation?${params}`)
      setTableData(response.data.data)
      setPagination(response.data.pagination)
    } catch (err) {
      console.error('Failed to load table data', err)
    } finally {
      setTableLoading(false)
    }
  }

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    await Promise.all([fetchSummary(), fetchTableData(currentPage, searchTerm, filters, sort)])
    setIsLoading(false)
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
    fetchTableData(newPage, searchTerm, filters, sort)
  }

  const handleSearch = (search) => {
    setSearchTerm(search)
    setCurrentPage(1)
    fetchTableData(1, search, filters, sort)
  }

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value }
    setFilters(newFilters)
    setCurrentPage(1)
    fetchTableData(1, searchTerm, newFilters, sort)
  }

  const handleClearFilters = () => {
    const clearedFilters = { status: '', severity: '' }
    const defaultSort = { column: 'id', direction: 'asc' }
    setFilters(clearedFilters)
    setSearchTerm('')
    setSort(defaultSort)
    setCurrentPage(1)
    fetchTableData(1, '', clearedFilters, defaultSort)
  }

  const handleSort = (column) => {
    const newDirection = sort.column === column && sort.direction === 'asc' ? 'desc' : 'asc'
    const newSort = { column, direction: newDirection }
    setSort(newSort)
    setCurrentPage(1)
    fetchTableData(1, searchTerm, filters, newSort)
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

      {/* Data Table */}
      <DataTable
        data={tableData}
        pagination={pagination}
        isLoading={tableLoading}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        onSort={handleSort}
        filters={filters}
        searchTerm={searchTerm}
        sort={sort}
      />
    </div>
  )
}
