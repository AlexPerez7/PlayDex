import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGames } from '../hooks/useGames'
import { StatsCard } from '../components/StatsCard'
import { PageContainer } from '../components/PageContainer'
import { parseTags } from '../lib/tags'

export function Dashboard() {
  const navigate = useNavigate()
  const { games, loading } = useGames()

  const stats = useMemo(() => {
    const completados = games.filter((g) => g.status === 'completado').length
    const jugando = games.filter((g) => g.status === 'jugando').length
    const totalHoras = games.reduce((sum, g) => sum + (g.hours_played ?? 0), 0)

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
    stats.topGenre && { icon: '🏷️', label: 'Género favorito', value: stats.topGenre },
    stats.topRated && { icon: '⭐', label: 'Mejor puntuado', value: stats.topRated.title },
    stats.mostPlayed && { icon: '🔥', label: 'Más jugado', value: stats.mostPlayed.title },
  ].filter(Boolean) as { icon: string; label: string; value: string }[]

  return (
    <PageContainer>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <button onClick={() => navigate('/timeline')} className="text-sm text-emerald-400">
          Ver diario →
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Cargando...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatsCard label="Juegos totales" value={stats.total} icon="🎮" />
            <StatsCard label="Completados" value={stats.completados} icon="✅" />
            <StatsCard label="En curso" value={stats.jugando} icon="🕹️" />
            <StatsCard
              label="Horas totales"
              value={`${stats.totalHoras}h`}
              icon="⏱️"
            />
          </div>

          {highlights.length > 0 && (
            <div className="mt-4 flex flex-col gap-2">
              {highlights.map((h) => (
                <div
                  key={h.label}
                  className="flex items-center justify-between gap-3 rounded-lg bg-slate-900 p-3 ring-1 ring-slate-800"
                >
                  <span className="flex-shrink-0 text-sm text-slate-400">
                    {h.icon} {h.label}
                  </span>
                  <span className="truncate text-sm font-medium text-slate-100">
                    {h.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </PageContainer>
  )
}
