import { useMemo } from 'react'
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { motion } from 'framer-motion'

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-md p-3 shadow-xl">
        <p className="text-white font-medium tracking-tight mb-2">{label}</p>
        {data.actual !== undefined && (
          <p className="text-sm text-error-400">
            Actual: <span className="font-bold">{data.actual?.toLocaleString()}</span>
          </p>
        )}
        {data.predicted !== undefined && (
          <p className="text-sm text-[#2E5BFF]">
            Predicted: <span className="font-bold">{data.predicted?.toLocaleString()}</span>
          </p>
        )}
        {data.confidence !== undefined && (
          <p className="text-xs text-gray-400 mt-1">
            Confidence: {(data.confidence * 100).toFixed(0)}%
          </p>
        )}
        {data.range && (
          <p className="text-xs text-gray-500 mt-1">
            Range: {data.range.low?.toLocaleString()} - {data.range.high?.toLocaleString()}
          </p>
        )}
      </div>
    )
  }
  return null
}

export default function PredictionChart({
  historicalData = [],
  predictions = [],
  height = 250
}) {
  const chartData = useMemo(() => {
    // Combine historical and predicted data
    const combined = []

    // Add historical data
    historicalData.forEach(d => {
      combined.push({
        period: d.period?.split('T')[0] || d.period,
        actual: d.fail_count,
        type: 'historical'
      })
    })

    // Add predictions
    predictions.forEach(p => {
      combined.push({
        period: p.period?.split('T')[0] || p.period,
        predicted: p.predicted_fail_count,
        confidence: p.confidence,
        range: p.range,
        type: 'prediction'
      })
    })

    // Add connection point (last historical = first prediction)
    if (historicalData.length > 0 && predictions.length > 0) {
      const lastHistorical = historicalData[historicalData.length - 1]
      const connectorIndex = combined.findIndex(
        d => d.type === 'prediction' && d.period === predictions[0].period
      )
      if (connectorIndex === -1) {
        // Insert connector
        combined.splice(historicalData.length, 0, {
          period: lastHistorical.period?.split('T')[0] || lastHistorical.period,
          actual: lastHistorical.fail_count,
          predicted: lastHistorical.fail_count,
          type: 'connector'
        })
      }
    }

    return combined
  }, [historicalData, predictions])

  if (chartData.length === 0) {
    return (
      <div className="bg-[#111111] rounded-md p-4 text-center text-gray-500">
        No data available for prediction chart
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="bg-[#111111] rounded-md p-4"
    >
      <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
        Historical vs Predicted
      </h4>
      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2E5BFF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2E5BFF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
            <XAxis
              dataKey="period"
              tick={{ fill: '#9CA3AF', fontSize: 10 }}
              tickLine={{ stroke: '#2A2A2A' }}
              axisLine={{ stroke: '#2A2A2A' }}
            />
            <YAxis
              tick={{ fill: '#9CA3AF', fontSize: 10 }}
              tickLine={{ stroke: '#2A2A2A' }}
              axisLine={{ stroke: '#2A2A2A' }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Historical data area */}
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#EF4444"
              strokeWidth={2}
              fill="url(#actualGradient)"
              name="Actual"
              connectNulls
            />

            {/* Predicted data line with dashed style */}
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#2E5BFF"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#2E5BFF', strokeWidth: 0, r: 4 }}
              name="Predicted"
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-error-400" />
          <span className="text-xs text-gray-400">Historical</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-[#2E5BFF]" style={{ borderStyle: 'dashed', borderWidth: 1 }} />
          <span className="text-xs text-gray-400">Predicted</span>
        </div>
      </div>
    </motion.div>
  )
}
