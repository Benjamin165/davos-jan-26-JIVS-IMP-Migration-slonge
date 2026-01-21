import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  Sun,
  Moon,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Search
} from 'lucide-react'
import { useAuthStore } from '../../context/authStore'
import { useThemeStore } from '../../context/themeStore'
import { cn } from '../../utils/cn'

export default function Header() {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 bg-dark-800/80 backdrop-blur-md border-b border-dark-600">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        {/* Left side - Search */}
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <div className="hidden sm:flex items-center gap-2 bg-dark-700/50 rounded-lg px-4 py-2 flex-1">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-sm text-white placeholder:text-gray-400 w-full"
            />
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-dark-700/50 transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-gray-400 hover:text-white" />
            ) : (
              <Moon className="w-5 h-5 text-gray-400 hover:text-white" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-lg hover:bg-dark-700/50 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-400 hover:text-white" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full" />
            </button>

            <AnimatePresence>
              {notificationsOpen && (
                <>
                  <div
                    className="fixed inset-0"
                    onClick={() => setNotificationsOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 bg-dark-800 rounded-xl shadow-lg border border-dark-600 overflow-hidden"
                  >
                    <div className="p-4 border-b border-dark-600">
                      <h3 className="font-semibold">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      <div className="p-4 hover:bg-dark-700/50 cursor-pointer border-b border-dark-600">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-error-500 mt-2" />
                          <div>
                            <p className="text-sm font-medium">Critical Failures Detected</p>
                            <p className="text-xs text-gray-400">47 items require attention</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 hover:bg-dark-700/50 cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-success-500 mt-2" />
                          <div>
                            <p className="text-sm font-medium">Migration Run Complete</p>
                            <p className="text-xs text-gray-400">89% success rate</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 border-t border-dark-600">
                      <button className="w-full text-center text-sm text-primary-400 hover:text-primary-300">
                        View all notifications
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* User menu */}
          <div className="relative ml-2">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-dark-700/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                <User className="w-4 h-4 text-primary-400" />
              </div>
              <span className="hidden sm:block text-sm font-medium">{user?.name}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-56 bg-dark-800 rounded-xl shadow-lg border border-dark-600 overflow-hidden"
                  >
                    <div className="p-4 border-b border-dark-600">
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-sm text-gray-400">{user?.email}</p>
                      <span className={cn(
                        'inline-block mt-2 text-xs px-2 py-1 rounded-full',
                        user?.role === 'admin'
                          ? 'bg-primary-500/20 text-primary-400'
                          : 'bg-gray-500/20 text-gray-400'
                      )}>
                        {user?.role}
                      </span>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false)
                          navigate('/settings')
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-dark-700/50 transition-colors text-left"
                      >
                        <Settings className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">Settings</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-dark-700/50 transition-colors text-left text-error-400"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Logout</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}
