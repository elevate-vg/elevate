import { Wifi, Battery, Sun, Moon } from 'lucide-react'

interface HeaderProps {
  currentTime: string
  isDark: boolean
  onToggleTheme: () => void
}

export function Header({ currentTime, isDark, onToggleTheme }: HeaderProps) {
  return (
    <header className="w-full flex text-neutral-600 dark:text-white/70 z-20 sticky top-0 bg-neutral-200 dark:bg-neutral-900 text-xs py-1.5 px-3 items-center justify-between">
      <div className="font-medium">{currentTime}</div>
      <div className="flex items-center gap-2.5">
        <Wifi className="w-4 h-4" aria-label="WiFi" />
        <Battery className="w-4 h-4" aria-label="Battery" />
        <button 
          onClick={onToggleTheme}
          className="bg-transparent border-none cursor-pointer p-0 text-inherit" 
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <div className="w-6 h-6 rounded-full overflow-hidden border border-neutral-300 dark:border-white/20">
          <img className="w-full h-full object-cover" alt="" src="https://i.pravatar.cc/80" />
        </div>
      </div>
    </header>
  )
}