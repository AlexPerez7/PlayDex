import { useNavigate } from 'react-router-dom'
import { GameForm } from '../components/GameForm'
import { PageContainer } from '../components/PageContainer'
import { useGames } from '../hooks/useGames'
import type { NewGame } from '../types/game'

export function AddGame() {
  const { addGame } = useGames()
  const navigate = useNavigate()

  async function handleSubmit(game: NewGame) {
    await addGame(game)
    navigate('/')
  }

  return (
    <PageContainer>
      <h1 className="mb-4 text-xl font-semibold">Agregar juego</h1>
      <div className="md:mx-auto md:max-w-md">
        <GameForm onSubmit={handleSubmit} />
      </div>
    </PageContainer>
  )
}
