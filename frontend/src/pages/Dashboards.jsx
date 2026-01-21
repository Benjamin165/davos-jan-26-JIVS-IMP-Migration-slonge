import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  LayoutDashboard,
  Edit2,
  Trash2,
  Copy,
  Star,
  MoreVertical,
  X,
  Check,
  RefreshCw,
  Eye
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { cn } from '../utils/cn'

// Unsaved Changes Warning Modal
function UnsavedChangesModal({ isOpen, onClose, onDiscard, onStay }) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onStay}
        className="fixed inset-0 bg-black/70 z-[60]"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-dark-800 rounded-xl border border-dark-600 shadow-2xl z-[60]"
      >
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-warning-500/20">
            <svg className="w-6 h-6 text-warning-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-center mb-2">Unsaved Changes</h2>
          <p className="text-gray-400 text-center mb-6">
            You have unsaved changes. Do you want to discard them?
          </p>
          <div className="flex gap-3">
            <button
              onClick={onDiscard}
              className="flex-1 px-4 py-3 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
            >
              Discard
            </button>
            <button
              onClick={onStay}
              className="flex-1 px-4 py-3 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
            >
              Keep Editing
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}

// Create/Edit Dashboard Modal
function DashboardModal({ isOpen, onClose, onSave, dashboard = null }) {
  const [name, setName] = useState(dashboard?.name || '')
  const [isDefault, setIsDefault] = useState(dashboard?.is_default || false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
  const [initialName, setInitialName] = useState(dashboard?.name || '')
  const [initialIsDefault, setInitialIsDefault] = useState(dashboard?.is_default || false)

  // Check if form has unsaved changes
  const hasUnsavedChanges = name !== initialName || isDefault !== initialIsDefault

  useEffect(() => {
    if (isOpen) {
      const nameProp = dashboard?.name || ''
      const defaultProp = dashboard?.is_default || false
      setName(nameProp)
      setIsDefault(defaultProp)
      setInitialName(nameProp)
      setInitialIsDefault(defaultProp)
      setError('')
      setShowUnsavedWarning(false)
    }
  }, [isOpen, dashboard])

  // Handle close with unsaved changes check
  const handleCloseAttempt = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedWarning(true)
    } else {
      onClose()
    }
  }

  // Handle discard changes
  const handleDiscard = () => {
    setShowUnsavedWarning(false)
    onClose()
  }

  // Handle stay and keep editing
  const handleStay = () => {
    setShowUnsavedWarning(false)
  }

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !showUnsavedWarning) {
        handleCloseAttempt()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, hasUnsavedChanges, showUnsavedWarning])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Dashboard name is required')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await onSave({ name: name.trim(), is_default: isDefault })
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleCloseAttempt}
        className="fixed inset-0 bg-black/50 z-50"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-dark-800 rounded-xl border border-dark-600 shadow-2xl z-50"
      >
        <div className="flex items-center justify-between p-4 border-b border-dark-600">
          <h2 className="text-lg font-semibold">
            {dashboard ? 'Edit Dashboard' : 'Create New Dashboard'}
          </h2>
          <button
            onClick={handleCloseAttempt}
            className="p-2 rounded-lg hover:bg-dark-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-error-500/20 border border-error-500/50 text-error-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="dashboard-name" className="block text-sm font-medium text-gray-400 mb-2">
              Dashboard Name
            </label>
            <input
              id="dashboard-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter dashboard name"
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="is-default"
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 rounded border-dark-600 bg-dark-700 text-primary-500 focus:ring-primary-500"
            />
            <label htmlFor="is-default" className="text-sm text-gray-400">
              Set as default dashboard
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCloseAttempt}
              className="flex-1 px-4 py-3 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : dashboard ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Unsaved Changes Warning */}
      <AnimatePresence>
        {showUnsavedWarning && (
          <UnsavedChangesModal
            isOpen={showUnsavedWarning}
            onClose={handleStay}
            onDiscard={handleDiscard}
            onStay={handleStay}
          />
        )}
      </AnimatePresence>
    </>
  )
}

// Delete Confirmation Modal
function DeleteModal({ isOpen, onClose, onConfirm, dashboardName }) {
  const [isLoading, setIsLoading] = useState(false)

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

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
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-dark-800 rounded-xl border border-dark-600 shadow-2xl z-50"
      >
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-error-500/20">
            <Trash2 className="w-6 h-6 text-error-400" />
          </div>
          <h2 className="text-lg font-semibold text-center mb-2">Delete Dashboard</h2>
          <p className="text-gray-400 text-center mb-6">
            Are you sure you want to delete "<span className="text-white font-medium">{dashboardName}</span>"?
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-error-500 hover:bg-error-600 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}

