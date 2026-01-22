import { motion } from 'framer-motion'
import { AlertTriangle, AlertCircle, Info, X, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'

export default function DeclineWarningBanner({
  warning,
  onDismiss,
  onAnalyze
}) {
  if (!warning) return null

  const levelConfig = {
    critical: {
      bg: 'bg-error-500/10',
      border: 'border-error-500/30',
      icon: AlertTriangle,
      iconColor: 'text-error-400',
      textColor: 'text-error-300',
      ctaColor: 'bg-error-500 hover:bg-error-600'
    },
    warning: {
      bg: 'bg-warning-500/10',
      border: 'border-warning-500/30',
      icon: AlertCircle,
      iconColor: 'text-warning-400',
      textColor: 'text-warning-300',
      ctaColor: 'bg-warning-500 hover:bg-warning-600'
    },
    info: {
      bg: 'bg-[#2E5BFF]/10',
      border: 'border-[#2E5BFF]/30',
      icon: Info,
      iconColor: 'text-[#2E5BFF]',
      textColor: 'text-blue-300',
      ctaColor: 'bg-[#2E5BFF] hover:brightness-110'
    }
  }

  const config = levelConfig[warning.level] || levelConfig.warning
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'rounded-md p-4',
        config.bg,
        'border',
        config.border
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn('p-2 rounded-[4px]', config.bg)}>
          <Icon className={cn('w-5 h-5', config.iconColor)} />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className={cn('font-semibold', config.textColor)}>
            {warning.message}
          </h4>
          {warning.details && (
            <p className="text-sm text-gray-400 mt-1">
              {warning.details}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {warning.cta && (
            warning.ctaLink ? (
              <Link
                to={warning.ctaLink}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-[4px] text-sm font-medium text-white transition-all',
                  config.ctaColor
                )}
              >
                {warning.cta}
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <button
                onClick={onAnalyze}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-[4px] text-sm font-medium text-white transition-all',
                  config.ctaColor
                )}
              >
                {warning.cta}
                <ArrowRight className="w-4 h-4" />
              </button>
            )
          )}

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-2 rounded-[4px] hover:bg-white/10 transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
