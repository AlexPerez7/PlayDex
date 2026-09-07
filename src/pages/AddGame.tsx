import { useNavigate } from 'react-router-dom'
import { GameForm } from '../components/GameForm'
import { PageContainer } from '../components/PageContainer'
import { useGames } from '../hooks/useGames'
import type { NewGame } from '../types/game'

export function AddGame() {
  const { games, addGame } = useGames()
  const navigate = useNavigate()

  const existingIgdbIds = new Set(
    games.map((g) => g.igdb_id).filter((id): id is number => id != null)
  )

  async function handleSubmit(game: NewGame) {
    await addGame(game)
    navigate('/')
  }

  return (
    <PageContainer>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Agregar juego</h1>
        <button onClick={() => navigate('/steam-import')} className="text-sm text-emerald-400">
          Importar de Steam →
        </button>
      </div>
      <div className="md:mx-auto md:max-w-md">
        <GameForm onSubmit={handleSubmit} existingIgdbIds={existingIgdbIds} />
      </div>
    </PageContainer>
  )
}
