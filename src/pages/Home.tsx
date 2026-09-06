import { useEffect, useRef, useState } from 'react'
import { getPopularGames, igdbResultToNewGame } from '../lib/igdb'
import { useGames } from '../hooks/useGames'
import { PageContainer } from '../components/PageContainer'
import { TagList } from '../components/TagList'
import { PopularCardSkeleton } from '../components/Skeleton'
import type { IgdbSearchResult } from '../types/game'

const PULL_THRESHOLD = 60

export function Home() {
  const { games, addGame } = useGames()
  const [popular, setPopular] = useState<IgdbSearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addingId, setAddingId] = useState<number | null>(null)

  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const pullDistanceRef = useRef(0)

  async function loadPopular() {
    try {
      const data = await getPopularGames()
      setPopular(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando populares')
    }
  }

  useEffect(() => {
    loadPopular().finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let startY = 0
    let tracking = false

    function onTouchStart(e: TouchEvent) {
      if (window.scrollY === 0 && !refreshing) {
        startY = e.touches[0].clientY
        tracking = true
      }
    }

    function onTouchMove(e: TouchEvent) {
      if (!tracking) return
      const delta = e.touches[0].clientY - startY
      if (delta > 0) {
        const clamped = Math.min(delta, 100)
        pullDistanceRef.current = clamped
        setPullDistance(clamped)
      }
    }

    async function onTouchEnd() {
      if (!tracking) return
      tracking = false
      if (pullDistanceRef.current > PULL_THRESHOLD) {
        setRefreshing(true)
        await loadPopular()
        setRefreshing(false)
      }
      pullDistanceRef.current = 0
      setPullDistance(0)
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [refreshing])

  const ownedIgdbIds = new Set(
    games.map((g) => g.igdb_id).filter((id): id is number => id != null)
  )

  async function handleQuickAdd(result: IgdbSearchResult) {
    setAddingId(result.id)
    try {
      await addGame(igdbResultToNewGame(result))
    } finally {
      setAddingId(null)
    }
  }

  return (
    <PageContainer>
      <div
        className="flex items-center justify-center overflow-hidden text-xs text-slate-500 transition-[height]"
        style={{ height: refreshing ? 32 : pullDistance * 0.4 }}
      >
        {refreshing
          ? 'Actualizando...'
          : pullDistance > PULL_THRESHOLD
            ? 'Suelta para actualizar'
            : pullDistance > 0
              ? '↓'
              : ''}
      </div>

      <h1 className="mb-1 text-xl font-semibold">Inicio</h1>
      <p className="mb-4 text-sm text-slate-400">
        Juegos con más repercusión salidos en los últimos 2 años
      </p>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {loading &&
          Array.from({ length: 8 }).map((_, i) => <PopularCardSkeleton key={i} />)}
        {!loading && popular.map((result) => {
          const alreadyOwned = ownedIgdbIds.has(result.id)
          return (
            <div
              key={result.id}
              className="flex flex-col overflow-hidden rounded-lg bg-slate-900 ring-1 ring-slate-800"
            >
              <div className="aspect-[3/4] w-full bg-slate-800">
                {result.cover_url ? (
                  <img
                    src={result.cover_url}
                    alt={result.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl">
                    🎮
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1.5 p-2.5">
                <p className="line-clamp-2 text-sm font-medium text-slate-100">
                  {result.name}
                </p>
                <TagList value={result.genres.slice(0, 2).join(', ')} />
                <button
                  onClick={() => handleQuickAdd(result)}
                  disabled={alreadyOwned || addingId === result.id}
                  className="mt-auto rounded-md bg-emerald-700 py-1.5 text-xs font-medium disabled:opacity-40"
                >
                  {alreadyOwned
                    ? 'En tu biblioteca'
                    : addingId === result.id
                      ? 'Agregando...'
                      : '+ Agregar'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </PageContainer>
  )
}
