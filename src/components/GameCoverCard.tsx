import { Heart } from 'lucide-react'
import { GameThumb } from './GameThumb'
import { statusColors, statusIcons, statusLabels } from '../lib/status'
import type { Game } from '../types/game'

interface GameCoverCardProps {
  game: Game
  onClick: (game: Game) => void
  onStatusClick?: (game: Game) => void
}

/** Tarjeta de juego en modo cuadrícula: la portada manda. */
export function GameCoverCard({ game, onClick, onStatusClick }: GameCoverCardProps) {
  const StatusIcon = statusIcons[game.status]
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onClick(game)}
        className="block w-full text-left transition-transform active:scale-[0.97]"
      >
        <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-primary-dark/20 ring-1 ring-primary-dark/30">
          <GameThumb
            src={game.cover_url}
            alt=""
            className="h-full w-full object-cover"
            placeholderClassName="text-3xl"
          />
        </div>
        <p className="mt-1.5 line-clamp-2 text-xs font-medium leading-tight text-ink">{game.title}</p>
        <p className="text-[11px] text-lavender">{game.hours_played}h</p>
      </button>

      {game.is_favorite && (
        <Heart
          size={16}
          fill="currentColor"
          aria-label="Favorito"
          className="pointer-events-none absolute left-1.5 top-1.5 text-accent drop-shadow"
        />
      )}
      <button
        type="button"
        onClick={() => onStatusClick?.(game)}
        disabled={!onStatusClick}
        aria-label={`Estado: ${statusLabels[game.status]}. Cambiar`}
        className={`absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full shadow after:absolute after:-inset-1.5 after:content-[''] ${statusColors[game.status]}`}
      >
        <StatusIcon size={15} />
      </button>
    </div>
  )
}
