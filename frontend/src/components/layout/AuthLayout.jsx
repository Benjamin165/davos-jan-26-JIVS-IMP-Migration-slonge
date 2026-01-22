import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Database } from 'lucide-react'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
      {/* Background gradient effects - JIVS styled */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#2E5BFF]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#2E5BFF]/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo - JIVS branded */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-md bg-gradient-to-br from-[#2E5BFF] to-[#1a3a99] flex items-center justify-center shadow-jivs-glow mx-auto mb-4">
            <Database className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
            JIVS Migration
          </h1>
          <p className="text-gray-500 text-sm">Visual Companion</p>
        </div>

        {/* Card - JIVS styled */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-md p-6 shadow-xl">
          <Outlet />
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          DMI Hackathon 2026
        </p>
      </motion.div>
    </div>
  )
}
