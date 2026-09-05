import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGames } from '../hooks/useGames'
import { usePlaySessions } from '../hooks/usePlaySessions'
import { StarRating } from '../components/StarRating'
import { TagList } from '../components/TagList'
import { PageContainer } from '../components/PageContainer'
import type { Game, GameStatus } from '../types/game'

const statuses: GameStatus[] = [
  'pendiente',
  'jugando',
  'completado',
  'abandonado',
  'en_pausa',
]

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function GameDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { games, loading, updateGame, deleteGame } = useGames()
  const game = games.find((g) => g.id === id)
  const { sessions, addSession, deleteSession } = usePlaySessions(game?.id)

  const [form, setForm] = useState<Partial<Game> | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [sessionMinutes, setSessionMinutes] = useState('')
  const [sessionDate, setSessionDate] = useState(todayISO())
  const [sessionError, setSessionError] = useState<string | null>(null)

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

  async function handleAddSession() {
    if (!game) return
    const minutes = Number(sessionMinutes)
    if (!minutes || minutes <= 0) {
      setSessionError('Ingresá una duración válida en minutos')
      return
    }
    setSessionError(null)
    try {
      await addSession(minutes, new Date(sessionDate).toISOString())
      await updateGame(game.id, {
        hours_played: Math.round((game.hours_played + minutes / 60) * 10) / 10,
      })
      setSessionMinutes('')
    } catch (err) {
      setSessionError(err instanceof Error ? err.message : 'Error al guardar la sesión')
    }
  }

  async function handleDeleteSession(sessionId: string, minutes: number) {
    if (!game) return
    await deleteSession(sessionId)
    await updateGame(game.id, {
      hours_played: Math.max(0, Math.round((game.hours_played - minutes / 60) * 10) / 10),
    })
  }

  if (loading) {
    return (
      <PageContainer>
        <p className="text-sm text-slate-400">Cargando...</p>
      </PageContainer>
    )
  }

  if (!game) {
    return (
      <PageContainer>
        <p className="text-sm text-slate-400">No se encontró el juego.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-emerald-400">
          Volver a la biblioteca
        </button>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <button onClick={() => navigate('/')} className="mb-4 text-sm text-emerald-400">
        ← Volver
      </button>

      <div className="mx-auto md:max-w-xl">
        <div className="mb-4 flex gap-3">
          <div className="h-32 w-24 flex-shrink-0 overflow-hidden rounded bg-slate-800 md:h-48 md:w-36">
            {game.cover_url ? (
              <img src={game.cover_url} alt={game.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl">🎮</div>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold">{game.title}</h1>
            <div className="mt-1">
              <TagList value={game.genre} />
            </div>
            <div className="mt-1">
              <TagList value={game.platform} />
            </div>
            {game.first_release_date && (
              <p className="mt-1 text-sm text-slate-500">
                {new Date(game.first_release_date * 1000).getFullYear()}
              </p>
            )}
          </div>
        </div>

        {game.summary && (
          <p className="mb-4 text-sm text-slate-400">{game.summary}</p>
        )}

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
              <label className="mb-1 block text-sm text-slate-400">Fecha inicio</label>
              <input
                type="date"
                value={current?.date_started ?? ''}
                onChange={(e) =>
                  setForm({ ...(form ?? game), date_started: e.target.value || null })
                }
                className="w-full rounded-md bg-slate-900 px-3 py-2 text-slate-100 ring-1 ring-slate-800 focus:outline-none focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">Fecha fin</label>
              <input
                type="date"
                value={current?.date_finished ?? ''}
                onChange={(e) =>
                  setForm({ ...(form ?? game), date_finished: e.target.value || null })
                }
                className="w-full rounded-md bg-slate-900 px-3 py-2 text-slate-100 ring-1 ring-slate-800 focus:outline-none focus:ring-emerald-600"
              />
            </div>
          </div>

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
            <label className="mb-1 block text-sm text-slate-400">Puntaje</label>
            <StarRating
              value={current?.rating ?? null}
              onChange={(rating) => setForm({ ...(form ?? game), rating })}
            />
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

          <div className="border-t border-slate-800 pt-4">
            <h2 className="mb-2 text-sm font-medium text-slate-300">
              Sesiones de juego
            </h2>

            <div className="mb-3 flex flex-col gap-2">
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm text-slate-100 ring-1 ring-slate-800 focus:outline-none focus:ring-emerald-600"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  placeholder="Minutos"
                  value={sessionMinutes}
                  onChange={(e) => setSessionMinutes(e.target.value)}
                  className="min-w-0 flex-1 rounded-md bg-slate-900 px-3 py-2 text-sm text-slate-100 ring-1 ring-slate-800 focus:outline-none focus:ring-emerald-600"
                />
                <button
                  type="button"
                  onClick={handleAddSession}
                  className="flex-shrink-0 rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium"
                >
                  Agregar
                </button>
              </div>
            </div>
            {sessionError && <p className="mb-2 text-sm text-red-400">{sessionError}</p>}

            {sessions.length === 0 ? (
              <p className="text-sm text-slate-500">Todavía no registraste sesiones.</p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {sessions.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between rounded-md bg-slate-900 px-3 py-2 text-sm ring-1 ring-slate-800"
                  >
                    <span className="text-slate-300">
                      {new Date(s.played_at).toLocaleDateString()} — {s.duration_minutes} min
                    </span>
                    <button
                      onClick={() => handleDeleteSession(s.id, s.duration_minutes)}
                      className="text-xs text-red-400"
                    >
                      Eliminar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
