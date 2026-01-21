import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      {/* Background gradient effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-error-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center relative z-10"
      >
        <motion.h1
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="text-9xl font-bold text-primary-500/20"
        >
          404
        </motion.h1>

        <h2 className="text-2xl font-bold text-white mt-4">
          Page Not Found
        </h2>

        <p className="text-gray-400 mt-2 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex items-center justify-center gap-4 mt-8">
          <Link
            to="/dashboard"
            className="btn-primary px-6 py-3"
          >
            <Home className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Link>

          <button
            onClick={() => window.history.back()}
            className="btn-secondary px-6 py-3"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  )
}
