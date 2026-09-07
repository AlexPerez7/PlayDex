import { TagList } from './TagList'
import { GameThumb } from './GameThumb'
import { statusLabels, statusColors } from '../lib/status'
import type { Game } from '../types/game'

interface GameCardProps {
  game: Game
  onClick?: (game: Game) => void
}

export function GameCard({ game, onClick }: GameCardProps) {
  return (
    <button
      onClick={() => onClick?.(game)}
      className="flex w-full items-center gap-3 rounded-lg bg-background-surface p-3 text-left shadow-sm ring-1 ring-primary-dark/30 active:scale-[0.99]"
    >
      <div className="h-20 w-14 flex-shrink-0 overflow-hidden rounded bg-primary-dark/20">
        <GameThumb
          src={game.cover_url}
          alt={game.title}
          className="h-full w-full object-cover"
          placeholderClassName="text-2xl"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink">{game.title}</p>
        {game.platform ? (
          <div className="mt-0.5">
            <TagList value={game.platform} />
          </div>
        ) : (
          <p className="text-sm text-lavender">Sin plataforma</p>
        )}
        <div className="mt-1 flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-xs ${statusColors[game.status]}`}
          >
            {statusLabels[game.status]}
          </span>
          <span className="text-xs text-lavender">
            {game.hours_played}h
          </span>
        </div>
      </div>
    </button>
  )
}
