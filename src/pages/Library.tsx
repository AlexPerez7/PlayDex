import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGames } from '../hooks/useGames'
import { GameCard } from '../components/GameCard'
import { PageContainer } from '../components/PageContainer'
import { parseTags } from '../lib/tags'
import type { GameStatus } from '../types/game'

const statusFilters: Array<GameStatus | 'todos'> = [
  'todos',
  'pendiente',
  'jugando',
  'completado',
  'abandonado',
  'en_pausa',
]

type SortOption = 'recientes' | 'titulo' | 'horas' | 'puntaje'

const sortLabels: Record<SortOption, string> = {
  recientes: 'Recién agregados',
  titulo: 'Título (A-Z)',
  horas: 'Más horas jugadas',
  puntaje: 'Mejor puntuados',
}

export function Library() {
  const navigate = useNavigate()
  const { games, loading, error } = useGames()
  const [statusFilter, setStatusFilter] = useState<GameStatus | 'todos'>(
    'todos'
  )
  const [platformFilter, setPlatformFilter] = useState<string>('todas')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('recientes')

  const platforms = useMemo(() => {
    const set = new Set(games.flatMap((g) => parseTags(g.platform)))
    return ['todas', ...Array.from(set)]
  }, [games])

  const filtered = games.filter((g) => {
    const matchesStatus = statusFilter === 'todos' || g.status === statusFilter
    const matchesPlatform =
      platformFilter === 'todas' || parseTags(g.platform).includes(platformFilter)
    const matchesSearch =
      search.trim() === '' ||
      g.title.toLowerCase().includes(search.trim().toLowerCase())
    return matchesStatus && matchesPlatform && matchesSearch
  })

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'titulo':
        return a.title.localeCompare(b.title)
      case 'horas':
        return b.hours_played - a.hours_played
      case 'puntaje':
        return (b.rating ?? 0) - (a.rating ?? 0)
      default:
        return 0
    }
  })

  return (
    <PageContainer>
      <h1 className="mb-4 text-xl font-semibold">Mi biblioteca</h1>

      <div className="md:flex md:items-start md:gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por título..."
          className="mb-3 w-full rounded-md bg-slate-900 px-3 py-2 text-sm text-slate-100 ring-1 ring-slate-800 focus:outline-none focus:ring-emerald-600 md:mb-0 md:max-w-xs"
        />

        {platforms.length > 1 && (
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="mb-4 w-full rounded-md bg-slate-900 px-3 py-2 text-sm text-slate-100 ring-1 ring-slate-800 md:mb-0 md:w-auto"
          >
            {platforms.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
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

      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as SortOption)}
        className="mb-4 w-full rounded-md bg-slate-900 px-3 py-2 text-sm text-slate-100 ring-1 ring-slate-800 md:w-auto"
      >
        {Object.entries(sortLabels).map(([value, label]) => (
          <option key={value} value={value}>
            Ordenar: {label}
          </option>
        ))}
      </select>

      {loading && <p className="text-sm text-slate-400">Cargando...</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

      {!loading && sorted.length === 0 && (
        <p className="mt-8 text-center text-sm text-slate-500">
          No hay juegos que coincidan con el filtro.
        </p>
      )}

      <div className="flex flex-col gap-2 sm:grid sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onClick={(g) => navigate(`/game/${g.id}`)}
          />
        ))}
      </div>
    </PageContainer>
  )
}
