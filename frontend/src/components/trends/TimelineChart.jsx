import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { motion } from 'framer-motion'

// JIVS Chart colors
const COLORS = {
  fail: '#EF4444',
  pass: '#10B981',
  critical: '#EF4444',
  high: '#F97316',
  medium: '#F59E0B',
  low: '#10B981',
  primary: '#2E5BFF'
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-md p-3 shadow-xl">
        <p className="text-white font-medium tracking-tight mb-2">{label}</p>
        <div className="space-y-1 text-sm">
          <p className="text-error-400">
            Fail Count: <span className="font-bold">{data.fail_count?.toLocaleString()}</span>
          </p>
          {data.pass_count !== undefined && (
            <p className="text-success-400">
              Pass Count: <span className="font-bold">{data.pass_count?.toLocaleString()}</span>
            </p>
          )}
          {data.fail_rate !== undefined && (
            <p className="text-gray-400">
              Fail Rate: <span className="text-white font-bold">{data.fail_rate?.toFixed(2)}%</span>
            </p>
          )}
          {data.by_severity && (
            <div className="mt-2 pt-2 border-t border-[#2A2A2A]">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">By Severity</p>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <span className="text-error-400">Critical: {data.by_severity.critical}</span>
                <span className="text-orange-400">High: {data.by_severity.high}</span>
                <span className="text-warning-400">Medium: {data.by_severity.medium}</span>
                <span className="text-success-400">Low: {data.by_severity.low}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
  return null
}

export default function TimelineChart({
  data,
  isLoading,
  showPassCount = false,
  criticalThreshold,
  height = 300,
  title = 'Fail Count Over Time'
}) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []
    return data.map(d => ({
      ...d,
      period: d.period?.split('T')[0] || d.period // Format date
    }))
  }, [data])

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-md p-5"
      >
        <div className="h-5 w-48 bg-[#222222] rounded mb-4 animate-pulse" />
        <div
          className="bg-[#222222] rounded animate-pulse"
          style={{ height: `${height}px` }}
        />
      </motion.div>
    )
  }

  if (!chartData || chartData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-md p-5"
      >
        <h3 className="text-lg font-semibold text-white tracking-tight mb-4">{title}</h3>
        <div
          className="flex items-center justify-center text-gray-500"
          style={{ height: `${height}px` }}
        >
          No data available for the selected period
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-md p-5"
    >
      <h3 className="text-lg font-semibold text-white tracking-tight mb-4">{title}</h3>
      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="failGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.fail} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.fail} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="passGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.pass} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.pass} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
            <XAxis
              dataKey="period"
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              tickLine={{ stroke: '#2A2A2A' }}
              axisLine={{ stroke: '#2A2A2A' }}
            />
            <YAxis
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              tickLine={{ stroke: '#2A2A2A' }}
              axisLine={{ stroke: '#2A2A2A' }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip content={<CustomTooltip />} />
            {criticalThreshold && (
              <ReferenceLine
                y={criticalThreshold}
                stroke={COLORS.critical}
                strokeDasharray="5 5"
                label={{
                  value: 'Critical',
                  fill: COLORS.critical,
                  fontSize: 11,
                  position: 'right'
                }}
              />
            )}
            <Area
              type="monotone"
              dataKey="fail_count"
              stroke={COLORS.fail}
              strokeWidth={2}
              fill="url(#failGradient)"
              name="Fail Count"
            />
            {showPassCount && (
              <Area
                type="monotone"
                dataKey="pass_count"
                stroke={COLORS.pass}
                strokeWidth={2}
                fill="url(#passGradient)"
                name="Pass Count"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
