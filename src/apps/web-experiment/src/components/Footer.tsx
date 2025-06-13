interface FooterProps {
  onCategoriesClick?: () => void
  onSearchClick?: () => void
  onPlayClick?: () => void
}

export function Footer({ onCategoriesClick, onSearchClick, onPlayClick }: FooterProps) {
  return (
    <footer className="w-full flex text-neutral-600 dark:text-white/70 text-xs border-t border-neutral-300 dark:border-white/10 py-2.5 px-3 items-center justify-between bg-neutral-200 dark:bg-neutral-900">
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-5 rounded-full border border-neutral-400 dark:border-white/50 flex items-center justify-center text-xs font-semibold">Y</div>
        <span>Categories</span>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={onSearchClick}
          className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer text-inherit"
        >
          <div className="w-5 h-5 rounded-full border border-neutral-400 dark:border-white/50 flex items-center justify-center text-xs font-semibold">X</div>
          <span>Search</span>
        </button>
        <button 
          onClick={onPlayClick}
          className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer text-inherit"
        >
          <div className="w-5 h-5 rounded-full border border-neutral-400 dark:border-white/50 flex items-center justify-center text-xs font-semibold">A</div>
          <span>Play</span>
        </button>
      </div>
    </footer>
  )
}