import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  Flame,
  Gamepad2,
  Joystick,
  LogOut,
  Star,
  Tag,
  Timer,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { useGames } from '../hooks/useGames'
import { StatsCard } from '../components/StatsCard'
import { StatsCardSkeleton } from '../components/Skeleton'
import { PageContainer } from '../components/PageContainer'
import { parseTags } from '../lib/tags'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../contexts/ToastContext'

export function Dashboard() {
  const navigate = useNavigate()
  const { games, loading } = useGames()

  const stats = useMemo(() => {
    const completados = games.filter((g) => g.status === 'completado').length
    const jugando = games.filter((g) => g.status === 'jugando').length
    // Redondeo a 1 decimal: la suma de numerics como float deja cosas como 12.300000000000001.
    const totalHoras =
      Math.round(games.reduce((sum, g) => sum + Number(g.hours_played ?? 0), 0) * 10) / 10

    const genreCounts = new Map<string, number>()
    for (const g of games) {
      for (const genre of parseTags(g.genre)) {
        genreCounts.set(genre, (genreCounts.get(genre) ?? 0) + 1)
      }
    }
    const topGenre = [...genreCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]

    const topRated = games
      .filter((g) => g.rating != null)
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))[0]

    const mostPlayed = games
      .filter((g) => g.hours_played > 0)
      .sort((a, b) => b.hours_played - a.hours_played)[0]

    return {
      completados,
      jugando,
      totalHoras,
      total: games.length,
      topGenre,
      topRated,
      mostPlayed,
    }
  }, [games])

  const highlights = [
    stats.topGenre && { icon: Tag, label: 'Género favorito', value: stats.topGenre },
    stats.topRated && { icon: Star, label: 'Mejor puntuado', value: stats.topRated.title },
    stats.mostPlayed && { icon: Flame, label: 'Más jugado', value: stats.mostPlayed.title },
  ].filter(Boolean) as { icon: LucideIcon; label: string; value: string }[]

  return (
    <PageContainer>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <button onClick={() => navigate('/timeline')} className="text-sm text-accent">
          Ver diario →
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatsCard label="Juegos totales" value={stats.total} icon={Gamepad2} />
            <StatsCard label="Completados" value={stats.completados} icon={CheckCircle2} />
            <StatsCard label="En curso" value={stats.jugando} icon={Joystick} />
            <StatsCard
              label="Horas totales"
              value={`${stats.totalHoras}h`}
              icon={Timer}
            />
          </div>

          {highlights.length > 0 && (
            <div className="mt-4 flex flex-col gap-2">
              {highlights.map((h) => (
                <div
                  key={h.label}
                  className="flex items-center justify-between gap-3 rounded-lg bg-background-surface p-3 ring-1 ring-primary-dark/30"
                >
                  <span className="flex flex-shrink-0 items-center gap-1.5 text-sm text-lavender">
                    <h.icon size={16} /> {h.label}
                  </span>
                  <span className="truncate text-sm font-medium text-ink">
                    {h.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <AccountCard />
    </PageContainer>
  )
}

function AccountCard() {
  const { session, signOut } = useAuth()
  const { showError } = useToast()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    if (!confirm('¿Cerrar sesión en este dispositivo?')) return
    setSigningOut(true)
    const { error } = await signOut()
    if (error) {
      showError(error, 'No se pudo cerrar la sesión')
      setSigningOut(false)
    }
  }

  return (
    <div className="mt-8 rounded-lg bg-background-surface p-3 ring-1 ring-primary-dark/30">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-dark/30 text-lavender">
          <UserRound size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-lavender">Sesión iniciada como</p>
          <p className="truncate text-sm text-ink">{session?.user.email ?? '—'}</p>
        </div>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex min-h-11 flex-shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-error active:bg-error/10 disabled:opacity-50"
        >
          <LogOut size={16} />
          {signingOut ? 'Saliendo...' : 'Salir'}
        </button>
      </div>
    </div>
  )
}
