import { createFileRoute } from '@tanstack/react-router'
import { FeaturedGameGrid } from '../../../../../components/FeaturedGameGrid'
import { type Game } from '../../../../../components/GameGrid'

export const Route = createFileRoute('/devices/$deviceId/view/game/home')({
  component: GameHome,
})

const featuredGames: Game[] = [
  {
    id: '1',
    title: 'The Minish Cap',
    imageUrl: 'https://cdn2.steamgriddb.com/thumb/e98002ab38ca88f2ca5e461cc99c5d2b.jpg',
    featured: true,
    lastPlayed: '2 hours ago'
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
  }
]

function GameHome() {
  return (
    <div className="flex-1 flex flex-col gap-6">
      <FeaturedGameGrid
        games={featuredGames}
        onGameClick={(game) => console.log('Featured game clicked:', game)}
      />
    </div>
  )
}
