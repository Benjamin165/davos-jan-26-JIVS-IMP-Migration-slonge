import { forwardRef } from 'react'
import { cn } from '../../utils/cn'

const variants = {
  primary: 'bg-[#2E5BFF] text-white hover:brightness-110',
  secondary: 'bg-[#262626] text-gray-300 hover:text-white hover:brightness-110',
  ghost: 'bg-transparent text-gray-400 hover:bg-[#262626] hover:text-white',
  danger: 'bg-error-500 text-white hover:brightness-110',
  outline: 'bg-transparent border border-[#333] text-gray-300 hover:bg-[#262626] hover:text-white'
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  icon: 'p-2'
}

const JivsButton = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-[4px] transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E5BFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0D0D]',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  )
})

JivsButton.displayName = 'JivsButton'

export default JivsButton
