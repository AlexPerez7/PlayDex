import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGames } from '../hooks/useGames'
import { GameCard } from '../components/GameCard'
import { GameCardGridSkeleton } from '../components/Skeleton'
import { PageContainer } from '../components/PageContainer'
import { parseTags } from '../lib/tags'
import { statusLabels } from '../lib/status'
import type { GameStatus } from '../types/game'

const statusFilters: Array<GameStatus | 'todos'> = [
  'todos',
  'pendiente',
  'jugando',
  'completado',
  'abandonado',
  'en_pausa',
]

function statusFilterLabel(s: GameStatus | 'todos') {
  return s === 'todos' ? 'Todos' : statusLabels[s]
}

type SortOption = 'recientes' | 'titulo' | 'horas' | 'puntaje'

const sortLabels: Record<SortOption, string> = {
  recientes: 'Recientes',
  titulo: 'Título A-Z',
  horas: 'Más horas',
  puntaje: 'Mejor puntaje',
}

function ChipRow<T extends string>({
  options,
  value,
  onChange,
  labelFor,
}: {
  options: T[]
  value: T
  onChange: (v: T) => void
  labelFor: (v: T) => string
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`whitespace-nowrap rounded-full px-3 py-1 text-xs ${
            value === opt
              ? 'bg-emerald-600 text-slate-950'
              : 'bg-slate-900 text-slate-400 ring-1 ring-slate-800'
          }`}
        >
          {labelFor(opt)}
        </button>
      ))}
    </div>
  )
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

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por título..."
        className="mb-4 w-full rounded-md bg-slate-900 px-3 py-2.5 text-sm text-slate-100 ring-1 ring-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 md:max-w-xs"
      />

      <div className="mb-3">
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
          Estado
        </p>
        <ChipRow
          options={statusFilters}
          value={statusFilter}
          onChange={setStatusFilter}
          labelFor={statusFilterLabel}
        />
      </div>

      {platforms.length > 1 && (
        <div className="mb-3">
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
            Plataforma
          </p>
          <ChipRow
            options={platforms}
            value={platformFilter}
            onChange={setPlatformFilter}
            labelFor={(p) => p}
          />
        </div>
      )}

      <div className="mb-4">
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
          Ordenar
        </p>
        <ChipRow
          options={Object.keys(sortLabels) as SortOption[]}
          value={sortBy}
          onChange={setSortBy}
          labelFor={(s) => sortLabels[s]}
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {loading ? (
        <GameCardGridSkeleton />
      ) : (
        <>
          {sorted.length === 0 && (
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
        </>
      )}
    </PageContainer>
  )
}
