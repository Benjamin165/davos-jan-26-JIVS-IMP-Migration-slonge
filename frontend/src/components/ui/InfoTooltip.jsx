import { useState, useRef, useEffect } from 'react'
import { HelpCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Explanations dictionary for technical terms
export const EXPLANATIONS = {
  reconciliation: {
    title: 'Reconciliation',
    description: 'The process of comparing data between the source system (old) and target system (new) to ensure all information was correctly transferred during migration.'
  },
  sourceObject: {
    title: 'Source Object',
    description: 'A table or data structure in the original system that contains data to be migrated. Think of it as the "from" location.'
  },
  targetObject: {
    title: 'Target Object',
    description: 'A table or data structure in the new system where data will be stored after migration. Think of it as the "to" location.'
  },
  severity: {
    title: 'Severity',
    description: 'How serious a problem is: Critical means migration is blocked, High needs attention soon, Medium should be reviewed, Low can wait.'
  },
  phase: {
    title: 'Phase',
    description: 'The stage of migration a record is in. Lower numbers are earlier stages, higher numbers are later stages.'
  },
  testRule: {
    title: 'Test Rule',
    description: 'An automated check that verifies data was migrated correctly. It compares values between source and target to find discrepancies.'
  },
  failureCount: {
    title: 'Failure Count',
    description: 'The number of records that did not pass a validation check. These need investigation to determine if the migration has issues.'
  },
  successRate: {
    title: 'Success Rate',
    description: 'The percentage of records that migrated successfully without errors. Higher is better - 100% means perfect migration.'
  },
  migrationRun: {
    title: 'Migration Run',
    description: 'A single execution of the migration process. Multiple runs may be performed as issues are fixed and data is re-migrated.'
  },
  dashboard: {
    title: 'Dashboard',
    description: 'A visual display of key metrics and charts that give you a quick overview of the migration status.'
  },
  visualization: {
    title: 'Visualization',
    description: 'A saved chart or graph that displays migration data in a specific way to help identify patterns or issues.'
  },
  completed: {
    title: 'Completed Status',
    description: 'Records that have been successfully migrated and verified. No further action needed.'
  },
  failed: {
    title: 'Failed Status',
    description: 'Records that encountered errors during migration and require investigation or correction.'
  },
  pending: {
    title: 'Pending Status',
    description: 'Records waiting to be processed. They have not yet started migration.'
  },
  warning: {
    title: 'Warning Status',
    description: 'Records that migrated but have potential issues that should be reviewed. Data may be incomplete or suspicious.'
  },
  critical: {
    title: 'Critical Severity',
    description: 'The most serious issues that block migration progress. Must be fixed before migration can continue.'
  },
  totalObjects: {
    title: 'Total Objects',
    description: 'The total count of all data items being tracked in the migration, regardless of their status.'
  },
  failedItems: {
    title: 'Failed Items',
    description: 'Records that encountered errors and could not be migrated successfully. These need attention and fixing.'
  },
  warnings: {
    title: 'Warnings',
    description: 'Records that migrated but raised concerns. Review these to ensure data quality.'
  }
}

export default function InfoTooltip({ term, className = '', size = 'default' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState('bottom')
  const triggerRef = useRef(null)
  const tooltipRef = useRef(null)

  const explanation = EXPLANATIONS[term]

  // Calculate best position for tooltip
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top

      if (spaceBelow < 200 && spaceAbove > spaceBelow) {
        setPosition('top')
      } else {
        setPosition('bottom')
      }
    }
  }, [isOpen])

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isOpen &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  if (!explanation) return null

  const sizeClasses = {
    small: 'w-3.5 h-3.5',
    default: 'w-4 h-4',
    large: 'w-5 h-5'
  }

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="p-0.5 rounded-full text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50"
        aria-label={`What is ${explanation.title}?`}
        aria-expanded={isOpen}
      >
        <HelpCircle className={sizeClasses[size]} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, y: position === 'bottom' ? -5 : 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: position === 'bottom' ? -5 : 5 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 w-72 p-4 bg-dark-800 border border-dark-600 rounded-xl shadow-xl ${
              position === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'
            } left-1/2 -translate-x-1/2`}
            role="tooltip"
          >
            {/* Arrow */}
            <div
              className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-dark-800 border-dark-600 transform rotate-45 ${
                position === 'bottom'
                  ? '-top-1.5 border-l border-t'
                  : '-bottom-1.5 border-r border-b'
              }`}
            />

            <div className="relative">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-semibold text-white">{explanation.title}</h4>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-0.5 rounded hover:bg-dark-700 transition-colors text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                {explanation.description}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
