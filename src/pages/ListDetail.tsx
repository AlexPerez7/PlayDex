import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, X } from 'lucide-react'
import { useLists, useListGameIds } from '../hooks/useLists'
import { useGames } from '../hooks/useGames'
import { GameCard } from '../components/GameCard'
import { GameCardGridSkeleton } from '../components/Skeleton'
import { PageContainer } from '../components/PageContainer'
import { useToast } from '../contexts/ToastContext'
import type { Game } from '../types/game'

export function ListDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { lists } = useLists()
  const { gameIds, loading, removeGame, restoreGame } = useListGameIds(id)
  const { games } = useGames()
  const { showToast, showError } = useToast()

  const list = lists.find((l) => l.id === id)
  const listGames = useMemo(() => {
    const byId = new Map(games.map((g) => [g.id, g]))
    return gameIds.map((gameId) => byId.get(gameId)).filter((g): g is Game => g != null)
  }, [games, gameIds])

  async function handleRemove(game: Game) {
    const index = gameIds.indexOf(game.id)
    try {
      await removeGame(game.id)
      showToast(`${game.title} se quitó de la lista`, {
        duration: 5000,
        action: {
          label: 'Deshacer',
          onClick: () =>
            restoreGame(game.id, index).catch((err) =>
              showError(err, 'No se pudo volver a agregar')
            ),
        },
      })
    } catch (err) {
      showError(err, 'No se pudo quitar el juego')
    }
  }

  return (
    <PageContainer>
      <button
        onClick={() => navigate('/lists')}
        className="-ml-2 mb-2 flex min-h-11 items-center gap-1 rounded-full px-2 text-sm text-accent active:bg-primary-dark/20"
      >
        <ArrowLeft size={16} /> Mis listas
      </button>

      <div className="mb-4 flex items-baseline justify-between gap-2">
        <h1 className="min-w-0 truncate text-xl font-semibold">{list?.name ?? 'Lista'}</h1>
        {!loading && <span className="text-sm text-lavender">{listGames.length} juegos</span>}
      </div>

      {loading && <GameCardGridSkeleton count={3} />}

      {!loading && listGames.length === 0 && (
        <p className="mt-8 text-center text-sm text-lavender">
          Esta lista todavía no tiene juegos. Agrégalos desde el detalle de cada juego, en la
          sección "Mis listas".
        </p>
      )}

      <div className="flex flex-col gap-2 sm:grid sm:grid-cols-2 lg:grid-cols-3">
        {listGames.map((game) => (
          <div key={game.id} className="relative">
            <GameCard
              game={game}
              onClick={(g) => navigate(`/game/${g.id}`)}
              className="pr-11"
            />
            <button
              onClick={() => handleRemove(game)}
              aria-label={`Quitar ${game.title} de la lista`}
              className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-full text-lavender active:bg-error/10 active:text-error"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </PageContainer>
  )
}
