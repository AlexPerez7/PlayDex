import { useMemo, useState } from 'react'
import { useGames } from '../hooks/useGames'
import { GameCard } from '../components/GameCard'
import type { GameStatus } from '../types/game'

const statusFilters: Array<GameStatus | 'todos'> = [
  'todos',
  'pendiente',
  'jugando',
  'completado',
  'abandonado',
  'en_pausa',
]

export function Library() {
  const { games, loading, error } = useGames()
  const [statusFilter, setStatusFilter] = useState<GameStatus | 'todos'>(
    'todos'
  )
  const [platformFilter, setPlatformFilter] = useState<string>('todas')

  const platforms = useMemo(() => {
    const set = new Set(games.map((g) => g.platform).filter(Boolean) as string[])
    return ['todas', ...Array.from(set)]
  }, [games])

  const filtered = games.filter((g) => {
    const matchesStatus = statusFilter === 'todos' || g.status === statusFilter
    const matchesPlatform =
      platformFilter === 'todas' || g.platform === platformFilter
    return matchesStatus && matchesPlatform
  })

  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-6">
      <h1 className="mb-4 text-xl font-semibold">Mi biblioteca</h1>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs ${
              statusFilter === s
                ? 'bg-emerald-600 text-slate-950'
                : 'bg-slate-900 text-slate-400'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {platforms.length > 1 && (
        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          className="mb-4 w-full rounded-md bg-slate-900 px-3 py-2 text-sm text-slate-100 ring-1 ring-slate-800"
        >
          {platforms.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      )}

      {loading && <p className="text-sm text-slate-400">Cargando...</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

      {!loading && filtered.length === 0 && (
        <p className="mt-8 text-center text-sm text-slate-500">
          No hay juegos que coincidan con el filtro.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {filtered.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  )
}
