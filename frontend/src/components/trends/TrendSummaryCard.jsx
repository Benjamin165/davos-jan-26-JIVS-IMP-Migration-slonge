import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '../../utils/cn'

export default function TrendSummaryCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = 'primary',
  delay = 0
}) {
  const colorClasses = {
    primary: 'border-[#2E5BFF]/30',
    success: 'border-success-500/30',
    error: 'border-error-500/30',
    warning: 'border-warning-500/30'
  }

  const iconBgColors = {
    primary: 'bg-[#2E5BFF]/20',
    success: 'bg-success-500/20',
    error: 'bg-error-500/20',
    warning: 'bg-warning-500/20'
  }

  const iconColors = {
    primary: 'text-[#2E5BFF]',
    success: 'text-success-400',
    error: 'text-error-400',
    warning: 'text-warning-400'
  }

  const getTrendIcon = () => {
    if (trend === 'increasing') {
      return <TrendingUp className="w-4 h-4" />
    } else if (trend === 'decreasing') {
      return <TrendingDown className="w-4 h-4" />
    }
    return <Minus className="w-4 h-4" />
  }

  const getTrendColor = () => {
    // For fail counts, increasing is bad (error), decreasing is good (success)
    if (trend === 'increasing') return 'text-error-400'
    if (trend === 'decreasing') return 'text-success-400'
    return 'text-gray-400'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.2 }}
      className={cn(
        'relative overflow-hidden rounded-md p-5',
        'bg-[#1A1A1A] border',
        colorClasses[color]
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-white tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {trend && (
            <div className={cn('flex items-center gap-1 mt-2 text-xs', getTrendColor())}>
              {getTrendIcon()}
              <span>
                {trendValue !== undefined && (
                  <>
                    {trendValue > 0 ? '+' : ''}{trendValue}%
                    {' '}
                  </>
                )}
                {trend === 'increasing' ? 'Increasing' : trend === 'decreasing' ? 'Decreasing' : 'Stable'}
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn('p-3 rounded-[4px]', iconBgColors[color])}>
            <Icon className={cn('w-5 h-5', iconColors[color])} />
          </div>
        )}
      </div>
    </motion.div>
  )
}
