import { forwardRef } from 'react'
import { cn } from '../../utils/cn'

const JivsInput = forwardRef(({
  label,
  error,
  className,
  inputClassName,
  rightAlign = false,
  ...props
}, ref) => {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full px-3 py-2 text-white text-sm transition-all duration-200',
          'bg-[#121212] border border-[#333] rounded-[4px]',
          'placeholder:text-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-[#2E5BFF] focus:border-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          rightAlign && 'text-right',
          error && 'border-error-500 focus:ring-error-500',
          inputClassName
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-error-400">{error}</p>
      )}
    </div>
  )
})

JivsInput.displayName = 'JivsInput'

export default JivsInput
