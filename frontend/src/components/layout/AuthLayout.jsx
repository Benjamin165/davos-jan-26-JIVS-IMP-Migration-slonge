import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      {/* Background gradient effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-2">
            JIVS Migration
          </h1>
          <p className="text-gray-400">Visual Companion</p>
        </div>

        <div className="card-glass p-8">
          <Outlet />
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          DMI Hackathon 2026
        </p>
      </motion.div>
    </div>
  )
}
