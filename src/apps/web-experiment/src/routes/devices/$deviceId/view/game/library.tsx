import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { FilterBar } from '../../../../../components/FilterBar'
import { GameGrid, type Game } from '../../../../../components/GameGrid'

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

export const Route = createFileRoute('/devices/$deviceId/view/game/library')({
  component: GameLibrary,
})

function GameLibrary() {
  const [activeFilter, setActiveFilter] = useState('All Games')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filters = ['All Games', 'GBA', 'NES', 'Action', 'Puzzle']

  return (
    <>
      <FilterBar
        filters={filters}
        activeFilter={activeFilter}
        viewMode={viewMode}
        gameCount={allGames.length}
        onFilterChange={setActiveFilter}
        onViewModeChange={setViewMode}
      />

      <div className="flex flex-col flex-1 min-h-0">
        <GameGrid
          games={allGames}
          viewMode={viewMode}
          onGameClick={(game) => console.log('Game clicked:', game)}
        />
      </div>
    </>
  )
}
