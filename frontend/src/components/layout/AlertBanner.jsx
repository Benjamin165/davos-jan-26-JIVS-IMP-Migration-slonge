import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, ArrowRight } from 'lucide-react'
import api from '../../utils/api'

export default function AlertBanner() {
  const [criticalCount, setCriticalCount] = useState(0)
  const [dismissed, setDismissed] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCriticalFailures = async () => {
      try {
        // Check if banner was dismissed in this session
        const sessionDismissed = sessionStorage.getItem('alertBannerDismissed')
        if (sessionDismissed) {
          setDismissed(true)
          setLoading(false)
          return
        }

        // Fetch test rules failures from the failures endpoint
        const response = await api.get('/test-rules/failures')
        const failures = response.data.failures || response.data || []

        // Count critical/high severity failures, or all failures if significant
        const criticalFailures = failures.filter(
          f => f.severity === 'critical' || f.severity === 'high'
        )

        if (criticalFailures.length > 0) {
          setCriticalCount(criticalFailures.length)
        } else if (failures.length > 50) {
          // If many failures exist, show them even without critical severity
          setCriticalCount(failures.length)
        }
      } catch (err) {
        console.error('Failed to fetch critical failures:', err)
        // Try alternative: get summary
        try {
          const response = await api.get('/test-rules/summary')
          const summary = response.data
          // Use failed count from summary
          if (summary.failed > 50) {
            setCriticalCount(summary.failed)
          }
        } catch (e) {
          console.error('Failed to fetch test rules summary:', e)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchCriticalFailures()
  }, [])

  const handleDismiss = (e) => {
    e.stopPropagation()
    setDismissed(true)
    sessionStorage.setItem('alertBannerDismissed', 'true')
  }

  const handleNavigate = () => {
    navigate('/test-rules?status=failed')
  }

  if (loading || dismissed || criticalCount === 0) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="bg-error-500 dark:bg-error-600 text-white"
        role="alert"
        aria-live="assertive"
      >
        <div
          className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-error-600 dark:hover:bg-error-700 transition-colors"
          onClick={handleNavigate}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div className="flex items-center gap-2">
              <span className="font-semibold">{criticalCount} Critical Failures</span>
              <span className="hidden sm:inline text-white/80">require immediate attention</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="hidden sm:flex items-center gap-1 text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors"
              onClick={handleNavigate}
            >
              View Details
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              aria-label="Dismiss alert"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
