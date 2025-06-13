import { GameCard } from './GameCard'
import { FeaturedGameGrid } from './FeaturedGameGrid'

export interface Game {
  id: string
  title: string
  imageUrl: string
  console?: string
  rating?: number
  lastPlayed?: string
  featured?: boolean
}

interface GameGridProps {
  games: Game[]
  viewMode: 'grid' | 'list' | 'featured'
  onGameClick?: (game: Game) => void
}

export function GameGrid({ games, viewMode, onGameClick }: GameGridProps) {
  if (viewMode === 'list') {
    // TODO: Implement list view
    return <div>List view not implemented yet</div>
  }

  if (viewMode === 'featured') {
    return (
      <div className="flex-1 flex flex-col justify-center overflow-hidden px-6 py-4">
        <FeaturedGameGrid games={games} onGameClick={onGameClick} />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-1">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
        {games.map((game) => (
          <GameCard
            key={game.id}
            title={game.title}
            imageUrl={game.imageUrl}
            onClick={() => onGameClick?.(game)}
          />
        ))}
      </div>
    </div>
  )
}