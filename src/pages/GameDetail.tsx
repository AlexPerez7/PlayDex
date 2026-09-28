import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  BookOpen,
  Calendar,
  AlertCircle,
  Check,
  CheckCircle2,
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
  Loader2,
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
import { BottomSheet } from '../components/BottomSheet'
import { ProgressRing } from '../components/ProgressRing'
import { SectionCard } from '../components/SectionCard'
import { GameDeals } from '../components/GameDeals'
import { GameThumb } from '../components/GameThumb'
import { TimeToBeat } from '../components/TimeToBeat'
import { Skeleton } from '../components/Skeleton'
import { PageContainer } from '../components/PageContainer'
import { statusColors, statusIcons, statusLabels, statuses } from '../lib/status'
import { formatDate, sessionTimestamp, todayISO } from '../lib/dates'
import { useToast } from '../contexts/ToastContext'
import type { Game } from '../types/game'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

/**
 * La portada de IGDB se guarda en `t_cover_big` (264px de ancho), que a todo
 * el ancho del teléfono se ve borrosa. Para el hero se pide la versión 2x.
 */
function heroCover(url: string | null): string | null {
  if (!url || !url.includes('images.igdb.com')) return url
  return url.replace('/t_cover_big/', '/t_cover_big_2x/')
}

/** Espera tras el último cambio antes de guardar (campos de texto, sliders). */
const AUTOSAVE_DELAY = 800

