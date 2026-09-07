import { useEffect, useState } from 'react'
import { getGameDeals, type GameDeal } from '../lib/deals'
import { Skeleton } from './Skeleton'

export function GameDeals({ title }: { title: string }) {
  const [deals, setDeals] = useState<GameDeal[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getGameDeals(title)
      .then(setDeals)
      .catch(() => setDeals([]))
      .finally(() => setLoading(false))
  }, [title])

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  // Si no hay ofertas (juego de consola, no listado en tiendas de PC, etc.)
  // no mostramos nada en vez de un estado de error confuso.
  if (!deals || deals.length === 0) return null

  return (
    <div className="flex flex-col gap-1.5">
      {deals.slice(0, 3).map((d) => (
        <a
          key={d.store}
          href={d.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-md bg-slate-900 px-3 py-2 text-sm ring-1 ring-slate-800 active:bg-slate-800"
        >
          <span className="text-slate-300">{d.store}</span>
          <span className="flex items-center gap-2">
            {d.savingsPercent > 0 && (
              <span className="rounded-full bg-emerald-700 px-1.5 py-0.5 text-xs text-emerald-100">
                -{d.savingsPercent}%
              </span>
            )}
            {d.savingsPercent > 0 && (
              <span className="text-xs text-slate-500 line-through">
                ${d.normalPrice.toFixed(2)}
              </span>
            )}
            <span className="font-medium text-slate-100">${d.salePrice.toFixed(2)}</span>
          </span>
        </a>
      ))}
      <p className="text-xs text-slate-500">Precios en USD, tiendas de PC vía CheapShark</p>
    </div>
  )
}
