import { useMemo } from 'react'
import { useGames } from '../hooks/useGames'
import { StatsCard } from '../components/StatsCard'

export function Dashboard() {
  const { games, loading } = useGames()

  const stats = useMemo(() => {
    const completados = games.filter((g) => g.status === 'completado').length
    const jugando = games.filter((g) => g.status === 'jugando').length
    const totalHoras = games.reduce((sum, g) => sum + (g.hours_played ?? 0), 0)
    return { completados, jugando, totalHoras, total: games.length }
  }, [games])

  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-6">
      <h1 className="mb-4 text-xl font-semibold">Dashboard</h1>

      {loading ? (
        <p className="text-sm text-slate-400">Cargando...</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <StatsCard label="Juegos totales" value={stats.total} icon="🎮" />
          <StatsCard label="Completados" value={stats.completados} icon="✅" />
          <StatsCard label="En curso" value={stats.jugando} icon="🕹️" />
          <StatsCard
            label="Horas totales"
            value={`${stats.totalHoras}h`}
            icon="⏱️"
          />
        </div>
      )}
    </div>
  )
}
