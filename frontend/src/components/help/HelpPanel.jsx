import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HelpCircle,
  X,
  ChevronDown,
  ChevronRight,
  Database,
  GitCompare,
  AlertTriangle,
  CheckCircle,
  Clock,
  Layers,
  FileText,
  ArrowRight
} from 'lucide-react'
import { cn } from '../../utils/cn'

const helpTopics = [
  {
    id: 'migration-overview',
    title: 'Migration Overview',
    icon: Database,
    content: `Data migration is the process of moving data from a source system to a target system.
    The JIVS Migration Companion helps you track and validate this process by providing:
    • Real-time status monitoring
    • Data reconciliation reports
    • Error tracking and resolution
    • Visual analytics and dashboards`
  },
  {
    id: 'status-types',
    title: 'Status Types',
    icon: CheckCircle,
    content: `Each migration object can have one of the following statuses:

    • **Pending** - Object is queued for migration
    • **Running** - Migration is currently in progress
    • **Completed** - Successfully migrated and validated
    • **Failed** - Migration encountered an error
    • **Warning** - Completed with warnings that need attention`
  },
  {
    id: 'severity-levels',
    title: 'Severity Levels',
    icon: AlertTriangle,
    content: `Issues are categorized by severity to help prioritize resolution:

    • **Critical** - Requires immediate attention, blocks migration
    • **High** - Significant issue that should be addressed soon
    • **Medium** - Moderate impact, can be addressed in normal workflow
    • **Low** - Minor issue with minimal impact
    • **Info** - Informational message, no action required`
  },
  {
    id: 'migration-phases',
    title: 'Migration Phases',
    icon: Layers,
    content: `The migration process consists of several phases:

    1. **Extract** - Data is extracted from the source system
    2. **Transform** - Data is converted to target format
    3. **Load** - Data is loaded into the target system
    4. **Validate** - Data integrity is verified
    5. **Reconcile** - Source and target data are compared`
  },
  {
    id: 'reconciliation',
    title: 'Data Reconciliation',
    icon: GitCompare,
    content: `Reconciliation ensures data accuracy by comparing source and target data:

    • **Record counts** - Verify all records were migrated
    • **Field mapping** - Ensure fields are correctly mapped
    • **Data integrity** - Check for data corruption or loss
    • **Business rules** - Validate business logic compliance`
  },
  {
    id: 'test-rules',
    title: 'Test Rules',
    icon: FileText,
    content: `Test rules help automate validation:

    • Define custom validation criteria
    • Set up automated checks
    • Configure thresholds and alerts
    • Schedule recurring validations
    • Review test execution history`
  }
]

function HelpTopic({ topic, isExpanded, onToggle }) {
  const Icon = topic.icon

  return (
    <div className="border-b border-dark-600 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 hover:bg-dark-700/50 transition-colors text-left"
      >
        <div className="p-2 rounded-lg bg-primary-500/20">
          <Icon className="w-4 h-4 text-primary-400" />
        </div>
        <span className="flex-1 font-medium">{topic.title}</span>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pl-14 text-sm text-gray-300 whitespace-pre-line">
              {topic.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function HelpPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedTopic, setExpandedTopic] = useState(null)

  const toggleTopic = (topicId) => {
    setExpandedTopic(expandedTopic === topicId ? null : topicId)
  }

  return (
    <>
      {/* Help button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-lg hover:bg-dark-700/50 transition-colors"
        aria-label="Help"
        data-tour="help"
      >
        <HelpCircle className="w-5 h-5 text-gray-400 hover:text-white" />
      </button>

      {/* Help panel overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-dark-800 border-l border-dark-600 z-50 flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-dark-600">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary-500/20">
                    <HelpCircle className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg">Help Center</h2>
                    <p className="text-xs text-gray-400">Migration concepts & guides</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                  aria-label="Close help panel"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Quick Links */}
              <div className="p-4 border-b border-dark-600">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      localStorage.removeItem('guidedTourCompleted')
                      window.location.reload()
                    }}
                    className="flex items-center gap-2 p-3 bg-dark-700/50 hover:bg-dark-700 rounded-lg transition-colors text-sm"
                  >
                    <ArrowRight className="w-4 h-4 text-primary-400" />
                    Restart Tour
                  </button>
                  <a
                    href="/settings"
                    className="flex items-center gap-2 p-3 bg-dark-700/50 hover:bg-dark-700 rounded-lg transition-colors text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <Clock className="w-4 h-4 text-primary-400" />
                    Settings
                  </a>
                </div>
              </div>

              {/* Topics */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Migration Concepts</h3>
                </div>
                <div>
                  {helpTopics.map((topic) => (
                    <HelpTopic
                      key={topic.id}
                      topic={topic}
                      isExpanded={expandedTopic === topic.id}
                      onToggle={() => toggleTopic(topic.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-dark-600">
                <p className="text-xs text-gray-500 text-center">
                  Need more help? Contact support at{' '}
                  <a href="mailto:support@jivs.com" className="text-primary-400 hover:underline">
                    support@jivs.com
                  </a>
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
