import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Search, Shield, User, MoreVertical, RefreshCw } from 'lucide-react'
import api from '../utils/api'
import { cn } from '../utils/cn'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  const fetchUsers = async (page = 1) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
      })
      if (search) params.append('search', search)

      const response = await api.get(`/users?${params}`)
      setUsers(response.data.users || [])
      setPagination(response.data.pagination)
    } catch (err) {
      console.error('Failed to load users:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [search])

  const handleSearch = (e) => {
    setSearch(e.target.value)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-gray-400">Manage application users and roles</p>
        </div>
        <button
          onClick={() => fetchUsers(pagination.page)}
          disabled={isLoading}
          className="btn-secondary px-4 py-2"
        >
          <RefreshCw className={cn('w-4 h-4 mr-2', isLoading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary-500/20">
              <Users className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pagination.total}</p>
              <p className="text-sm text-gray-400">Total Users</p>
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
            <div className="p-3 rounded-lg bg-success-500/20">
              <Shield className="w-6 h-6 text-success-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {users.filter(u => u.role === 'admin').length}
              </p>
              <p className="text-sm text-gray-400">Admins</p>
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
            <div className="p-3 rounded-lg bg-warning-500/20">
              <User className="w-6 h-6 text-warning-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {users.filter(u => u.role === 'user').length}
              </p>
              <p className="text-sm text-gray-400">Regular Users</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={handleSearch}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card overflow-hidden"
      >
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Created</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full skeleton" />
                        <div className="space-y-2">
                          <div className="h-4 w-32 skeleton" />
                          <div className="h-3 w-40 skeleton" />
                        </div>
                      </div>
                    </td>
                    <td><div className="h-6 w-16 skeleton rounded-full" /></td>
                    <td><div className="h-4 w-24 skeleton" /></td>
                    <td><div className="h-6 w-16 skeleton rounded-full" /></td>
                    <td><div className="h-8 w-8 skeleton rounded ml-auto" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center',
                          user.role === 'admin' ? 'bg-primary-500/20' : 'bg-gray-500/20'
                        )}>
                          {user.role === 'admin' ? (
                            <Shield className="w-5 h-5 text-primary-400" />
                          ) : (
                            <User className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={cn(
                        'badge',
                        user.role === 'admin'
                          ? 'bg-primary-500/20 text-primary-400'
                          : 'bg-gray-500/20 text-gray-400'
                      )}>
                        {user.role}
                      </span>
                    </td>
                    <td className="text-gray-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <span className="badge-success">Active</span>
                    </td>
                    <td className="text-right">
                      <button className="p-2 rounded-lg hover:bg-dark-700/50">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-dark-600">
            <p className="text-sm text-gray-400">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} users
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchUsers(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="btn-secondary px-3 py-1 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => fetchUsers(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="btn-secondary px-3 py-1 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