// Dashboard Card Component
function DashboardCard({ dashboard, onEdit, onDelete, onDuplicate, onSetDefault, onView, isOnly, isSelected, onToggleSelect, canSelect }) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative bg-dark-800 border rounded-xl p-6 hover:border-dark-500 transition-colors group cursor-pointer",
        isSelected ? "border-primary-500 bg-primary-500/5" : "border-dark-600"
      )}
      onClick={onView}
    >
      {/* Checkbox for bulk selection */}
      {canSelect && (
        <div
          className="absolute top-4 left-4"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(dashboard.id)}
            className="w-5 h-5 rounded border-dark-500 bg-dark-700 text-primary-500 focus:ring-primary-500 cursor-pointer"
          />
        </div>
      )}

      {/* Default badge */}
      {dashboard.is_default && (
        <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-full bg-primary-500/20 text-primary-400 text-xs">
          <Star className="w-3 h-3 fill-current" />
          Default
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
          <LayoutDashboard className="w-6 h-6 text-primary-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{dashboard.name}</h3>
          <p className="text-sm text-gray-400 mt-1">
            Created {new Date(dashboard.created_at).toLocaleDateString()}
          </p>
          {dashboard.updated_at !== dashboard.created_at && (
            <p className="text-xs text-gray-500 mt-1">
              Updated {new Date(dashboard.updated_at).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-dark-600 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-2">
          <button
            onClick={onView}
            className="p-2 rounded-lg hover:bg-primary-500/20 transition-colors text-gray-400 hover:text-primary-400"
            title="View Dashboard"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={onEdit}
            className="p-2 rounded-lg hover:bg-dark-700 transition-colors text-gray-400 hover:text-white"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDuplicate}
            className="p-2 rounded-lg hover:bg-dark-700 transition-colors text-gray-400 hover:text-white"
            title="Duplicate"
          >
            <Copy className="w-4 h-4" />
          </button>
          {!dashboard.is_default && (
            <button
              onClick={onSetDefault}
              className="p-2 rounded-lg hover:bg-dark-700 transition-colors text-gray-400 hover:text-primary-400"
              title="Set as default"
            >
              <Star className="w-4 h-4" />
            </button>
          )}
        </div>
        {!isOnly && (
          <button
            onClick={onDelete}
            className="p-2 rounded-lg hover:bg-error-500/20 transition-colors text-gray-400 hover:text-error-400"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  )
}

// Skeleton Card
function SkeletonCard() {
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-dark-700" />
        <div className="flex-1 space-y-3">
          <div className="h-5 w-32 bg-dark-700 rounded" />
          <div className="h-4 w-24 bg-dark-700 rounded" />
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-dark-600">
        <div className="h-8 w-full bg-dark-700 rounded" />
      </div>
    </div>
  )
}

// Bulk Delete Confirmation Modal
function BulkDeleteModal({ isOpen, onClose, onConfirm, count }) {
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

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
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-dark-800 rounded-xl border border-dark-600 shadow-2xl z-50"
      >
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-error-500/20">
            <Trash2 className="w-6 h-6 text-error-400" />
          </div>
          <h2 className="text-lg font-semibold text-center mb-2">Delete {count} Dashboard{count > 1 ? 's' : ''}</h2>
          <p className="text-gray-400 text-center mb-6">
            Are you sure you want to delete {count} selected dashboard{count > 1 ? 's' : ''}? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-error-500 hover:bg-error-600 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Deleting...' : 'Delete Selected'}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default function Dashboards() {
  const navigate = useNavigate()
  const [dashboards, setDashboards] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingDashboard, setEditingDashboard] = useState(null)
  const [deletingDashboard, setDeletingDashboard] = useState(null)

  // Bulk selection states
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)

  const fetchDashboards = async () => {
    try {
      setIsLoading(true)
      const response = await api.get('/dashboards')
      setDashboards(response.data.dashboards)
      setError(null)
    } catch (err) {
      setError('Failed to load dashboards')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboards()
  }, [])

  // Auto-hide success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const handleCreateDashboard = async (data) => {
    const response = await api.post('/dashboards', data)
    setDashboards([response.data.dashboard, ...dashboards])
    setSuccessMessage('Dashboard created successfully!')
  }

  const handleUpdateDashboard = async (data) => {
    const response = await api.put(`/dashboards/${editingDashboard.id}`, data)
    setDashboards(dashboards.map(d =>
      d.id === editingDashboard.id ? response.data.dashboard : d
    ))
    setSuccessMessage('Dashboard updated successfully!')
  }

  const handleDeleteDashboard = async () => {
    await api.delete(`/dashboards/${deletingDashboard.id}`)
    setDashboards(dashboards.filter(d => d.id !== deletingDashboard.id))
    setSuccessMessage('Dashboard deleted successfully!')
  }

  const handleDuplicateDashboard = async (dashboard) => {
    try {
      const response = await api.post(`/dashboards/${dashboard.id}/duplicate`)
      setDashboards([response.data.dashboard, ...dashboards])
      setSuccessMessage('Dashboard duplicated successfully!')
    } catch (err) {
      setError('Failed to duplicate dashboard')
    }
  }

  const handleSetDefault = async (dashboard) => {
    try {
      await api.put(`/dashboards/${dashboard.id}/default`)
      setDashboards(dashboards.map(d => ({
        ...d,
        is_default: d.id === dashboard.id
      })))
      setSuccessMessage('Default dashboard updated!')
    } catch (err) {
      setError('Failed to set default dashboard')
    }
  }

  const handleViewDashboard = (dashboard) => {
    navigate(`/dashboards/${dashboard.id}`)
  }

  // Bulk selection handlers
  const toggleSelection = (id) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const selectAll = () => {
    // Don't select if only 1 dashboard (can't delete last one)
    if (dashboards.length <= 1) return
    // Select all except default dashboard
    const selectableIds = dashboards
      .filter(d => !d.is_default)
      .map(d => d.id)
    setSelectedIds(new Set(selectableIds))
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
  }

  const handleBulkDelete = async () => {
    try {
      // Delete all selected dashboards
      await Promise.all(
        Array.from(selectedIds).map(id => api.delete(`/dashboards/${id}`))
      )
      setDashboards(dashboards.filter(d => !selectedIds.has(d.id)))
      setSuccessMessage(`${selectedIds.size} dashboard${selectedIds.size > 1 ? 's' : ''} deleted successfully!`)
      clearSelection()
    } catch (err) {
      setError('Failed to delete some dashboards')
    }
  }

  // Get selectable dashboards (exclude default and ensure at least 1 remains)
  const selectableDashboards = dashboards.filter(d => !d.is_default && dashboards.length > 1)
  const allSelected = selectableDashboards.length > 0 && selectableDashboards.every(d => selectedIds.has(d.id))

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboards</h1>
          <p className="text-gray-400">Create and manage your custom dashboards</p>
        </div>
        <div className="flex gap-3">
          {/* Bulk selection actions */}
          {selectedIds.size > 0 ? (
            <>
              <span className="flex items-center text-sm text-gray-400 mr-2">
                {selectedIds.size} selected
              </span>
              <button
                onClick={clearSelection}
                className="btn-secondary px-4 py-2"
              >
                Clear Selection
              </button>
              <button
                onClick={() => setShowBulkDeleteModal(true)}
                className="btn-danger px-4 py-2"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected
              </button>
            </>
          ) : (
            <>
              {selectableDashboards.length > 0 && (
                <button
                  onClick={selectAll}
                  className="btn-secondary px-4 py-2"
                >
                  Select All
                </button>
              )}
              <button
                onClick={fetchDashboards}
                disabled={isLoading}
                className="btn-secondary px-4 py-2"
              >
                <RefreshCw className={cn('w-4 h-4 mr-2', isLoading && 'animate-spin')} />
                Refresh
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn-primary px-4 py-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Dashboard
              </button>
            </>
          )}
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

      {/* Dashboards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : dashboards.length > 0 ? (
          dashboards.map((dashboard) => (
            <DashboardCard
              key={dashboard.id}
              dashboard={dashboard}
              onEdit={() => setEditingDashboard(dashboard)}
              onDelete={() => setDeletingDashboard(dashboard)}
              onDuplicate={() => handleDuplicateDashboard(dashboard)}
              onSetDefault={() => handleSetDefault(dashboard)}
              onView={() => handleViewDashboard(dashboard)}
              isOnly={dashboards.length === 1}
              isSelected={selectedIds.has(dashboard.id)}
              onToggleSelect={toggleSelection}
              canSelect={!dashboard.is_default && dashboards.length > 1}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <LayoutDashboard className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">No dashboards yet</h3>
            <p className="text-gray-500 mb-4">Create your first dashboard to get started</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-primary px-4 py-2 inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Dashboard
            </button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <DashboardModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSave={handleCreateDashboard}
          />
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingDashboard && (
          <DashboardModal
            isOpen={!!editingDashboard}
            onClose={() => setEditingDashboard(null)}
            onSave={handleUpdateDashboard}
            dashboard={editingDashboard}
          />
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {deletingDashboard && (
          <DeleteModal
            isOpen={!!deletingDashboard}
            onClose={() => setDeletingDashboard(null)}
            onConfirm={handleDeleteDashboard}
            dashboardName={deletingDashboard.name}
          />
        )}
      </AnimatePresence>

      {/* Bulk Delete Modal */}
      <AnimatePresence>
        {showBulkDeleteModal && (
          <BulkDeleteModal
            isOpen={showBulkDeleteModal}
            onClose={() => setShowBulkDeleteModal(false)}
            onConfirm={handleBulkDelete}
            count={selectedIds.size}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
