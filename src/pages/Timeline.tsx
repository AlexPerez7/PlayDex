import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useGames } from '../hooks/useGames'
import { PageContainer } from '../components/PageContainer'

interface TimelineEvent {
  date: string
  icon: string
  text: string
  gameId: string
}

interface SessionRow {
  id: string
  duration_minutes: number
  played_at: string
  game_id: string
  games: { title: string } | null
}

export function Timeline() {
  const navigate = useNavigate()
  const { games, loading: loadingGames } = useGames()
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [loadingSessions, setLoadingSessions] = useState(true)

  useEffect(() => {
    supabase
      .from('play_sessions')
      .select('id, duration_minutes, played_at, game_id, games(title)')
      .order('played_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setSessions((data as unknown as SessionRow[]) ?? [])
        setLoadingSessions(false)
      })
  }, [])

  const loading = loadingGames || loadingSessions

  const events: TimelineEvent[] = []

  for (const g of games) {
    events.push({
      date: g.created_at,
      icon: '➕',
      text: `Agregaste ${g.title} a tu biblioteca`,
      gameId: g.id,
    })
    if (g.date_started) {
      events.push({
        date: g.date_started,
        icon: '▶️',
        text: `Empezaste a jugar ${g.title}`,
        gameId: g.id,
      })
    }
    if (g.date_finished) {
      events.push({
        date: g.date_finished,
        icon: '🏁',
        text: `Completaste ${g.title}`,
        gameId: g.id,
      })
    }
  }

  for (const s of sessions) {
    events.push({
      date: s.played_at,
      icon: '⏱️',
      text: `Jugaste ${s.duration_minutes} min de ${s.games?.title ?? 'un juego'}`,
      gameId: s.game_id,
    })
  }

  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <PageContainer>
      <button onClick={() => navigate('/dashboard')} className="mb-4 text-sm text-emerald-400">
        ← Dashboard
      </button>

      <h1 className="mb-4 text-xl font-semibold">Diario</h1>

      {loading && <p className="text-sm text-slate-400">Cargando...</p>}

      {!loading && events.length === 0 && (
        <p className="mt-8 text-center text-sm text-slate-500">
          Todavía no hay actividad registrada.
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {events.map((e, i) => (
          <li key={i}>
            <button
              onClick={() => navigate(`/game/${e.gameId}`)}
              className="flex w-full items-start gap-3 rounded-lg bg-slate-900 p-3 text-left ring-1 ring-slate-800"
            >
              <span className="text-lg">{e.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-100">{e.text}</p>
                <p className="text-xs text-slate-500">
                  {new Date(e.date).toLocaleDateString()}
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </PageContainer>
  )
}
