import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ChevronLeft, HelpCircle } from 'lucide-react'
import { cn } from '../../utils/cn'

const tourSteps = [
  {
    id: 'welcome',
    title: 'Welcome to JIVS Migration Companion!',
    content: 'This guided tour will help you get familiar with the key features of the application.',
    target: null, // No specific target for welcome
    position: 'center'
  },
  {
    id: 'dashboard',
    title: 'Dashboard Overview',
    content: 'The dashboard provides a comprehensive view of your migration status including success rates, failures, and warnings.',
    target: '[data-tour="dashboard-stats"]',
    position: 'bottom'
  },
  {
    id: 'charts',
    title: 'Visual Analytics',
    content: 'Charts help you visualize the distribution of migration statuses and severity levels at a glance.',
    target: '[data-tour="charts"]',
    position: 'bottom'
  },
  {
    id: 'data-table',
    title: 'Reconciliation Data',
    content: 'Click on any row to view detailed information. Use filters and search to find specific records.',
    target: '[data-tour="data-table"]',
    position: 'top'
  },
  {
    id: 'sidebar',
    title: 'Navigation',
    content: 'Use the sidebar to navigate between different sections: Dashboards, Visualizations, Test Rules, and more.',
    target: '[data-tour="sidebar"]',
    position: 'right'
  },
  {
    id: 'notifications',
    title: 'Stay Informed',
    content: 'The notification bell keeps you updated on important events like critical failures or completed migrations.',
    target: '[data-tour="notifications"]',
    position: 'bottom-left'
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    content: 'You can restart this tour anytime from the Settings page. Happy migrating!',
    target: null,
    position: 'center'
  }
]

export default function GuidedTour({ onComplete }) {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [targetRect, setTargetRect] = useState(null)

  // Check if tour should show for new users
  useEffect(() => {
    const tourCompleted = localStorage.getItem('guidedTourCompleted')
    if (!tourCompleted) {
      // Small delay to let the page load
      const timer = setTimeout(() => setIsActive(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  // Update target element position
  const updateTargetPosition = useCallback(() => {
    const step = tourSteps[currentStep]
    if (step.target) {
      const element = document.querySelector(step.target)
      if (element) {
        const rect = element.getBoundingClientRect()
        setTargetRect(rect)
      } else {
        setTargetRect(null)
      }
    } else {
      setTargetRect(null)
    }
  }, [currentStep])

  useEffect(() => {
    updateTargetPosition()
    window.addEventListener('resize', updateTargetPosition)
    window.addEventListener('scroll', updateTargetPosition)
    return () => {
      window.removeEventListener('resize', updateTargetPosition)
      window.removeEventListener('scroll', updateTargetPosition)
    }
  }, [updateTargetPosition])

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeTour()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    completeTour()
  }

  const completeTour = () => {
    localStorage.setItem('guidedTourCompleted', 'true')
    setIsActive(false)
    onComplete?.()
  }

  const step = tourSteps[currentStep]

  // Calculate tooltip position
  const getTooltipStyle = () => {
    if (!targetRect || step.position === 'center') {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }
    }

    const padding = 16
    const tooltipWidth = 320

    switch (step.position) {
      case 'bottom':
        return {
          position: 'fixed',
          top: targetRect.bottom + padding,
          left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
        }
      case 'top':
        return {
          position: 'fixed',
          bottom: window.innerHeight - targetRect.top + padding,
          left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
        }
      case 'right':
        return {
          position: 'fixed',
          top: targetRect.top,
          left: targetRect.right + padding,
        }
      case 'bottom-left':
        return {
          position: 'fixed',
          top: targetRect.bottom + padding,
          right: window.innerWidth - targetRect.right,
        }
      default:
        return {
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }
    }
  }

  if (!isActive) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100]"
      >
        {/* Overlay with spotlight effect */}
        <div className="absolute inset-0 bg-black/70" />

        {/* Spotlight on target element */}
        {targetRect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bg-transparent rounded-lg ring-4 ring-primary-500 ring-offset-4 ring-offset-transparent"
            style={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
              pointerEvents: 'none'
            }}
          />
        )}

        {/* Tooltip */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-dark-800 rounded-xl shadow-2xl border border-dark-600 w-80 p-5"
          style={getTooltipStyle()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary-500" />
              <span className="text-xs text-gray-400">
                Step {currentStep + 1} of {tourSteps.length}
              </span>
            </div>
            <button
              onClick={handleSkip}
              className="p-1 hover:bg-dark-700 rounded-lg transition-colors"
              aria-label="Close tour"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
          <p className="text-sm text-gray-400 mb-4">{step.content}</p>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mb-4">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  index === currentStep ? "bg-primary-500" : "bg-dark-600"
                )}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Skip tour
            </button>
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-4 py-1.5 text-sm bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors font-medium"
              >
                {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
                {currentStep < tourSteps.length - 1 && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Export function to manually trigger tour
export function startGuidedTour() {
  localStorage.removeItem('guidedTourCompleted')
  window.location.reload()
}
