import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, ChevronRight, X, HelpCircle, Sparkles } from 'lucide-react'

// AI-generated recommendations based on dashboard data
export function generateRecommendations(summary) {
  const recommendations = []

  if (!summary) return recommendations

  const failureRate = summary.total > 0 ? (summary.failed / summary.total) * 100 : 0
  const warningRate = summary.total > 0 ? (summary.warning / summary.total) * 100 : 0
  const successRate = summary.total > 0 ? (summary.completed / summary.total) * 100 : 0

  // Critical failure recommendation
  if (failureRate > 30) {
    recommendations.push({
      id: 'high-failure-rate',
      type: 'critical',
      title: 'High Failure Rate Detected',
      description: `${failureRate.toFixed(1)}% of records have failed. Consider reviewing the test rules configuration and data mapping.`,
      action: 'Review Test Rules',
      actionLink: '/test-rules?status=failed',
      reason: 'This recommendation appears because more than 30% of your migration records have failed status, which typically indicates configuration issues.'
    })
  }

  // Warning spike recommendation
  if (warningRate > 40) {
    recommendations.push({
      id: 'high-warnings',
      type: 'warning',
      title: 'Many Records Need Review',
      description: `${warningRate.toFixed(1)}% of records have warnings. Review these to ensure data quality before proceeding.`,
      action: 'View Warnings',
      actionLink: '/dashboard?status=Warning',
      reason: 'This recommendation appears because a significant portion of records have warnings, which may indicate data quality issues that should be addressed.'
    })
  }

  // Success milestone
  if (successRate > 90 && summary.completed > 0) {
    recommendations.push({
      id: 'high-success',
      type: 'success',
      title: 'Excellent Progress!',
      description: `${successRate.toFixed(1)}% of records have completed successfully. You're on track for a smooth migration.`,
      action: 'View Completed',
      actionLink: '/dashboard?status=Completed',
      reason: 'This recommendation celebrates your migration progress, as more than 90% of records have completed successfully.'
    })
  }

  // Pending items recommendation
  if (summary.pending > 100) {
    recommendations.push({
      id: 'pending-items',
      type: 'info',
      title: 'Pending Items Queue',
      description: `${summary.pending.toLocaleString()} records are waiting to be processed. Monitor the queue progress regularly.`,
      action: 'View Pending',
      actionLink: '/dashboard?status=Pending',
      reason: 'This recommendation appears because you have a significant number of records in the pending queue that need to be processed.'
    })
  }

  // Comparison suggestion
  if (summary.failed > 0 && summary.completed > 0) {
    recommendations.push({
      id: 'compare-runs',
      type: 'tip',
      title: 'Compare Migration Runs',
      description: 'Use the comparison tool to analyze differences between migration runs and identify improvement patterns.',
      action: 'Open Comparison',
      actionLink: '/comparison',
      reason: 'This recommendation appears because you have both completed and failed records, making it valuable to compare different migration runs to understand patterns.'
    })
  }

  // Default recommendation if none apply
  if (recommendations.length === 0) {
    recommendations.push({
      id: 'getting-started',
      type: 'info',
      title: 'Getting Started',
      description: 'Welcome to JIVS Migration Companion! Start by reviewing your reconciliation data and test rules.',
      action: 'View Test Rules',
      actionLink: '/test-rules',
      reason: 'This is a general getting started recommendation for new users of the migration tool.'
    })
  }

  return recommendations
}

const typeStyles = {
  critical: {
    bg: 'bg-error-500/10 border-error-500/30',
    icon: 'text-error-400',
    badge: 'bg-error-500/20 text-error-400'
  },
  warning: {
    bg: 'bg-warning-500/10 border-warning-500/30',
    icon: 'text-warning-400',
    badge: 'bg-warning-500/20 text-warning-400'
  },
  success: {
    bg: 'bg-success-500/10 border-success-500/30',
    icon: 'text-success-400',
    badge: 'bg-success-500/20 text-success-400'
  },
  info: {
    bg: 'bg-primary-500/10 border-primary-500/30',
    icon: 'text-primary-400',
    badge: 'bg-primary-500/20 text-primary-400'
  },
  tip: {
    bg: 'bg-purple-500/10 border-purple-500/30',
    icon: 'text-purple-400',
    badge: 'bg-purple-500/20 text-purple-400'
  }
}

export default function AIRecommendationCard({ recommendation, onDismiss }) {
  const [showReason, setShowReason] = useState(false)
  const styles = typeStyles[recommendation.type] || typeStyles.info

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`p-4 rounded-xl border ${styles.bg} relative`}
    >
      {/* Dismiss button */}
      {onDismiss && (
        <button
          onClick={() => onDismiss(recommendation.id)}
          className="absolute top-3 right-3 p-1 rounded-lg hover:bg-dark-700/50 transition-colors text-gray-400 hover:text-white"
          aria-label="Dismiss recommendation"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="flex items-start gap-3 pr-6">
        <div className={`p-2 rounded-lg ${styles.badge}`}>
          <Sparkles className={`w-5 h-5 ${styles.icon}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${styles.badge}`}>
              AI Insight
            </span>
          </div>

          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{recommendation.title}</h4>
          <p className="text-sm text-gray-400 mb-3">{recommendation.description}</p>

          <div className="flex items-center gap-3 flex-wrap">
            <a
              href={recommendation.actionLink}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors"
            >
              {recommendation.action}
              <ChevronRight className="w-4 h-4" />
            </a>

            <button
              onClick={() => setShowReason(!showReason)}
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-400 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Why am I seeing this?
            </button>
          </div>

          {/* Reason explanation */}
          <AnimatePresence>
            {showReason && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-3 rounded-lg bg-dark-800/50 border border-dark-600"
              >
                <p className="text-xs text-gray-400">
                  <span className="font-medium text-gray-300">Why this recommendation: </span>
                  {recommendation.reason}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

// Container component for multiple recommendations
export function AIRecommendations({ summary, maxRecommendations = 3 }) {
  const [dismissedIds, setDismissedIds] = useState(() => {
    const stored = sessionStorage.getItem('dismissedRecommendations')
    return stored ? JSON.parse(stored) : []
  })

  const recommendations = generateRecommendations(summary)
    .filter(r => !dismissedIds.includes(r.id))
    .slice(0, maxRecommendations)

  const handleDismiss = (id) => {
    const newDismissed = [...dismissedIds, id]
    setDismissedIds(newDismissed)
    sessionStorage.setItem('dismissedRecommendations', JSON.stringify(newDismissed))
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="w-5 h-5 text-yellow-400" />
        <h3 className="font-semibold text-gray-900 dark:text-white">AI Recommendations</h3>
      </div>
      <AnimatePresence mode="popLayout">
        {recommendations.map((rec) => (
          <AIRecommendationCard
            key={rec.id}
            recommendation={rec}
            onDismiss={handleDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
