interface FooterActionsProps {
  onOptionsClick?: () => void
  onBackClick?: () => void
  onPlayClick?: () => void
}

export function FooterActions({ onOptionsClick, onBackClick, onPlayClick }: FooterActionsProps) {
  return (
    <footer className="w-full flex dark:text-white/70 dark:border-white/10 text-xs text-neutral-600 border-neutral-300 border-t pt-2.5 pr-3 pb-2.5 pl-3 items-center justify-between">
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-5 rounded-full border border-neutral-400 dark:border-white/50 flex items-center justify-center text-xs font-semibold">
          Y
        </div>
        <span>Options</span>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={onBackClick}
          className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer text-inherit"
        >
          <div className="w-5 h-5 rounded-full border border-neutral-400 dark:border-white/50 flex items-center justify-center text-xs font-semibold">
            B
          </div>
          <span>Back</span>
        </button>
        <button 
          onClick={onPlayClick}
          className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer text-inherit"
        >
          <div className="w-5 h-5 rounded-full border border-neutral-400 dark:border-white/50 flex items-center justify-center text-xs font-semibold">
            A
          </div>
          <span>Play</span>
        </button>
      </div>
    </footer>
  )
}