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
          <h1 className="text-2xl font-bold text-white tracking-tight">User Management</h1>
          <p className="text-gray-400 text-sm">Manage application users and roles</p>
        </div>
        <button
          onClick={() => fetchUsers(pagination.page)}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 bg-[#262626] text-gray-300 rounded-[4px] hover:text-white hover:brightness-110 transition-all disabled:opacity-50"
        >
          <RefreshCw className={cn('w-4 h-4 mr-2', isLoading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Stats - JIVS styled */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-md p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[4px] bg-[#2E5BFF]/20">
              <Users className="w-6 h-6 text-[#2E5BFF]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{pagination.total}</p>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Total Users</p>
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
              <Shield className="w-6 h-6 text-success-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-success-400">
                {users.filter(u => u.role === 'admin').length}
              </p>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Admins</p>
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
            <div className="p-2 rounded-[4px] bg-warning-500/20">
              <User className="w-6 h-6 text-warning-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-warning-400">
                {users.filter(u => u.role === 'user').length}
              </p>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Regular Users</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search - JIVS styled */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 bg-[#121212] border border-[#333] rounded-[4px] text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2E5BFF]"
          />
        </div>
      </div>

      {/* Users Table - JIVS styled */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.2 }}
        className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-md overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left uppercase text-[11px] font-bold text-gray-400 tracking-wider">User</th>
                <th className="px-4 py-3 text-left uppercase text-[11px] font-bold text-gray-400 tracking-wider">Role</th>
                <th className="px-4 py-3 text-left uppercase text-[11px] font-bold text-gray-400 tracking-wider">Created</th>
                <th className="px-4 py-3 text-left uppercase text-[11px] font-bold text-gray-400 tracking-wider">Status</th>
                <th className="px-4 py-3 text-right uppercase text-[11px] font-bold text-gray-400 tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#1A1A1A]">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[4px] bg-[#222222] animate-pulse" />
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-[#222222] rounded animate-pulse" />
                          <div className="h-3 w-40 bg-[#222222] rounded animate-pulse" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2"><div className="h-5 w-16 bg-[#222222] rounded-[4px] animate-pulse" /></td>
                    <td className="px-4 py-2"><div className="h-4 w-24 bg-[#222222] rounded animate-pulse" /></td>
                    <td className="px-4 py-2"><div className="h-5 w-16 bg-[#222222] rounded-[4px] animate-pulse" /></td>
                    <td className="px-4 py-2"><div className="h-8 w-8 bg-[#222222] rounded-[4px] ml-auto animate-pulse" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-[#1A1A1A] hover:bg-[#222222] transition-colors">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-[4px] flex items-center justify-center',
                          user.role === 'admin' ? 'bg-[#2E5BFF]/20' : 'bg-gray-500/20'
                        )}>
                          {user.role === 'admin' ? (
                            <Shield className="w-5 h-5 text-[#2E5BFF]" />
                          ) : (
                            <User className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <span className={cn(
                        'px-2 py-0.5 rounded-[4px] text-xs font-medium',
                        user.role === 'admin'
                          ? 'bg-[#2E5BFF]/20 text-[#2E5BFF]'
                          : 'bg-gray-500/20 text-gray-400'
                      )}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-400 text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-0.5 rounded-[4px] text-xs font-medium bg-success-500/20 text-success-400">Active</span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button className="p-2 rounded-[4px] hover:bg-[#262626] transition-colors">
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
          <div className="flex items-center justify-between p-4 border-t border-[#2A2A2A]">
            <p className="text-sm text-gray-400">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} users
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchUsers(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1.5 text-sm bg-[#262626] text-gray-300 rounded-[4px] hover:text-white hover:brightness-110 transition-all disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => fetchUsers(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1.5 text-sm bg-[#262626] text-gray-300 rounded-[4px] hover:text-white hover:brightness-110 transition-all disabled:opacity-50"
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
