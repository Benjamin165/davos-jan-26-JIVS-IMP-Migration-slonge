import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Layers,
  ClipboardCheck,
  GitCompare,
  Settings,
  Users,
  Menu,
  X,
  Database,
  BarChart3
} from 'lucide-react'
import { useAuthStore } from '../../context/authStore'
import { cn } from '../../utils/cn'

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/dashboards', icon: Layers, label: 'My Dashboards' },
  { path: '/visualizations', icon: BarChart3, label: 'Visualizations' },
  { path: '/test-rules', icon: ClipboardCheck, label: 'Test Rules' },
  { path: '/comparison', icon: GitCompare, label: 'Comparison' },
  { path: '/settings', icon: Settings, label: 'Settings' }
]

const adminItems = [
  { path: '/admin/users', icon: Users, label: 'User Management' }
]

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuthStore()

  const NavItem = ({ item }) => (
    <NavLink
      to={item.path}
      onClick={() => setIsOpen(false)}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
          'hover:bg-dark-700/50',
          isActive
            ? 'bg-primary-500/20 text-primary-400 border-l-2 border-primary-500'
            : 'text-gray-400 hover:text-white'
        )
      }
    >
      <item.icon className="w-5 h-5" />
      <span className="font-medium">{item.label}</span>
    </NavLink>
  )

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-dark-800 text-white"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen w-64 bg-dark-800 border-r border-dark-600',
          'transition-transform duration-300 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-dark-600">
          <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
            <Database className="w-6 h-6 text-primary-500" />
          </div>
          <div>
            <h1 className="font-bold text-white">JIVS Migration</h1>
            <p className="text-xs text-gray-400">Visual Companion</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Main Menu
          </p>
          {navItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}

          {user?.role === 'admin' && (
            <>
              <div className="pt-4">
                <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Admin
                </p>
              </div>
              {adminItems.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dark-600">
          <div className="text-xs text-gray-500 text-center">
            <p>JIVS IMP Migration</p>
            <p>v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  )
}
