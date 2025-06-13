import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/devices/$deviceId/view/game/bazzar')({
  component: GameBazzar,
})

function GameBazzar() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">
          Game Bazzar
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Discover new games
        </p>
      </div>
    </div>
  )
}