export function GameDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { games, loading, updateGame, deleteGame, refreshGame } = useGames()
  const { showToast, showError } = useToast()
  const game = games.find((g) => g.id === id)
  // Se pasa el id de la URL (no game?.id) para que estas consultas no
  // esperen a que termine de cargar toda la biblioteca antes de arrancar.
  const { sessions, addSession, deleteSession } = usePlaySessions(id)
  const { lists } = useLists()
  const { listIds, toggle: toggleList } = useGameListIds(id)

  // --- Guardado automático ---------------------------------------------
  // `draft` guarda SOLO los campos modificados que todavía no se guardaron.
  // Lo que se ve en pantalla es el juego del contexto con el draft encima.
  const [draft, setDraft] = useState<Partial<Game>>({})
  const draftRef = useRef<Partial<Game>>({})
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const inFlight = useRef<Promise<void> | null>(null)

  const flush = useCallback(async () => {
    clearTimeout(saveTimer.current)
    if (!id) return
    // Serializar: si hay un guardado en curso, esperarlo antes de mandar otro.
    if (inFlight.current) await inFlight.current
    const pending = draftRef.current
    if (Object.keys(pending).length === 0) return

    const run = (async () => {
      setSaveState('saving')
      try {
        await updateGame(id, pending)
        // Quitar del draft solo lo que no volvió a cambiar mientras se guardaba.
        const next = { ...draftRef.current }
        for (const key of Object.keys(pending) as (keyof Game)[]) {
          if (next[key] === pending[key]) delete next[key]
        }
        draftRef.current = next
        setDraft(next)
        setSaveState('saved')
      } catch (err) {
        setSaveState('error')
        showError(err, 'No se pudieron guardar los cambios')
      }
    })()
    inFlight.current = run
    await run
    inFlight.current = null
  }, [id, updateGame, showError])

  const setField = useCallback(
    (changes: Partial<Game>, { immediate = false } = {}) => {
      draftRef.current = { ...draftRef.current, ...changes }
      setDraft(draftRef.current)
      clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(flush, immediate ? 0 : AUTOSAVE_DELAY)
    },
    [flush]
  )

  // Guardar lo pendiente al salir de la pantalla o cuando la app pasa a
  // segundo plano (en mobile el sistema puede matar la PWA sin avisar).
  useEffect(() => {
    function onHide() {
      if (document.visibilityState === 'hidden') flush()
    }
    document.addEventListener('visibilitychange', onHide)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      flush()
    }
  }, [flush])

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

  const current = game ? { ...game, ...draft } : undefined
  const status = current?.status ?? 'pendiente'
  const storyPercent = current?.story_percent ?? 0
  const generalPercent = current?.general_percent ?? 0
  const completionistPercent = current?.completionist_percent ?? 0

  function goBack() {
    // Si se llegó navegando dentro de la app, volver atrás conserva los
    // filtros y el scroll de la pantalla anterior. Si se abrió por link
    // directo no hay historial propio: ir a la biblioteca.
    if (location.key !== 'default') navigate(-1)
    else navigate('/')
  }

  async function handleDelete() {
    if (!game) return
    setMenuOpen(false)
    if (!confirm(`¿Eliminar "${game.title}" de tu biblioteca?`)) return
    try {
      clearTimeout(saveTimer.current)
      draftRef.current = {}
      await deleteGame(game.id)
      showToast(`"${game.title}" se eliminó de tu biblioteca`)
      navigate('/', { replace: true })
    } catch (err) {
      showError(err, 'No se pudo eliminar el juego')
    }
  }

  function toggleFavorite() {
    if (!current) return
    setField({ is_favorite: !current.is_favorite }, { immediate: true })
  }

  function handleStatusChange(newStatus: Game['status']) {
    if (!current) return
    setStatusOpen(false)
    const changes: Partial<Game> = { status: newStatus }
    // Completar las fechas automáticamente: el Diario se arma con ellas.
    if (newStatus === 'jugando' && !current.date_started) {
      changes.date_started = todayISO()
    }
    if (newStatus === 'completado' && !current.date_finished) {
      changes.date_finished = todayISO()
    }
    setField(changes, { immediate: true })
  }

  /** Registra una sesión; las horas las suma un trigger en la DB. */
  async function registerSession(minutes: number, playedAt: string) {
    if (!game) return
    // Mandar antes cualquier edición manual de horas pendiente, para que el
    // trigger sume sobre el valor correcto.
    await flush()
    await addSession(minutes, playedAt)
    await refreshGame(game.id)
  }

  async function handleAddSession() {
    const minutes = Number(sessionMinutes)
    if (!minutes || minutes <= 0) {
      setSessionError('Ingresa una duración válida en minutos')
      return
    }
    setSessionError(null)
    try {
      await registerSession(minutes, sessionTimestamp(sessionDate))
      setSessionMinutes('')
      showToast(`Sesión de ${minutes} min registrada`)
    } catch (err) {
      showError(err, 'Error al guardar la sesión')
    }
  }

  async function handleQuickSession() {
    try {
      await registerSession(30, new Date().toISOString())
      showToast('+30 min sumados')
    } catch (err) {
      showError(err, 'Error al guardar la sesión')
    }
  }

  async function handleDeleteSession(sessionId: string) {
    if (!game) return
    try {
      await flush()
      await deleteSession(sessionId)
      await refreshGame(game.id)
    } catch (err) {
      showError(err, 'No se pudo eliminar la sesión')
    }
  }

  async function handleToggleList(listId: string) {
    try {
      await toggleList(listId)
    } catch (err) {
      showError(err, 'No se pudo actualizar la lista')
    }
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
          src={heroCover(game.cover_url)}
          fallbacks={game.cover_url ? [game.cover_url] : []}
          alt={game.title}
          eager
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

        {/* Botones sobre la portada: respetan el notch / isla dinámica. */}
        <div
          className="absolute inset-x-4 flex items-start justify-between"
          style={{ top: 'calc(1rem + env(safe-area-inset-top))' }}
        >
          <button
            onClick={goBack}
            aria-label="Volver"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-background/70 text-ink backdrop-blur"
          >
            <X size={20} />
          </button>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Más opciones"
              aria-expanded={menuOpen}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-background/70 text-ink backdrop-blur"
            >
              <MoreVertical size={20} />
            </button>
            {menuOpen && (
              <>
                {/* Capa invisible: tocar fuera cierra el menú. */}
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl bg-background-surface p-1 shadow-lg ring-1 ring-primary-dark/30">
                  <button
                    onClick={handleDelete}
                    className="w-full rounded-lg px-3 py-3 text-left text-sm font-medium text-error active:bg-error/10"
                  >
                    Eliminar juego
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <PageContainer belowHero>
        <div className="mx-auto md:max-w-xl">
          <div className="flex items-start justify-between gap-3">
            <h1 className="min-w-0 text-2xl font-bold">{game.title}</h1>
            <SaveIndicator state={saveState} onRetry={flush} />
          </div>
          {game.first_release_date && (
            <p className="mt-0.5 text-sm text-lavender">
              {new Date(game.first_release_date * 1000).getFullYear()}
            </p>
          )}

          <div className="mb-5 mt-3 flex items-center gap-2">
            <button
              onClick={() => setStatusOpen(true)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium ${statusColors[status]}`}
            >
              {statusLabels[status]}
              <ChevronDown size={14} />
            </button>
            <BottomSheet
              open={statusOpen}
              onClose={() => setStatusOpen(false)}
              title="Cambiar estado"
            >
              <div className="flex flex-col gap-1">
                {statuses.map((s) => {
                  const StatusIcon = statusIcons[s]
                  const active = s === status
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleStatusChange(s)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left ${
                        active ? 'bg-accent/10' : 'active:bg-primary-dark/10'
                      }`}
                    >
                      <span
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${statusColors[s]}`}
                      >
                        <StatusIcon size={18} />
                      </span>
                      <span
                        className={`flex-1 text-sm font-medium ${active ? 'text-accent' : 'text-ink'}`}
                      >
                        {statusLabels[s]}
                      </span>
                      {active && <Check size={18} className="text-accent" />}
                    </button>
                  )
                })}
              </div>
            </BottomSheet>
            <button
              onClick={toggleFavorite}
              aria-label={current.is_favorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
              aria-pressed={current.is_favorite}
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ring-1 ring-primary-dark/30 ${
                current.is_favorite ? 'bg-accent text-primary-darker' : 'bg-background-surface text-lavender'
              }`}
            >
              <Heart size={18} fill={current.is_favorite ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={() => notesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              aria-label="Ir a notas y reseña"
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
                  aria-label="Editar progreso"
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
                        onChange={(e) => setField({ [key]: Number(e.target.value) })}
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
                    aria-label="Editar horas"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-dark/20 text-lavender"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={handleQuickSession}
                    title="Sumar 30 min"
                    aria-label="Sumar 30 minutos"
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
                      setField({ hours_played: parsed })
                    }
                  }}
                  onBlur={() => setHoursText(null)}
                  className="mt-2 w-full rounded-md bg-background/40 px-3 py-2 text-sm text-ink ring-1 ring-primary-dark/30 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              )}

              <div className="mt-3">
                <StarRating
                  value={current.rating ?? null}
                  onChange={(rating) => setField({ rating }, { immediate: true })}
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
                onChange={(platform) => setField({ platform })}
              />
            </SectionCard>

            <SectionCard icon={Hourglass} title="Tiempo para terminar">
              <TimeToBeat igdbId={game.igdb_id} title={game.title} />
            </SectionCard>

            <SectionCard icon={Disc} title="Formato">
              <FormatPicker
                value={current.format}
                onChange={(format) => setField({ format })}
              />
            </SectionCard>

            <SectionCard icon={Layers} title="Franquicia">
              <input
                value={current.franchise ?? ''}
                onChange={(e) => setField({ franchise: e.target.value })}
                placeholder="Ej. Final Fantasy"
                className="w-full rounded-md bg-background/40 px-3 py-2 text-sm text-ink ring-1 ring-primary-dark/30 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </SectionCard>

            <SectionCard icon={Repeat} title="Replays">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setField({ replays: Math.max(0, (current.replays ?? 0) - 1) })
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
                  onClick={() => setField({ replays: (current.replays ?? 0) + 1 })}
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
                onChange={(e) => setField({ genre: e.target.value })}
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
                    onChange={(e) => setField({ date_started: e.target.value || null })}
                    className="w-full rounded-md bg-background/40 px-3 py-2 text-sm text-ink ring-1 ring-primary-dark/30 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-lavender">Fecha fin</label>
                  <input
                    type="date"
                    value={current.date_finished ?? ''}
                    onChange={(e) => setField({ date_finished: e.target.value || null })}
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
                      onChange={(e) => setField({ notes: e.target.value })}
                      rows={3}
                      placeholder="Notas de progreso, spoilers, pendientes..."
                      className="w-full rounded-md bg-background/40 px-3 py-2.5 text-sm text-ink ring-1 ring-primary-dark/30 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-lavender">Reseña</label>
                    <textarea
                      value={current.review ?? ''}
                      onChange={(e) => setField({ review: e.target.value })}
                      rows={4}
                      placeholder="Tu opinión sobre el juego..."
                      className="w-full rounded-md bg-background/40 px-3 py-2.5 text-sm text-ink ring-1 ring-primary-dark/30 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </SectionCard>
            </div>

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
                        onClick={() => handleToggleList(list.id)}
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
                        {formatDate(s.played_at)} — {s.duration_minutes} min
                      </span>
                      <button
                        onClick={() => handleDeleteSession(s.id)}
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


function SaveIndicator({ state, onRetry }: { state: SaveState; onRetry: () => void }) {
  if (state === 'idle') return null
  if (state === 'error') {
    return (
      <button
        onClick={onRetry}
        className="mt-1.5 flex flex-shrink-0 items-center gap-1 text-xs font-medium text-error"
      >
        <AlertCircle size={14} /> Reintentar
      </button>
    )
  }
  return (
    <span
      aria-live="polite"
      className="mt-1.5 flex flex-shrink-0 items-center gap-1 text-xs text-lavender"
    >
      {state === 'saving' ? (
        <>
          <Loader2 size={14} className="animate-spin" /> Guardando
        </>
      ) : (
        <>
          <CheckCircle2 size={14} className="text-accent" /> Guardado
        </>
      )}
    </span>
  )
}
