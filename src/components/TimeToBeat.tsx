import { useEffect, useState } from 'react'
import { BookOpen, Layers, Trophy } from 'lucide-react'
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
    { icon: BookOpen, label: 'Rápido', hours: data.hastilyHours },
    { icon: Layers, label: 'Normal', hours: data.normallyHours },
    { icon: Trophy, label: 'Completista', hours: data.completelyHours },
  ].filter((i) => i.hours != null)

  if (items.length === 0) return null

  return (
    <div>
      <div className="flex flex-col">
        {items.map((i, idx) => (
          <div
            key={i.label}
            className={`flex items-center gap-3 py-2.5 ${
              idx > 0 ? 'border-t border-primary-dark/20' : ''
            }`}
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary-dark/20">
              <i.icon size={16} className="text-lavender" />
            </div>
            <span className="flex-1 text-sm text-ink">{i.label}</span>
            <span className="text-sm font-medium text-ink">{i.hours}h</span>
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
