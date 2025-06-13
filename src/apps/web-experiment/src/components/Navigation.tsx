interface NavigationProps {
  tabs: string[]
  activeTab: string
  onTabChange: (tab: string) => void
}

export function Navigation({ tabs, activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="w-full flex justify-center py-3 pb-1 bg-neutral-200 dark:bg-neutral-900">
      <div className="flex gap-1 rounded-full py-0.5 px-2 text-xs" role="tablist">
        {tabs.map((tab) => (
          <button 
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`py-1 px-2.5 rounded-full border-none cursor-pointer transition-all duration-200 ${
              activeTab === tab 
                ? 'font-medium bg-red-600 dark:bg-red-500 text-white shadow-sm' 
                : 'bg-transparent text-neutral-700 dark:text-white hover:bg-neutral-300 dark:hover:bg-white/10'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </nav>
  )
}