interface FilterBarProps {
  filters: string[]
  activeFilter: string
  viewMode: 'grid' | 'list'
  gameCount: number
  onFilterChange: (filter: string) => void
  onViewModeChange: (mode: 'grid' | 'list') => void
}

export function FilterBar({ 
  filters, 
  activeFilter, 
  viewMode,
  gameCount,
  onFilterChange, 
  onViewModeChange 
}: FilterBarProps) {
  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <button className="p-1.5 bg-neutral-300 dark:bg-neutral-700 border-none rounded-lg cursor-pointer transition-colors duration-200 hover:bg-neutral-400 dark:hover:bg-neutral-600 flex items-center justify-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </button>
        <div className="flex gap-1.5 overflow-x-auto flex-1">
          {filters.map((filter) => (
            <button 
              key={filter}
              onClick={() => onFilterChange(filter)}
              className={`flex-shrink-0 py-1.5 px-2.5 text-xs border-none rounded-lg cursor-pointer transition-colors duration-200 whitespace-nowrap ${
                activeFilter === filter 
                  ? 'bg-red-600 dark:bg-red-500 text-white font-medium shadow-sm' 
                  : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-400 dark:hover:bg-neutral-600'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <button className="p-1.5 bg-neutral-300 dark:bg-neutral-700 border-none rounded-lg cursor-pointer transition-colors duration-200 hover:bg-neutral-400 dark:hover:bg-neutral-600 flex items-center justify-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"></polygon>
          </svg>
        </button>
      </div>

      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{activeFilter}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">{gameCount} games</span>
          <div className="flex bg-neutral-200 dark:bg-neutral-800 rounded p-0.5">
            <button 
              onClick={() => onViewModeChange('grid')}
              className={`p-1 border-none rounded cursor-pointer ${
                viewMode === 'grid' 
                  ? 'bg-white dark:bg-neutral-700 text-inherit shadow-sm' 
                  : 'bg-transparent text-neutral-400'
              }`}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" rx="1"></rect>
                <rect x="14" y="3" width="7" height="7" rx="1"></rect>
                <rect x="3" y="14" width="7" height="7" rx="1"></rect>
                <rect x="14" y="14" width="7" height="7" rx="1"></rect>
              </svg>
            </button>
            <button 
              onClick={() => onViewModeChange('list')}
              className={`p-1 border-none rounded cursor-pointer ${
                viewMode === 'list' 
                  ? 'bg-white dark:bg-neutral-700 text-inherit shadow-sm' 
                  : 'bg-transparent text-neutral-400'
              }`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}