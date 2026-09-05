import { useNavigate } from 'react-router-dom'
import { GameForm } from '../components/GameForm'
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
    <div className="mx-auto max-w-md px-4 pb-24 pt-6">
      <h1 className="mb-4 text-xl font-semibold">Agregar juego</h1>
      <GameForm onSubmit={handleSubmit} />
    </div>
  )
}
