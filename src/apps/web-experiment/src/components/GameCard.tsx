interface GameCardProps {
  title: string
  imageUrl: string
  onClick?: () => void
}

export function GameCard({ title, imageUrl, onClick }: GameCardProps) {
  return (
    <div 
      onClick={onClick}
      className="cursor-pointer relative rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-300 dark:border-white/10 aspect-square transition-all duration-200 hover:border-sky-400"
    >
      <img 
        className="w-full h-full object-cover" 
        alt={title} 
        src={imageUrl} 
      />
    </div>
  )
}