import { cn } from '../../utils/cn'

const severityConfig = {
  critical: {
    bg: 'bg-error-500/20',
    text: 'text-error-400',
    label: 'Critical'
  },
  high: {
    bg: 'bg-error-500/20',
    text: 'text-error-400',
    label: 'High'
  },
  medium: {
    bg: 'bg-warning-500/20',
    text: 'text-warning-400',
    label: 'Medium'
  },
  low: {
    bg: 'bg-success-500/20',
    text: 'text-success-400',
    label: 'Low'
  },
  info: {
    bg: 'bg-[#2E5BFF]/20',
    text: 'text-[#2E5BFF]',
    label: 'Info'
  }
}

export default function SeverityBadge({
  severity = 'info',
  showLabel = true,
  className
}) {
  const config = severityConfig[severity.toLowerCase()] || severityConfig.info

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-[4px]',
        config.bg,
        config.text,
        className
      )}
    >
      {showLabel ? config.label : severity}
    </span>
  )
}
