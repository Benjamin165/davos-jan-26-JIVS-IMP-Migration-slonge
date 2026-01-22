import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search, X, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '../../utils/cn'

export default function ObjectSelector({
  objects = [],
  selectedObject,
  onSelect,
  isLoading = false,
  placeholder = 'All Objects'
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filteredObjects = objects.filter(obj =>
    obj.object_name?.toLowerCase().includes(search.toLowerCase())
  )

  const selectedObjectData = objects.find(obj => obj.object_name === selectedObject)

  const getTrendIcon = (direction) => {
    if (direction === 'increasing') {
      return <TrendingUp className="w-3 h-3 text-error-400" />
    } else if (direction === 'decreasing') {
      return <TrendingDown className="w-3 h-3 text-success-400" />
    }
    return <Minus className="w-3 h-3 text-gray-400" />
  }

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.object-selector')) {
        setIsOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <div className="object-selector relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={cn(
          'flex items-center justify-between gap-2 px-4 py-2 rounded-[4px] text-sm transition-all min-w-[200px]',
          'bg-[#121212] border border-[#333] text-white',
          'hover:border-[#2E5BFF] focus:outline-none focus:ring-2 focus:ring-[#2E5BFF]',
          isLoading && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span className={selectedObject ? 'text-white' : 'text-gray-400'}>
          {selectedObject || placeholder}
        </span>
        <ChevronDown className={cn(
          'w-4 h-4 text-gray-400 transition-transform',
          isOpen && 'rotate-180'
        )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full left-0 mt-1 w-80 max-h-96 bg-[#1A1A1A] border border-[#2A2A2A] rounded-md shadow-xl overflow-hidden"
          >
            {/* Search */}
            <div className="p-2 border-b border-[#2A2A2A]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search objects..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#121212] border border-[#333] rounded-[4px] text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2E5BFF]"
                  autoFocus
                />
              </div>
            </div>

            {/* Options */}
            <div className="max-h-72 overflow-y-auto">
              {/* All Objects option */}
              <button
                onClick={() => {
                  onSelect(null)
                  setIsOpen(false)
                  setSearch('')
                }}
                className={cn(
                  'w-full px-4 py-3 text-left text-sm transition-colors',
                  'hover:bg-[#222222]',
                  !selectedObject && 'bg-[#2E5BFF]/10 text-[#2E5BFF]'
                )}
              >
                <span className="font-medium">All Objects</span>
                <span className="text-gray-500 ml-2">(aggregate view)</span>
              </button>

              {filteredObjects.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                  No objects found
                </div>
              ) : (
                filteredObjects.map((obj) => (
                  <button
                    key={obj.object_name}
                    onClick={() => {
                      onSelect(obj.object_name)
                      setIsOpen(false)
                      setSearch('')
                    }}
                    className={cn(
                      'w-full px-4 py-3 text-left transition-colors',
                      'hover:bg-[#222222]',
                      selectedObject === obj.object_name && 'bg-[#2E5BFF]/10'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={cn(
                          'text-sm font-medium',
                          selectedObject === obj.object_name ? 'text-[#2E5BFF]' : 'text-white'
                        )}>
                          {obj.object_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {obj.total_fail_count?.toLocaleString()} fails
                          {obj.fail_rate !== undefined && (
                            <span className="ml-2">({obj.fail_rate}% rate)</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {obj.trend_direction && getTrendIcon(obj.trend_direction)}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear button when object selected */}
      {selectedObject && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onSelect(null)
          }}
          className="absolute right-10 top-1/2 -translate-y-1/2 p-1 hover:bg-[#262626] rounded transition-colors"
        >
          <X className="w-3 h-3 text-gray-400" />
        </button>
      )}
    </div>
  )
}
