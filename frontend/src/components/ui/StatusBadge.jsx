import { cn } from '../../utils/cn'

const statusConfig = {
  success: {
    bg: 'bg-success-500/20',
    text: 'text-success-400',
    dot: 'bg-success-500'
  },
  warning: {
    bg: 'bg-warning-500/20',
    text: 'text-warning-400',
    dot: 'bg-warning-500'
  },
  error: {
    bg: 'bg-error-500/20',
    text: 'text-error-400',
    dot: 'bg-error-500'
  },
  info: {
    bg: 'bg-[#2E5BFF]/20',
    text: 'text-[#2E5BFF]',
    dot: 'bg-[#2E5BFF]'
  },
  neutral: {
    bg: 'bg-gray-500/20',
    text: 'text-gray-400',
    dot: 'bg-gray-500'
  }
}

export default function StatusBadge({
  status = 'neutral',
  children,
  showDot = false,
  className
}) {
  const config = statusConfig[status] || statusConfig.neutral

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-[4px]',
        config.bg,
        config.text,
        className
      )}
    >
      {showDot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      )}
      {children}
    </span>
  )
}
