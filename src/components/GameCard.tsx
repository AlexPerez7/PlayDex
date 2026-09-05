import type { Game, GameStatus } from '../types/game'

const statusLabels: Record<GameStatus, string> = {
  pendiente: 'Pendiente',
  jugando: 'Jugando',
  completado: 'Completado',
  abandonado: 'Abandonado',
  en_pausa: 'En pausa',
}

const statusColors: Record<GameStatus, string> = {
  pendiente: 'bg-slate-700 text-slate-200',
  jugando: 'bg-emerald-700 text-emerald-100',
  completado: 'bg-blue-700 text-blue-100',
  abandonado: 'bg-red-800 text-red-100',
  en_pausa: 'bg-amber-700 text-amber-100',
}

interface GameCardProps {
  game: Game
  onClick?: (game: Game) => void
}

export function GameCard({ game, onClick }: GameCardProps) {
  return (
    <button
      onClick={() => onClick?.(game)}
      className="flex w-full items-center gap-3 rounded-lg bg-slate-900 p-3 text-left shadow-sm ring-1 ring-slate-800 active:scale-[0.99]"
    >
      <div className="h-20 w-14 flex-shrink-0 overflow-hidden rounded bg-slate-800">
        {game.cover_url ? (
          <img
            src={game.cover_url}
            alt={game.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl">
            🎮
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-slate-100">{game.title}</p>
        <p className="truncate text-sm text-slate-400">
          {game.platform ?? 'Sin plataforma'}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-xs ${statusColors[game.status]}`}
          >
            {statusLabels[game.status]}
          </span>
          <span className="text-xs text-slate-500">
            {game.hours_played}h
          </span>
        </div>
      </div>
    </button>
  )
}
