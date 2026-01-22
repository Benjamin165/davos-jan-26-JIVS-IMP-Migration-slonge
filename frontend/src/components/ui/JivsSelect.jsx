import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../utils/cn'

const JivsSelect = forwardRef(({
  label,
  error,
  options = [],
  placeholder = 'Select...',
  className,
  selectClassName,
  ...props
}, ref) => {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'w-full px-3 py-2 text-white text-sm transition-all duration-200 appearance-none cursor-pointer',
            'bg-[#121212] border border-[#333] rounded-[4px]',
            'focus:outline-none focus:ring-2 focus:ring-[#2E5BFF] focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-error-500 focus:ring-error-500',
            selectClassName
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-[#1A1A1A] text-white"
            >
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-error-400">{error}</p>
      )}
    </div>
  )
})

JivsSelect.displayName = 'JivsSelect'

export default JivsSelect
