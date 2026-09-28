import { useEffect, useState } from 'react'
import { getGameDeals, type GameDeal } from '../lib/deals'
import { ShoppingCart } from 'lucide-react'
import { Skeleton } from './Skeleton'
import { SectionCard } from './SectionCard'

export function GameDeals({
  title,
  steamAppId,
}: {
  title: string
  steamAppId?: number | null
}) {
  const [deals, setDeals] = useState<GameDeal[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getGameDeals(title, steamAppId)
      .then(setDeals)
      .catch(() => setDeals([]))
      .finally(() => setLoading(false))
  }, [title, steamAppId])

  if (loading) {
    return (
      <SectionCard icon={ShoppingCart} title="Dónde comprarlo">
        <div className="space-y-2">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      </SectionCard>
    )
  }

  // Si no hay ofertas (juego de consola, no listado en tiendas de PC, etc.)
  // no mostramos nada en vez de un estado de error confuso.
  if (!deals || deals.length === 0) return null

  return (
    <SectionCard icon={ShoppingCart} title="Dónde comprarlo">
      <div className="flex flex-col gap-1.5">
        {deals.slice(0, 3).map((d) => (
          <a
            key={d.store}
            href={d.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center justify-between rounded-xl bg-background/40 px-3 text-sm ring-1 ring-primary-dark/30 active:bg-primary-dark/20"
          >
            <span className="text-lavender">{d.store}</span>
            <span className="flex items-center gap-2">
              {d.savingsPercent > 0 && (
                <span className="rounded-full bg-accent px-1.5 py-0.5 text-xs text-primary-darker">
                  -{d.savingsPercent}%
                </span>
              )}
              {d.savingsPercent > 0 && (
                <span className="text-xs text-lavender line-through">
                  ${d.normalPrice.toFixed(2)}
                </span>
              )}
              <span className="font-medium text-ink">${d.salePrice.toFixed(2)}</span>
            </span>
          </a>
        ))}
        <p className="text-xs text-lavender">Precios en USD, tiendas de PC vía CheapShark</p>
      </div>
    </SectionCard>
  )
}
