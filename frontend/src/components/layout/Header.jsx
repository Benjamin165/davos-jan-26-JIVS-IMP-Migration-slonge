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
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#1A1A1A]/90 backdrop-blur-md border-b border-gray-200 dark:border-[#2A2A2A]">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        {/* Left side - Search */}
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <div className="hidden sm:flex items-center gap-2 bg-gray-100 dark:bg-[#121212] border border-transparent dark:border-[#333] rounded-[4px] px-4 py-2 flex-1">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-500 w-full"
            />
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-[4px] hover:bg-gray-100 dark:hover:bg-[#262626] transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-gray-400 hover:text-white" />
            ) : (
              <Moon className="w-5 h-5 text-gray-500 hover:text-gray-900" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-[4px] hover:bg-gray-100 dark:hover:bg-[#262626] transition-colors relative"
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
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1A1A1A] rounded-md shadow-lg border border-gray-200 dark:border-[#2A2A2A] overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-[#2A2A2A]">
                      <h3 className="font-semibold text-gray-900 dark:text-white tracking-tight">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      <div className="p-4 hover:bg-gray-50 dark:hover:bg-[#222222] cursor-pointer border-b border-gray-200 dark:border-[#2A2A2A]">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-error-500 mt-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Critical Failures Detected</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">47 items require attention</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 hover:bg-gray-50 dark:hover:bg-[#222222] cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-success-500 mt-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Migration Run Complete</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">89% success rate</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 border-t border-gray-200 dark:border-[#2A2A2A]">
                      <button className="w-full text-center text-sm text-[#2E5BFF] hover:brightness-110">
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
              className="flex items-center gap-2 p-2 rounded-[4px] hover:bg-gray-100 dark:hover:bg-[#262626] transition-colors"
            >
              <div className="w-8 h-8 rounded-[4px] bg-[#2E5BFF]/20 flex items-center justify-center">
                <User className="w-4 h-4 text-[#2E5BFF]" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-900 dark:text-white">{user?.name}</span>
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
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1A1A1A] rounded-md shadow-lg border border-gray-200 dark:border-[#2A2A2A] overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-[#2A2A2A]">
                      <p className="font-medium text-gray-900 dark:text-white">{user?.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                      <span className={cn(
                        'inline-block mt-2 text-xs px-2 py-0.5 rounded-[4px]',
                        user?.role === 'admin'
                          ? 'bg-[#2E5BFF]/20 text-[#2E5BFF]'
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
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-[4px] hover:bg-gray-100 dark:hover:bg-[#262626] transition-colors text-left"
                      >
                        <Settings className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-white">Settings</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-[4px] hover:bg-gray-100 dark:hover:bg-[#262626] transition-colors text-left text-error-500"
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
