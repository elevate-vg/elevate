import { Game } from './GameGrid'
import { useState } from 'react'

interface FeaturedGameGridProps {
  games: Game[]
  onGameClick?: (game: Game) => void
}

const allGames: Game[] = [
  {
    id: '1',
    title: 'The Minish Cap',
    imageUrl: 'https://cdn2.steamgriddb.com/thumb/e98002ab38ca88f2ca5e461cc99c5d2b.jpg'
  },
  {
    id: '2',
    title: 'Tetris: Hard Drop',
    imageUrl: 'https://cdn2.steamgriddb.com/thumb/036036d598e3d81b103ce8b3c6786dfb.jpg'
  },
  {
    id: '3',
    title: 'Donkey Kong',
    imageUrl: 'https://cdn2.steamgriddb.com/thumb/8c690fdb96c00586c26b5ce86d21b55f.jpg'
  },
  {
    id: '4',
    title: 'ScourgeBringer',
    imageUrl: 'https://cdn2.steamgriddb.com/grid/f68724cd9da08a80a5eaa5cc60bbe1ab.jpg'
  },
  {
    id: '5',
    title: 'Metroid Zero Mission',
    imageUrl: 'https://cdn2.steamgriddb.com/grid/da0198ea02cb283a14672a3837d65d92.jpg'
  },
  {
    id: '6',
    title: 'Super Mario World',
    imageUrl: 'https://cdn2.steamgriddb.com/grid/3a8b781906eaa647a820ba901f9dad36.png'
  },
  {
    id:   '7',
    title: 'Elden Ring',
    imageUrl: 'https://cdn2.steamgriddb.com/grid/01c8fccb618709f905850f551652da59.jpg'
  },
  {
    id: '8',
    title: 'Dead Cells',
    imageUrl: 'https://cdn2.steamgriddb.com/grid/dc7fb4ef5dd83523eb28d046ce9aa885.jpg'
  }
]

export function FeaturedGameGrid({ games, onGameClick }: FeaturedGameGridProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [previousPage, setPreviousPage] = useState(0)
  
  // First page has 1 featured (2x2) + 4 others, subsequent pages have 5 games
  const firstPageSize = 5
  const otherPageSize = 5
  
  const totalPages = Math.ceil((allGames.length - firstPageSize) / otherPageSize) + 1
  
  const handlePageChange = (newPage: number) => {
    setPreviousPage(currentPage)
    setCurrentPage(newPage)
  }
  
  const isMovingForward = currentPage > previousPage
  const animationClass = isMovingForward ? 'animate-slide-in-right' : 'animate-slide-in-left'
  
  let currentGames: Game[]
  let featuredGame: Game | undefined
  let otherGames: Game[]
  
  if (currentPage === 0) {
    // First page: first game is featured (2x2), next 4 are regular
    currentGames = allGames.slice(0, firstPageSize)
    featuredGame = currentGames[0]
    otherGames = currentGames.slice(1, 5)
  } else {
    // Other pages: all games are regular (1x1)
    const startIndex = firstPageSize + (currentPage - 1) * otherPageSize
    currentGames = allGames.slice(startIndex, startIndex + otherPageSize)
    featuredGame = undefined
    otherGames = currentGames
  }

  return (
    <div className="w-full">
      <div
        key={currentPage}
        className={`grid grid-cols-4 grid-rows-2 gap-3 auto-rows-fr ${animationClass}`}
        style={{ aspectRatio: '2/1' }}
      >
        {/* Featured Game - 2x2 */}
        {featuredGame && (
          <div
            className="col-span-2 row-span-2 group cursor-pointer relative rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-300 dark:border-white/10 hover:border-sky-400 dark:hover:border-sky-400 transition-all duration-200"
            onClick={() => onGameClick?.(featuredGame)}
          >
            <img
              src={featuredGame.imageUrl}
              alt={featuredGame.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-200">
              <div className="text-sm font-medium tracking-tight">
                {featuredGame.title}
              </div>
              <div className="text-xs text-white/70 mt-1">
                {featuredGame.lastPlayed || 'Last played'}
              </div>
            </div>
          </div>
        )}

        {/* Other Games - 1x1 each */}
        {otherGames.map((game) => (
          <div
            key={game.id}
            className="group cursor-pointer relative rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-300 dark:border-white/10 hover:border-sky-400 dark:hover:border-sky-400 transition-all duration-200"
            onClick={() => onGameClick?.(game)}
          >
            <img
              src={game.imageUrl}
              alt={game.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            <div className="absolute bottom-0 left-0 right-0 p-2 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-200">
              <div className="text-xs font-medium">{game.title}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center pt-6 gap-2">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => handlePageChange(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentPage
                ? 'bg-red-600 dark:bg-red-500'
                : 'bg-neutral-400 dark:bg-neutral-600 hover:bg-neutral-500 dark:hover:bg-neutral-500'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
