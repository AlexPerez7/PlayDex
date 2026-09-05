import { useEffect, useState } from 'react'
import { getPopularGames, igdbResultToNewGame } from '../lib/igdb'
import { useGames } from '../hooks/useGames'
import { PageContainer } from '../components/PageContainer'
import { TagList } from '../components/TagList'
import type { IgdbSearchResult } from '../types/game'

export function Home() {
  const { games, addGame } = useGames()
  const [popular, setPopular] = useState<IgdbSearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addingId, setAddingId] = useState<number | null>(null)

  useEffect(() => {
    getPopularGames()
      .then(setPopular)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Error cargando populares')
      )
      .finally(() => setLoading(false))
  }, [])

  const ownedIgdbIds = new Set(games.map((g) => g.igdb_id).filter(Boolean))

  async function handleQuickAdd(result: IgdbSearchResult) {
    setAddingId(result.id)
    try {
      await addGame(igdbResultToNewGame(result))
    } finally {
      setAddingId(null)
    }
  }

  return (
    <PageContainer>
      <h1 className="mb-1 text-xl font-semibold">Inicio</h1>
      <p className="mb-4 text-sm text-slate-400">
        Juegos con más repercusión salidos en los últimos 2 años
      </p>

      {loading && <p className="text-sm text-slate-400">Cargando...</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {popular.map((result) => {
          const alreadyOwned = ownedIgdbIds.has(result.id)
          return (
            <div
              key={result.id}
              className="flex flex-col overflow-hidden rounded-lg bg-slate-900 ring-1 ring-slate-800"
            >
              <div className="aspect-[3/4] w-full bg-slate-800">
                {result.cover_url ? (
                  <img
                    src={result.cover_url}
                    alt={result.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl">
                    🎮
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1.5 p-2.5">
                <p className="line-clamp-2 text-sm font-medium text-slate-100">
                  {result.name}
                </p>
                <TagList value={result.genres.slice(0, 2).join(', ')} />
                <button
                  onClick={() => handleQuickAdd(result)}
                  disabled={alreadyOwned || addingId === result.id}
                  className="mt-auto rounded-md bg-emerald-700 py-1.5 text-xs font-medium disabled:opacity-40"
                >
                  {alreadyOwned
                    ? 'En tu biblioteca'
                    : addingId === result.id
                      ? 'Agregando...'
                      : '+ Agregar'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </PageContainer>
  )
}
