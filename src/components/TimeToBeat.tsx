import { useEffect, useState } from 'react'
import { getTimeToBeat } from '../lib/igdb'
import type { TimeToBeat as TimeToBeatData } from '../types/game'
import { Skeleton } from './Skeleton'

/**
 * Duración estimada de un juego, vía el endpoint oficial game_time_to_beats de
 * IGDB. Antes usaba HowLongToBeat (scraping de un endpoint interno), que se
 * rompía cada vez que HLTB cambiaba su sitio.
 */
export function TimeToBeat({
  igdbId,
  title,
}: {
  igdbId: number | null
  title: string
}) {
  const [data, setData] = useState<TimeToBeatData | null | undefined>(undefined)

  useEffect(() => {
    setData(undefined)
    getTimeToBeat({ igdbId, title })
      .then((res) => setData(res))
      .catch(() => setData(null))
  }, [igdbId, title])

  // undefined = cargando, null = sin dato o error -> no mostrar nada
  if (data === undefined) {
    return <Skeleton className="h-14 w-full" />
  }
  if (data === null) return null

  const items = [
    { label: 'Rápido', hours: data.hastilyHours },
    { label: 'Normal', hours: data.normallyHours },
    { label: 'Completista', hours: data.completelyHours },
  ].filter((i) => i.hours != null)

  if (items.length === 0) return null

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {items.map((i) => (
          <div
            key={i.label}
            className="rounded-md bg-background-surface p-2 text-center ring-1 ring-primary-dark/30"
          >
            <p className="text-sm font-medium text-ink">{i.hours}h</p>
            <p className="text-xs text-lavender">{i.label}</p>
          </div>
        ))}
      </div>
      <p className="mt-1 text-xs text-lavender">
        Duración estimada vía IGDB
        {data.count > 0 && ` · ${data.count} registros`}
      </p>
    </div>
  )
}
