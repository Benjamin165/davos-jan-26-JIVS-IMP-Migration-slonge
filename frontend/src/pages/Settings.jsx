import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Bell, Palette, Shield, Save, Loader2, AlertTriangle, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../context/authStore'
import { useThemeStore } from '../context/themeStore'
import api from '../utils/api'
import { cn } from '../utils/cn'

export default function Settings() {
  const navigate = useNavigate()
  const { user, updateUser, logout } = useAuthStore()
  const { theme, setTheme } = useThemeStore()

  const [activeTab, setActiveTab] = useState('profile')
  const [name, setName] = useState(user?.name || '')
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    alerts: true
  })
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState(null)

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield }
  ]

  const handleSaveProfile = async () => {
    setIsSaving(true)
    setMessage(null)

    try {
      await api.put(`/users/${user.id}`, { name })
      updateUser({ name })
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to save changes' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveNotifications = async () => {
    setIsSaving(true)
    setMessage(null)

    try {
      await api.put(`/users/${user.id}`, { notification_settings: notifications })
      setMessage({ type: 'success', text: 'Notification settings saved!' })
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save notification settings' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleThemeChange = async (newTheme) => {
    setTheme(newTheme)
    try {
      await api.put(`/users/${user.id}`, { theme_preference: newTheme })
    } catch (err) {
      console.error('Failed to save theme preference:', err)
    }
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError('Please enter your password to confirm deletion')
      return
    }

    setIsDeleting(true)
    setDeleteError('')

    try {
      // Verify password and delete account
      await api.post(`/users/${user.id}/delete`, { password: deletePassword })

      // Logout and redirect to login page
      await logout()
      navigate('/login')
    } catch (err) {
      setDeleteError(err.response?.data?.error || 'Failed to delete account. Please check your password.')
    } finally {
      setIsDeleting(false)
    }
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false)
    setDeletePassword('')
    setDeleteError('')
  }

  // Handle Escape key for modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showDeleteModal) {
        closeDeleteModal()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [showDeleteModal])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-gray-400 text-sm">Manage your account preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Tabs - JIVS Segmented Control */}
        <div className="md:w-48 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5 rounded-[4px] transition-all duration-200 text-left',
                activeTab === tab.id
                  ? 'bg-[#2E5BFF] text-white'
                  : 'text-gray-400 hover:bg-[#262626] hover:text-white'
              )}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content - JIVS Card */}
        <div className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-md p-5">
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'p-3 rounded-md mb-4',
                message.type === 'success'
                  ? 'bg-success-500/20 border border-success-500/50 text-success-400'
                  : 'bg-error-500/20 border border-error-500/50 text-error-400'
              )}
            >
              {message.text}
            </motion.div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-white tracking-tight">Profile Settings</h2>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full max-w-md px-3 py-2 bg-[#121212] border border-[#333] rounded-[4px] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2E5BFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className="w-full max-w-md px-3 py-2 bg-[#111111] border border-[#2A2A2A] rounded-[4px] text-gray-400 text-sm cursor-not-allowed"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                  Role
                </label>
                <span className={cn(
                  'inline-block px-2 py-0.5 rounded-[4px] text-xs font-medium',
                  user?.role === 'admin'
                    ? 'bg-[#2E5BFF]/20 text-[#2E5BFF]'
                    : 'bg-gray-500/20 text-gray-400'
                )}>
                  {user?.role}
                </span>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 bg-[#2E5BFF] text-white text-sm font-medium rounded-[4px] hover:brightness-110 transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </button>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-white tracking-tight">Notification Preferences</h2>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 rounded-md bg-[#111111] cursor-pointer">
                  <div>
                    <p className="font-medium text-white text-sm">Email Notifications</p>
                    <p className="text-xs text-gray-400">Receive updates via email</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.email}
                    onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                    className="w-5 h-5 rounded bg-[#121212] border-[#333] text-[#2E5BFF] focus:ring-[#2E5BFF]"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-md bg-[#111111] cursor-pointer">
                  <div>
                    <p className="font-medium text-white text-sm">Push Notifications</p>
                    <p className="text-xs text-gray-400">Browser push notifications</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.push}
                    onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                    className="w-5 h-5 rounded bg-[#121212] border-[#333] text-[#2E5BFF] focus:ring-[#2E5BFF]"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-md bg-[#111111] cursor-pointer">
                  <div>
                    <p className="font-medium text-white text-sm">Critical Alerts</p>
                    <p className="text-xs text-gray-400">Alerts for critical failures</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.alerts}
                    onChange={(e) => setNotifications({ ...notifications, alerts: e.target.checked })}
                    className="w-5 h-5 rounded bg-[#121212] border-[#333] text-[#2E5BFF] focus:ring-[#2E5BFF]"
                  />
                </label>
              </div>

              <button
                onClick={handleSaveNotifications}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 bg-[#2E5BFF] text-white text-sm font-medium rounded-[4px] hover:brightness-110 transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Preferences
              </button>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-white tracking-tight">Appearance Settings</h2>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
                  Theme
                </label>
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={cn(
                      'p-4 rounded-md border-2 transition-all',
                      theme === 'dark'
                        ? 'border-[#2E5BFF] bg-[#111111]'
                        : 'border-[#2A2A2A] hover:border-[#333]'
                    )}
                  >
                    <div className="w-full h-20 rounded-[4px] bg-[#0D0D0D] mb-2" />
                    <p className="font-medium text-white text-sm">Dark</p>
                  </button>
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={cn(
                      'p-4 rounded-md border-2 transition-all',
                      theme === 'light'
                        ? 'border-[#2E5BFF] bg-[#111111]'
                        : 'border-[#2A2A2A] hover:border-[#333]'
                    )}
                  >
                    <div className="w-full h-20 rounded-[4px] bg-gray-100 mb-2" />
                    <p className="font-medium text-white text-sm">Light</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-white tracking-tight">Security Settings</h2>

              <div>
                <h3 className="font-medium text-white text-sm mb-2">Change Password</h3>
                <p className="text-xs text-gray-400 mb-4">
                  Update your password to keep your account secure
                </p>
                <div className="space-y-3 max-w-md">
                  <div>
                    <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Current Password</label>
                    <input type="password" className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-[4px] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2E5BFF]" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">New Password</label>
                    <input type="password" className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-[4px] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2E5BFF]" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Confirm New Password</label>
                    <input type="password" className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-[4px] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2E5BFF]" placeholder="••••••••" />
                  </div>
                  <button className="inline-flex items-center px-4 py-2 bg-[#2E5BFF] text-white text-sm font-medium rounded-[4px] hover:brightness-110 transition-all">
                    Update Password
                  </button>
                </div>
              </div>

              <hr className="border-[#2A2A2A]" />

              <div>
                <h3 className="font-medium text-error-400 text-sm mb-2">Danger Zone</h3>
                <p className="text-xs text-gray-400 mb-4">
                  Permanently delete your account and all associated data
                </p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-error-500 text-white text-sm font-medium rounded-[4px] hover:brightness-110 transition-all"
                >
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Confirmation Modal - JIVS styled */}
      <AnimatePresence>
        {showDeleteModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeDeleteModal}
              className="fixed inset-0 bg-black/60 z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#1A1A1A] rounded-md border border-[#2A2A2A] shadow-2xl z-50 p-5"
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-[4px] bg-error-500/20">
                  <AlertTriangle className="w-6 h-6 text-error-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-error-400 tracking-tight">Delete Account</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    This action cannot be undone. All your data will be permanently deleted.
                  </p>
                </div>
                <button
                  onClick={closeDeleteModal}
                  className="p-1 rounded-[4px] hover:bg-[#262626] transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Password confirmation */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                  Enter your password to confirm
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-[4px] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2E5BFF]"
                  autoFocus
                />
                {deleteError && (
                  <p className="text-sm text-error-400 mt-2">{deleteError}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 bg-[#262626] text-gray-300 text-sm font-medium rounded-[4px] hover:text-white hover:brightness-110 transition-all"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || !deletePassword}
                  className="inline-flex items-center px-4 py-2 bg-error-500 text-white text-sm font-medium rounded-[4px] hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    'Delete My Account'
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
