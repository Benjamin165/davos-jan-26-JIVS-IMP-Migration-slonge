import { useMemo } from 'react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '../../utils/cn'

export default function TrendSparkline({
  data = [],
  trend,
  trendValue,
  height = 40,
  showTrendIndicator = true
}) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []
    // Handle both array of numbers and array of objects
    return data.map((d, i) => ({
      index: i,
      value: typeof d === 'number' ? d : (d.fail_count || d.value || 0)
    }))
  }, [data])

  const getTrendIcon = () => {
    if (trend === 'increasing') {
      return <TrendingUp className="w-3 h-3" />
    } else if (trend === 'decreasing') {
      return <TrendingDown className="w-3 h-3" />
    }
    return <Minus className="w-3 h-3" />
  }

  const getTrendColor = () => {
    // For fail counts, increasing is bad (red), decreasing is good (green)
    if (trend === 'increasing') return 'text-error-400'
    if (trend === 'decreasing') return 'text-success-400'
    return 'text-gray-400'
  }

  const getChartColor = () => {
    if (trend === 'increasing') return '#EF4444'
    if (trend === 'decreasing') return '#10B981'
    return '#9CA3AF'
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center gap-2 text-gray-500 text-xs">
        No trend data
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <div style={{ width: 80, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`sparklineGradient-${trend}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={getChartColor()} stopOpacity={0.3} />
                <stop offset="95%" stopColor={getChartColor()} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={getChartColor()}
              strokeWidth={1.5}
              fill={`url(#sparklineGradient-${trend})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {showTrendIndicator && (
        <div className={cn('flex items-center gap-1 text-xs', getTrendColor())}>
          {getTrendIcon()}
          {trendValue !== undefined && (
            <span>
              {trendValue > 0 ? '+' : ''}{trendValue.toFixed(1)}%
            </span>
          )}
        </div>
      )}
    </div>
  )
}
