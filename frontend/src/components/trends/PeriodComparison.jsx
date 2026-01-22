import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react'
import { cn } from '../../utils/cn'

export default function PeriodComparison({
  period1,
  period2,
  difference,
  isLoading = false
}) {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-md p-5"
      >
        <div className="h-5 w-48 bg-[#222222] rounded mb-4 animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-24 bg-[#222222] rounded animate-pulse" />
          <div className="h-24 bg-[#222222] rounded animate-pulse" />
          <div className="h-24 bg-[#222222] rounded animate-pulse" />
        </div>
      </motion.div>
    )
  }

  if (!period1 || !period2) {
    return null
  }

  const getTrendIcon = () => {
    if (difference?.trend === 'worsening') {
      return <TrendingUp className="w-5 h-5 text-error-400" />
    } else if (difference?.trend === 'improving') {
      return <TrendingDown className="w-5 h-5 text-success-400" />
    }
    return <Minus className="w-5 h-5 text-gray-400" />
  }

  const getTrendLabel = () => {
    if (difference?.trend === 'worsening') return 'Worsening'
    if (difference?.trend === 'improving') return 'Improving'
    return 'Unchanged'
  }

  const getTrendColor = () => {
    if (difference?.trend === 'worsening') return 'text-error-400'
    if (difference?.trend === 'improving') return 'text-success-400'
    return 'text-gray-400'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-md p-5"
    >
      <h3 className="text-lg font-semibold text-white tracking-tight mb-4">
        Period Comparison
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Period 1 */}
        <div className="p-4 rounded-md bg-[#111111]">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
            Previous Period
          </p>
          <p className="text-sm text-gray-400 mb-3">{period1.label}</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Fail Count</span>
              <span className="text-sm font-bold text-white">
                {period1.total_fail_count?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Fail Rate</span>
              <span className="text-sm font-bold text-white">
                {period1.avg_fail_rate?.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Difference */}
        <div className="p-4 rounded-md bg-[#111111] flex flex-col items-center justify-center">
          <div className={cn('p-3 rounded-full mb-2', {
            'bg-error-500/20': difference?.trend === 'worsening',
            'bg-success-500/20': difference?.trend === 'improving',
            'bg-gray-500/20': difference?.trend === 'unchanged'
          })}>
            {getTrendIcon()}
          </div>
          <p className={cn('text-lg font-bold', getTrendColor())}>
            {difference?.percent_change > 0 ? '+' : ''}{difference?.percent_change?.toFixed(1)}%
          </p>
          <p className={cn('text-sm', getTrendColor())}>
            {getTrendLabel()}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {difference?.fail_count_change > 0 ? '+' : ''}
            {difference?.fail_count_change?.toLocaleString()} fails
          </p>
        </div>

        {/* Period 2 */}
        <div className="p-4 rounded-md bg-[#111111]">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
            Current Period
          </p>
          <p className="text-sm text-gray-400 mb-3">{period2.label}</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Fail Count</span>
              <span className="text-sm font-bold text-white">
                {period2.total_fail_count?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Fail Rate</span>
              <span className="text-sm font-bold text-white">
                {period2.avg_fail_rate?.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
