import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSteamLibrary, steamGameToNewGame, type SteamGame } from '../lib/steam'
import { useGames } from '../hooks/useGames'
import { PageContainer } from '../components/PageContainer'
import { PopularCardSkeleton } from '../components/Skeleton'

export function SteamImport() {
  const navigate = useNavigate()
  const { games, addGame } = useGames()
  const [library, setLibrary] = useState<SteamGame[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addingAppId, setAddingAppId] = useState<number | null>(null)

  useEffect(() => {
    getSteamLibrary()
      .then(setLibrary)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Error cargando tu biblioteca de Steam')
      )
      .finally(() => setLoading(false))
  }, [])

  const importedAppIds = new Set(
    games.map((g) => g.steam_appid).filter((id): id is number => id != null)
  )

  async function handleImport(game: SteamGame) {
    setAddingAppId(game.appid)
    try {
      await addGame(steamGameToNewGame(game))
    } finally {
      setAddingAppId(null)
    }
  }

  return (
    <PageContainer>
      <button onClick={() => navigate('/add')} className="mb-4 text-sm text-emerald-400">
        ← Volver
      </button>

      <h1 className="mb-1 text-xl font-semibold">Importar de Steam</h1>
      <p className="mb-4 text-sm text-slate-400">
        Se importa el título, la portada y las horas jugadas reales.
      </p>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {loading &&
          Array.from({ length: 6 }).map((_, i) => <PopularCardSkeleton key={i} />)}

        {!loading &&
          library.map((game) => {
            const imported = importedAppIds.has(game.appid)
            return (
              <div
                key={game.appid}
                className="flex items-center gap-3 rounded-lg bg-slate-900 p-2 ring-1 ring-slate-800"
              >
                <img
                  src={game.cover_url}
                  alt={game.name}
                  loading="lazy"
                  className="h-12 w-24 flex-shrink-0 rounded object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-100">
                    {game.name}
                  </p>
                  <p className="text-xs text-slate-500">{game.hours_played}h jugadas</p>
                </div>
                <button
                  onClick={() => handleImport(game)}
                  disabled={imported || addingAppId === game.appid}
                  className="flex-shrink-0 rounded-md bg-emerald-700 px-2.5 py-1.5 text-xs font-medium disabled:opacity-40"
                >
                  {imported
                    ? 'Importado'
                    : addingAppId === game.appid
                      ? '...'
                      : '+ Agregar'}
                </button>
              </div>
            )
          })}
      </div>
    </PageContainer>
  )
}
