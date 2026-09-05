import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGames } from '../hooks/useGames'
import type { Game, GameStatus } from '../types/game'

const statuses: GameStatus[] = [
  'pendiente',
  'jugando',
  'completado',
  'abandonado',
  'en_pausa',
]

export function GameDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { games, loading, updateGame, deleteGame } = useGames()
  const game = games.find((g) => g.id === id)

  const [form, setForm] = useState<Partial<Game> | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const current = form ?? game

  async function handleSave() {
    if (!game || !form) return
    setSaving(true)
    setError(null)
    try {
      await updateGame(game.id, form)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!game) return
    if (!confirm(`¿Eliminar "${game.title}" de tu biblioteca?`)) return
    await deleteGame(game.id)
    navigate('/')
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-md px-4 pb-24 pt-6">
        <p className="text-sm text-slate-400">Cargando...</p>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="mx-auto max-w-md px-4 pb-24 pt-6">
        <p className="text-sm text-slate-400">No se encontró el juego.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-emerald-400">
          Volver a la biblioteca
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-6">
      <button onClick={() => navigate('/')} className="mb-4 text-sm text-emerald-400">
        ← Volver
      </button>

      <div className="mb-4 flex gap-3">
        <div className="h-32 w-24 flex-shrink-0 overflow-hidden rounded bg-slate-800">
          {game.cover_url ? (
            <img src={game.cover_url} alt={game.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl">🎮</div>
          )}
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-semibold">{game.title}</h1>
          {game.genre && <p className="text-sm text-slate-400">{game.genre}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm text-slate-400">Plataforma</label>
            <input
              value={current?.platform ?? ''}
              onChange={(e) => setForm({ ...(form ?? game), platform: e.target.value })}
              className="w-full rounded-md bg-slate-900 px-3 py-2 text-slate-100 ring-1 ring-slate-800 focus:outline-none focus:ring-emerald-600"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Estado</label>
            <select
              value={current?.status}
              onChange={(e) =>
                setForm({ ...(form ?? game), status: e.target.value as GameStatus })
              }
              className="w-full rounded-md bg-slate-900 px-3 py-2 text-slate-100 ring-1 ring-slate-800 focus:outline-none focus:ring-emerald-600"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm text-slate-400">Horas jugadas</label>
            <input
              type="number"
              min={0}
              step="0.5"
              value={current?.hours_played ?? 0}
              onChange={(e) =>
                setForm({ ...(form ?? game), hours_played: Number(e.target.value) })
              }
              className="w-full rounded-md bg-slate-900 px-3 py-2 text-slate-100 ring-1 ring-slate-800 focus:outline-none focus:ring-emerald-600"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Puntaje (1-10)</label>
            <input
              type="number"
              min={1}
              max={10}
              value={current?.rating ?? ''}
              onChange={(e) =>
                setForm({
                  ...(form ?? game),
                  rating: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="w-full rounded-md bg-slate-900 px-3 py-2 text-slate-100 ring-1 ring-slate-800 focus:outline-none focus:ring-emerald-600"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-400">Notas</label>
          <textarea
            value={current?.notes ?? ''}
            onChange={(e) => setForm({ ...(form ?? game), notes: e.target.value })}
            rows={3}
            className="w-full rounded-md bg-slate-900 px-3 py-2 text-slate-100 ring-1 ring-slate-800 focus:outline-none focus:ring-emerald-600"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !form}
            className="flex-1 rounded-md bg-emerald-600 py-2.5 font-medium text-slate-950 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <button
            onClick={handleDelete}
            className="rounded-md bg-red-900 px-4 py-2.5 text-sm font-medium text-red-100"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
