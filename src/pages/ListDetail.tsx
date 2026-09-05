import { useNavigate, useParams } from 'react-router-dom'
import { useLists, useListGameIds } from '../hooks/useLists'
import { useGames } from '../hooks/useGames'
import { GameCard } from '../components/GameCard'
import { PageContainer } from '../components/PageContainer'

export function ListDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { lists } = useLists()
  const { gameIds, loading, removeGame } = useListGameIds(id)
  const { games } = useGames()

  const list = lists.find((l) => l.id === id)
  const listGames = gameIds
    .map((gameId) => games.find((g) => g.id === gameId))
    .filter((g): g is NonNullable<typeof g> => g != null)

  return (
    <PageContainer>
      <button onClick={() => navigate('/lists')} className="mb-4 text-sm text-emerald-400">
        ← Mis listas
      </button>

      <h1 className="mb-4 text-xl font-semibold">{list?.name ?? 'Lista'}</h1>

      {loading && <p className="text-sm text-slate-400">Cargando...</p>}

      {!loading && listGames.length === 0 && (
        <p className="mt-8 text-center text-sm text-slate-500">
          Esta lista todavía no tiene juegos. Agregalos desde el detalle de cada juego.
        </p>
      )}

      <div className="flex flex-col gap-2 sm:grid sm:grid-cols-2 lg:grid-cols-3">
        {listGames.map((game) => (
          <div key={game.id} className="flex flex-col gap-1">
            <GameCard game={game} onClick={(g) => navigate(`/game/${g.id}`)} />
            <button
              onClick={() => removeGame(game.id)}
              className="self-end text-xs text-red-400"
            >
              Quitar de la lista
            </button>
          </div>
        ))}
      </div>
    </PageContainer>
  )
}
