import { Heart, Star } from 'lucide-react'
import { TagList } from './TagList'
import { GameThumb } from './GameThumb'
import { statusLabels, statusColors } from '../lib/status'
import type { Game } from '../types/game'

interface GameCardProps {
  game: Game
  onClick?: (game: Game) => void
  className?: string
}

export function GameCard({ game, onClick, className = '' }: GameCardProps) {
  return (
    <button
      onClick={() => onClick?.(game)}
      className={`flex w-full items-center gap-3 rounded-lg bg-background-surface p-3 text-left shadow-sm ring-1 ring-primary-dark/30 active:scale-[0.99] ${className}`}
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
        <p className="flex items-center gap-1.5 font-medium text-ink">
          <span className="truncate">{game.title}</span>
          {game.is_favorite && (
            <Heart size={14} className="flex-shrink-0 text-accent" fill="currentColor" aria-label="Favorito" />
          )}
        </p>
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
          <span className="text-xs text-lavender">{game.hours_played}h</span>
          {game.rating != null && (
            <span className="flex items-center gap-0.5 text-xs text-lavender">
              <Star size={12} className="text-accent" fill="currentColor" />
              {game.rating}/10
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
