import { cn } from '../../utils/cn'

export default function JivsCard({
  children,
  nested = false,
  hover = false,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        'rounded-md',
        nested
          ? 'bg-[#111111]'
          : 'bg-[#1A1A1A] border border-[#2A2A2A]',
        hover && 'transition-colors hover:bg-[#222222]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function JivsCardHeader({ children, className }) {
  return (
    <div className={cn('p-4 border-b border-[#2A2A2A]', className)}>
      {children}
    </div>
  )
}

export function JivsCardTitle({ children, className }) {
  return (
    <h3 className={cn('font-semibold text-white tracking-tight', className)}>
      {children}
    </h3>
  )
}

export function JivsCardDescription({ children, className }) {
  return (
    <p className={cn('text-sm text-gray-400 mt-1', className)}>
      {children}
    </p>
  )
}

export function JivsCardContent({ children, className }) {
  return (
    <div className={cn('p-4', className)}>
      {children}
    </div>
  )
}

export function JivsCardFooter({ children, className }) {
  return (
    <div className={cn('p-4 border-t border-[#2A2A2A]', className)}>
      {children}
    </div>
  )
}
