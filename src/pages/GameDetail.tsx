import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  BookOpen,
  Calendar,
  ChevronDown,
  ClipboardList,
  Clock,
  Disc,
  Gamepad2,
  Heart,
  Hourglass,
  Info,
  Layers,
  ListChecks,
  Minus,
  MoreVertical,
  Pencil,
  Play,
  Plus,
  Repeat,
  ShoppingCart,
  StickyNote,
  Tag,
  Trophy,
  X,
} from 'lucide-react'
import { useGames } from '../hooks/useGames'
import { usePlaySessions } from '../hooks/usePlaySessions'
import { useLists, useGameListIds } from '../hooks/useLists'
import { StarRating } from '../components/StarRating'
import { TagList } from '../components/TagList'
import { PlatformPicker } from '../components/PlatformPicker'
import { FormatPicker } from '../components/FormatPicker'
import { StatusPicker } from '../components/StatusPicker'
import { ProgressRing } from '../components/ProgressRing'
import { SectionCard } from '../components/SectionCard'
import { GameDeals } from '../components/GameDeals'
import { GameThumb } from '../components/GameThumb'
import { TimeToBeat } from '../components/TimeToBeat'
import { Skeleton } from '../components/Skeleton'
import { PageContainer } from '../components/PageContainer'
import { statusColors, statusLabels } from '../lib/status'
import type { Game } from '../types/game'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function GameDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { games, loading, updateGame, deleteGame } = useGames()
  const game = games.find((g) => g.id === id)
  // Se pasa el id de la URL (no game?.id) para que estas consultas no
  // esperen a que termine de cargar toda la biblioteca antes de arrancar.
  const { sessions, addSession, deleteSession } = usePlaySessions(id)
  const { lists } = useLists()
  const { listIds, toggle: toggleList } = useGameListIds(id)

  const [form, setForm] = useState<Partial<Game> | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [sessionMinutes, setSessionMinutes] = useState('')
  const [sessionDate, setSessionDate] = useState(todayISO())
  const [sessionError, setSessionError] = useState<string | null>(null)

  // Texto crudo del input de horas mientras se edita (null = mostrar el valor
  // del modelo). Sin esto, un input controlado de type="number" no deja borrar
  // el 0 ni escribir "7." como paso intermedio hacia "7.5".
  const [hoursText, setHoursText] = useState<string | null>(null)

  const [menuOpen, setMenuOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [editingProgress, setEditingProgress] = useState(false)
  const [editingHours, setEditingHours] = useState(false)
  const [descExpanded, setDescExpanded] = useState(false)
  const notesRef = useRef<HTMLDivElement>(null)

  const current = form ?? game
  const status = current?.status ?? 'pendiente'
  const storyPercent = current?.story_percent ?? 0
  const generalPercent = current?.general_percent ?? 0
  const completionistPercent = current?.completionist_percent ?? 0

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

  async function toggleFavorite() {
    if (!game || !current) return
    const is_favorite = !current.is_favorite
    setForm({ ...current, is_favorite })
    try {
      await updateGame(game.id, { is_favorite })
    } catch {
      setForm({ ...current, is_favorite: !is_favorite })
    }
  }

  async function handleStatusChange(newStatus: Game['status']) {
    if (!game || !current) return
    const previousStatus = status
    setForm({ ...current, status: newStatus })
    setStatusOpen(false)
    try {
      await updateGame(game.id, { status: newStatus })
    } catch {
      setForm({ ...current, status: previousStatus })
    }
  }

  async function handleAddSession() {
    if (!game || !current) return
    const minutes = Number(sessionMinutes)
    if (!minutes || minutes <= 0) {
      setSessionError('Ingresa una duración válida en minutos')
      return
    }
    setSessionError(null)
    try {
      await addSession(minutes, new Date(sessionDate).toISOString())
      const hours_played = Math.round(((current.hours_played ?? 0) + minutes / 60) * 10) / 10
      await updateGame(game.id, { hours_played })
      setForm({ ...current, hours_played })
      setSessionMinutes('')
    } catch (err) {
      setSessionError(err instanceof Error ? err.message : 'Error al guardar la sesión')
    }
  }

  async function handleQuickSession() {
    if (!game || !current) return
    try {
      await addSession(30, new Date().toISOString())
      const hours_played = Math.round(((current.hours_played ?? 0) + 0.5) * 10) / 10
      await updateGame(game.id, { hours_played })
      setForm({ ...current, hours_played })
    } catch (err) {
      setSessionError(err instanceof Error ? err.message : 'Error al guardar la sesión')
    }
  }

  async function handleDeleteSession(sessionId: string, minutes: number) {
    if (!game || !current) return
    await deleteSession(sessionId)
    const hours_played = Math.max(0, Math.round(((current.hours_played ?? 0) - minutes / 60) * 10) / 10)
    await updateGame(game.id, { hours_played })
    setForm({ ...current, hours_played })
  }

  if (loading) {
    return (
      <PageContainer>
        <Skeleton className="mb-4 h-4 w-16" />
        <div className="mb-4 flex gap-3">
          <Skeleton className="h-32 w-24 flex-shrink-0" />
          <div className="min-w-0 flex-1 space-y-2 pt-1">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </PageContainer>
    )
  }

  if (!game || !current) {
    return (
      <PageContainer>
        <p className="text-sm text-lavender">No se encontró el juego.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-accent">
          Volver a la biblioteca
        </button>
      </PageContainer>
    )
  }

  return (
    <>
      <div className="relative h-64 w-full overflow-hidden bg-primary-dark/20 md:h-80">
        <GameThumb
          src={game.cover_url}
          alt={game.title}
          className="h-full w-full object-cover"
          placeholderClassName="text-5xl"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, var(--color-background) 0%, transparent 55%)',
          }}
        />

        <button
          onClick={() => navigate('/')}
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-background/70 text-ink backdrop-blur"
        >
          <X size={20} />
        </button>

        <div className="absolute right-4 top-4">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-background/70 text-ink backdrop-blur"
          >
            <MoreVertical size={20} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded-xl bg-background-surface p-1 shadow-lg ring-1 ring-primary-dark/30">
              <button
                onClick={handleDelete}
                className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-error active:bg-error/10"
              >
                Eliminar juego
              </button>
            </div>
          )}
        </div>
      </div>

      <PageContainer>
        <div className="mx-auto md:max-w-xl">
          <h1 className="text-2xl font-bold">{game.title}</h1>
          {game.first_release_date && (
            <p className="mt-0.5 text-sm text-lavender">
              {new Date(game.first_release_date * 1000).getFullYear()}
            </p>
          )}

          <div className="mb-5 mt-3 flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setStatusOpen((v) => !v)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium ${statusColors[status]}`}
              >
                {statusLabels[status]}
                <ChevronDown size={14} />
              </button>
              {statusOpen && (
                <div className="absolute left-0 top-full z-10 mt-2 w-max rounded-xl bg-background-surface p-2 shadow-lg ring-1 ring-primary-dark/30">
                  <StatusPicker value={status} onChange={handleStatusChange} />
                </div>
              )}
            </div>
            <button
              onClick={toggleFavorite}
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ring-1 ring-primary-dark/30 ${
                current.is_favorite ? 'bg-accent text-primary-darker' : 'bg-background-surface text-lavender'
              }`}
            >
              <Heart size={18} fill={current.is_favorite ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={() => notesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-background-surface text-lavender ring-1 ring-primary-dark/30"
            >
              <StickyNote size={18} />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <SectionCard
              icon={ListChecks}
              title="Progreso"
              action={
                <button
                  onClick={() => setEditingProgress((v) => !v)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-lavender active:bg-primary-dark/20"
                >
                  <Pencil size={14} />
                </button>
              }
            >
              <div className="grid grid-cols-3 gap-2 rounded-xl bg-background/40 p-3">
                <ProgressRing icon={BookOpen} label="Historia" percent={storyPercent} />
                <ProgressRing icon={ListChecks} label="General" percent={generalPercent} />
                <ProgressRing icon={Trophy} label="100%" percent={completionistPercent} />
              </div>

              {editingProgress && (
                <div className="mt-3 flex flex-col gap-3">
                  {(
                    [
                      ['story_percent', 'Historia', storyPercent],
                      ['general_percent', 'General', generalPercent],
                      ['completionist_percent', '100%', completionistPercent],
                    ] as const
                  ).map(([key, label, value]) => (
                    <div key={key}>
                      <div className="mb-1 flex items-center justify-between text-xs text-lavender">
                        <span>{label}</span>
                        <span>{value}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={value}
                        onChange={(e) => setForm({ ...current, [key]: Number(e.target.value) })}
                        className="w-full accent-accent"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between rounded-xl bg-background/40 p-3">
                <div>
                  <p className="text-2xl font-bold text-ink">{current.hours_played}</p>
                  <p className="text-xs text-lavender">horas jugadas</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingHours((v) => !v)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-dark/20 text-lavender"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={handleQuickSession}
                    title="Sumar 30 min"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-dark/20 text-accent"
                  >
                    <Play size={14} fill="currentColor" />
                  </button>
                </div>
              </div>
              {editingHours && (
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.5"
                  value={hoursText ?? String(current.hours_played ?? 0)}
                  onChange={(e) => {
                    const raw = e.target.value
                    setHoursText(raw)
                    const parsed = raw === '' ? 0 : Number(raw)
                    if (!Number.isNaN(parsed)) {
                      setForm({ ...current, hours_played: parsed })
                    }
                  }}
                  onBlur={() => setHoursText(null)}
                  className="mt-2 w-full rounded-md bg-background/40 px-3 py-2 text-sm text-ink ring-1 ring-primary-dark/30 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              )}

              <div className="mt-3">
                <StarRating
                  value={current.rating ?? null}
                  onChange={(rating) => setForm({ ...current, rating })}
                />
              </div>
            </SectionCard>

            {status === 'pendiente' && (
              <SectionCard icon={ShoppingCart} title="Dónde comprarlo">
                <GameDeals title={game.title} steamAppId={game.steam_appid} />
              </SectionCard>
            )}

            <SectionCard icon={Gamepad2} title="Plataforma">
              <PlatformPicker
                value={current.platform}
                onChange={(platform) => setForm({ ...current, platform })}
              />
            </SectionCard>

            <SectionCard icon={Hourglass} title="Tiempo para terminar">
              <TimeToBeat igdbId={game.igdb_id} title={game.title} />
            </SectionCard>

            <SectionCard icon={Disc} title="Formato">
              <FormatPicker
                value={current.format}
                onChange={(format) => setForm({ ...current, format })}
              />
            </SectionCard>

            <SectionCard icon={Layers} title="Franquicia">
              <input
                value={current.franchise ?? ''}
                onChange={(e) => setForm({ ...current, franchise: e.target.value })}
                placeholder="Ej. Final Fantasy"
                className="w-full rounded-md bg-background/40 px-3 py-2 text-sm text-ink ring-1 ring-primary-dark/30 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </SectionCard>

            <SectionCard icon={Repeat} title="Replays">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setForm({ ...current, replays: Math.max(0, (current.replays ?? 0) - 1) })
                  }
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-dark/20 text-lavender"
                >
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center text-lg font-semibold text-ink">
                  {current.replays ?? 0}
                </span>
                <button
                  type="button"
                  onClick={() => setForm({ ...current, replays: (current.replays ?? 0) + 1 })}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-dark/20 text-lavender"
                >
                  <Plus size={14} />
                </button>
              </div>
            </SectionCard>

            <SectionCard icon={Tag} title="Etiquetas">
              <div className="mb-2">
                <TagList value={current.genre} />
              </div>
              <input
                value={current.genre ?? ''}
                onChange={(e) => setForm({ ...current, genre: e.target.value })}
                placeholder="Separa varios con coma"
                className="w-full rounded-md bg-background/40 px-3 py-2 text-sm text-ink ring-1 ring-primary-dark/30 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </SectionCard>

            {game.summary && (
              <SectionCard icon={Info} title="Acerca de">
                <p className={`text-sm text-lavender ${!descExpanded ? 'line-clamp-4' : ''}`}>
                  {game.summary}
                </p>
                <button
                  onClick={() => setDescExpanded((v) => !v)}
                  className="mt-1 text-xs font-medium text-accent"
                >
                  {descExpanded ? 'Leer menos' : 'Leer más'}
                </button>
              </SectionCard>
            )}

            <SectionCard icon={Calendar} title="Fechas">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-lavender">Fecha inicio</label>
                  <input
                    type="date"
                    value={current.date_started ?? ''}
                    onChange={(e) => setForm({ ...current, date_started: e.target.value || null })}
                    className="w-full rounded-md bg-background/40 px-3 py-2 text-sm text-ink ring-1 ring-primary-dark/30 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-lavender">Fecha fin</label>
                  <input
                    type="date"
                    value={current.date_finished ?? ''}
                    onChange={(e) => setForm({ ...current, date_finished: e.target.value || null })}
                    className="w-full rounded-md bg-background/40 px-3 py-2 text-sm text-ink ring-1 ring-primary-dark/30 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </SectionCard>

            <div ref={notesRef}>
              <SectionCard icon={StickyNote} title="Notas y reseña">
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-lavender">Notas</label>
                    <textarea
                      value={current.notes ?? ''}
                      onChange={(e) => setForm({ ...current, notes: e.target.value })}
                      rows={3}
                      placeholder="Notas de progreso, spoilers, pendientes..."
                      className="w-full rounded-md bg-background/40 px-3 py-2.5 text-sm text-ink ring-1 ring-primary-dark/30 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-lavender">Reseña</label>
                    <textarea
                      value={current.review ?? ''}
                      onChange={(e) => setForm({ ...current, review: e.target.value })}
                      rows={4}
                      placeholder="Tu opinión sobre el juego..."
                      className="w-full rounded-md bg-background/40 px-3 py-2.5 text-sm text-ink ring-1 ring-primary-dark/30 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </SectionCard>
            </div>

            {error && <p className="text-sm text-error">{error}</p>}

            <button
              onClick={handleSave}
              disabled={saving || !form}
              className="rounded-md bg-primary py-3 font-medium text-white disabled:opacity-40"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>

            <SectionCard icon={ClipboardList} title="Mis listas">
              {lists.length === 0 ? (
                <p className="text-sm text-lavender">
                  No tienes listas todavía. Crea una desde la pestaña "Listas".
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {lists.map((list) => {
                    const active = listIds.has(list.id)
                    return (
                      <button
                        key={list.id}
                        type="button"
                        onClick={() => toggleList(list.id)}
                        className={`rounded-full px-3 py-1 text-xs ${
                          active
                            ? 'bg-accent text-primary-darker'
                            : 'bg-background/40 text-lavender ring-1 ring-primary-dark/30'
                        }`}
                      >
                        {active ? '✓ ' : '+ '}
                        {list.name}
                      </button>
                    )
                  })}
                </div>
              )}
            </SectionCard>

            <SectionCard icon={Clock} title="Sesiones de juego">
              <div className="mb-3 flex flex-col gap-2">
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full rounded-md bg-background/40 px-3 py-2 text-sm text-ink ring-1 ring-primary-dark/30 focus:outline-none focus:ring-primary"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={1}
                    placeholder="Minutos"
                    value={sessionMinutes}
                    onChange={(e) => setSessionMinutes(e.target.value)}
                    className="min-w-0 flex-1 rounded-md bg-background/40 px-3 py-2 text-sm text-ink ring-1 ring-primary-dark/30 focus:outline-none focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={handleAddSession}
                    className="flex-shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
                  >
                    Agregar
                  </button>
                </div>
              </div>
              {sessionError && <p className="mb-2 text-sm text-error">{sessionError}</p>}

              {sessions.length === 0 ? (
                <p className="text-sm text-lavender">Todavía no registraste sesiones.</p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {sessions.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center justify-between rounded-md bg-background/40 px-3 py-2 text-sm ring-1 ring-primary-dark/30"
                    >
                      <span className="text-lavender">
                        {new Date(s.played_at).toLocaleDateString()} — {s.duration_minutes} min
                      </span>
                      <button
                        onClick={() => handleDeleteSession(s.id, s.duration_minutes)}
                        className="text-xs text-error"
                      >
                        Eliminar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </div>
        </div>
      </PageContainer>
    </>
  )
}
