import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Lightbulb,
  Settings
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'
import PredictionChart from './PredictionChart'

export default function AIPredictionPanel({
  predictions,
  analysis,
  historicalData,
  isLoading,
  isConfigured,
  onGenerate,
  error
}) {
  const [isExpanded, setIsExpanded] = useState(true)

  if (!isConfigured) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-md p-5"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-[4px] bg-[#2E5BFF]/20">
            <Sparkles className="w-5 h-5 text-[#2E5BFF]" />
          </div>
          <h3 className="text-lg font-semibold text-white tracking-tight">
            AI Prediction Analysis
          </h3>
        </div>

        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-[#111111] flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-gray-500" />
          </div>
          <h4 className="text-lg font-medium text-white mb-2">
            AI Predictions Not Configured
          </h4>
          <p className="text-gray-400 text-sm mb-4 max-w-md mx-auto">
            To enable AI-powered trend predictions, please configure your OpenAI API key in Settings.
          </p>
          <Link
            to="/settings?tab=ai"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#2E5BFF] text-white rounded-[4px] text-sm font-medium hover:brightness-110 transition-all"
          >
            <Settings className="w-4 h-4" />
            Configure API Key
          </Link>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-md overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-[#222222] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-[4px] bg-[#2E5BFF]/20">
            <Sparkles className="w-5 h-5 text-[#2E5BFF]" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-white tracking-tight">
              AI Prediction Analysis
            </h3>
            <p className="text-xs text-gray-400">
              Powered by OpenAI GPT-4
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isExpanded && predictions && (
            <span className="text-xs text-[#2E5BFF] bg-[#2E5BFF]/20 px-2 py-1 rounded-[4px]">
              {predictions.length} predictions available
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-[#2A2A2A]"
          >
            <div className="p-5 space-y-5">
              {/* Generate Button */}
              {!predictions && !isLoading && (
                <div className="text-center py-4">
                  <button
                    onClick={onGenerate}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#2E5BFF] text-white rounded-[4px] font-medium hover:brightness-110 transition-all"
                  >
                    <Sparkles className="w-5 h-5" />
                    Generate AI Predictions
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Analyze historical trends and predict future data quality
                  </p>
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 text-[#2E5BFF] animate-spin mx-auto mb-4" />
                  <p className="text-white font-medium">Analyzing trends...</p>
                  <p className="text-gray-400 text-sm">
                    AI is processing historical data to generate predictions
                  </p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="p-4 rounded-md bg-error-500/10 border border-error-500/30">
                  <div className="flex items-center gap-2 text-error-400">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-medium">Prediction Failed</span>
                  </div>
                  <p className="text-sm text-error-300 mt-1">{error}</p>
                </div>
              )}

              {/* Predictions Content */}
              {predictions && analysis && (
                <>
                  {/* Prediction Chart */}
                  <PredictionChart
                    historicalData={historicalData}
                    predictions={predictions}
                  />

                  {/* Key Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.estimated_critical_date && (
                      <div className="p-4 rounded-md bg-error-500/10 border border-error-500/30">
                        <div className="flex items-center gap-2 text-error-400 mb-2">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-xs uppercase tracking-wider font-medium">
                            Estimated Critical Date
                          </span>
                        </div>
                        <p className="text-xl font-bold text-error-400">
                          {new Date(analysis.estimated_critical_date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          At current rate, critical threshold will be reached
                        </p>
                      </div>
                    )}

                    {analysis.estimated_resolution_date && (
                      <div className="p-4 rounded-md bg-success-500/10 border border-success-500/30">
                        <div className="flex items-center gap-2 text-success-400 mb-2">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs uppercase tracking-wider font-medium">
                            Estimated Resolution
                          </span>
                        </div>
                        <p className="text-xl font-bold text-success-400">
                          {new Date(analysis.estimated_resolution_date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Issues projected to be resolved by this date
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Key Insights */}
                  {analysis.key_insights && analysis.key_insights.length > 0 && (
                    <div className="p-4 rounded-md bg-[#111111]">
                      <div className="flex items-center gap-2 text-gray-400 mb-3">
                        <Lightbulb className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-wider font-medium">
                          Key Insights
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {analysis.key_insights.map((insight, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                            <span className="text-[#2E5BFF] mt-1">•</span>
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {analysis.recommendations && analysis.recommendations.length > 0 && (
                    <div className="p-4 rounded-md bg-[#111111]">
                      <div className="flex items-center gap-2 text-gray-400 mb-3">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-wider font-medium">
                          Recommendations
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {analysis.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                            <span className="text-success-400 mt-1">✓</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Regenerate */}
                  <div className="flex justify-end">
                    <button
                      onClick={onGenerate}
                      disabled={isLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#262626] text-gray-300 rounded-[4px] text-sm hover:text-white hover:brightness-110 transition-all disabled:opacity-50"
                    >
                      <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
                      Regenerate Predictions
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
