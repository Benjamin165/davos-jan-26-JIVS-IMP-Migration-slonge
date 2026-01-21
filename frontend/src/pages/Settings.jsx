import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Bell, Palette, Shield, Save, Loader2 } from 'lucide-react'
import { useAuthStore } from '../context/authStore'
import { useThemeStore } from '../context/themeStore'
import api from '../utils/api'
import { cn } from '../utils/cn'

export default function Settings() {
  const { user, updateUser } = useAuthStore()
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-400">Manage your account preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Tabs */}
        <div className="md:w-48 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left',
                activeTab === tab.id
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-gray-400 hover:bg-dark-700/50 hover:text-white'
              )}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 card p-6">
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'p-3 rounded-lg mb-4',
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
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Profile Settings</h2>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input max-w-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className="input max-w-md bg-dark-700/50"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Role
                </label>
                <span className={cn(
                  'inline-block px-3 py-1 rounded-full text-sm',
                  user?.role === 'admin'
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'bg-gray-500/20 text-gray-400'
                )}>
                  {user?.role}
                </span>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="btn-primary px-4 py-2"
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
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Notification Preferences</h2>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 rounded-lg bg-dark-700/30">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-400">Receive updates via email</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.email}
                    onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                    className="w-5 h-5 rounded bg-dark-700 border-dark-600 text-primary-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-lg bg-dark-700/30">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-gray-400">Browser push notifications</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.push}
                    onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                    className="w-5 h-5 rounded bg-dark-700 border-dark-600 text-primary-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-lg bg-dark-700/30">
                  <div>
                    <p className="font-medium">Critical Alerts</p>
                    <p className="text-sm text-gray-400">Alerts for critical failures</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.alerts}
                    onChange={(e) => setNotifications({ ...notifications, alerts: e.target.checked })}
                    className="w-5 h-5 rounded bg-dark-700 border-dark-600 text-primary-500"
                  />
                </label>
              </div>

              <button
                onClick={handleSaveNotifications}
                disabled={isSaving}
                className="btn-primary px-4 py-2"
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
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Appearance Settings</h2>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Theme
                </label>
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={cn(
                      'p-4 rounded-lg border-2 transition-all',
                      theme === 'dark'
                        ? 'border-primary-500 bg-dark-700/50'
                        : 'border-dark-600 hover:border-dark-500'
                    )}
                  >
                    <div className="w-full h-20 rounded bg-dark-900 mb-2" />
                    <p className="font-medium">Dark</p>
                  </button>
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={cn(
                      'p-4 rounded-lg border-2 transition-all',
                      theme === 'light'
                        ? 'border-primary-500 bg-dark-700/50'
                        : 'border-dark-600 hover:border-dark-500'
                    )}
                  >
                    <div className="w-full h-20 rounded bg-gray-100 mb-2" />
                    <p className="font-medium">Light</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Security Settings</h2>

              <div>
                <h3 className="font-medium mb-2">Change Password</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Update your password to keep your account secure
                </p>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Current Password</label>
                    <input type="password" className="input" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">New Password</label>
                    <input type="password" className="input" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Confirm New Password</label>
                    <input type="password" className="input" placeholder="••••••••" />
                  </div>
                  <button className="btn-primary px-4 py-2">
                    Update Password
                  </button>
                </div>
              </div>

              <hr className="border-dark-600" />

              <div>
                <h3 className="font-medium text-error-400 mb-2">Danger Zone</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Permanently delete your account and all associated data
                </p>
                <button className="btn-danger px-4 py-2">
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
