import { cn } from '../../utils/cn'

export default function JivsDataTable({
  children,
  className,
  ...props
}) {
  return (
    <div className={cn('overflow-x-auto rounded-md border border-[#2A2A2A]', className)}>
      <table className="w-full text-sm" {...props}>
        {children}
      </table>
    </div>
  )
}

export function JivsTableHeader({ children, className }) {
  return (
    <thead className={cn('bg-transparent', className)}>
      {children}
    </thead>
  )
}

export function JivsTableHeaderCell({ children, className, align = 'left', sortable = false, sorted, onSort }) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  return (
    <th
      className={cn(
        'uppercase text-[11px] font-bold text-gray-400 tracking-wider px-4 py-3',
        alignClass[align],
        sortable && 'cursor-pointer hover:text-white transition-colors select-none',
        className
      )}
      onClick={sortable ? onSort : undefined}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sortable && sorted && (
          <span className="text-[#2E5BFF]">
            {sorted === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </span>
    </th>
  )
}

export function JivsTableBody({ children, className }) {
  return (
    <tbody className={cn('', className)}>
      {children}
    </tbody>
  )
}

export function JivsTableRow({ children, className, onClick, selected = false }) {
  return (
    <tr
      className={cn(
        'border-b border-[#1A1A1A] transition-colors',
        onClick && 'cursor-pointer',
        selected ? 'bg-[#2E5BFF]/10' : 'hover:bg-[#222222]',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

export function JivsTableCell({ children, className, align = 'left' }) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  return (
    <td className={cn('px-4 py-2 text-white', alignClass[align], className)}>
      {children}
    </td>
  )
}

export function JivsTableEmpty({ children = 'No data available', colSpan = 1, className }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className={cn('px-4 py-8 text-center text-gray-500', className)}
      >
        {children}
      </td>
    </tr>
  )
}
