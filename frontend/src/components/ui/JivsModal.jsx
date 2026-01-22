import { Fragment } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[90vw]'
}

export default function JivsModal({
  isOpen,
  onClose,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  className
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={closeOnBackdrop ? onClose : undefined}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-md shadow-xl',
                sizes[size],
                className
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1 rounded-[4px] text-gray-400 hover:text-white hover:bg-[#262626] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              {children}
            </motion.div>
          </div>
        </Fragment>
      )}
    </AnimatePresence>
  )
}

export function JivsModalHeader({ children, className }) {
  return (
    <div className={cn('p-4 border-b border-[#2A2A2A]', className)}>
      {children}
    </div>
  )
}

export function JivsModalTitle({ children, className }) {
  return (
    <h2 className={cn('text-lg font-semibold text-white tracking-tight', className)}>
      {children}
    </h2>
  )
}

export function JivsModalDescription({ children, className }) {
  return (
    <p className={cn('text-sm text-gray-400 mt-1', className)}>
      {children}
    </p>
  )
}

export function JivsModalBody({ children, className }) {
  return (
    <div className={cn('p-4', className)}>
      {children}
    </div>
  )
}

export function JivsModalFooter({ children, className }) {
  return (
    <div className={cn('p-4 border-t border-[#2A2A2A] flex items-center justify-end gap-2', className)}>
      {children}
    </div>
  )
}
