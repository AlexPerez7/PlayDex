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
      <h1 className="mb-4 text-xl font-semibold">Agregar juego</h1>
      <div className="md:mx-auto md:max-w-md">
        <GameForm onSubmit={handleSubmit} existingIgdbIds={existingIgdbIds} />
      </div>
    </PageContainer>
  )
}
