import { useEffect, useState } from 'react'
import { searchHltb, type HltbResult } from '../lib/hltb'
import { Skeleton } from './Skeleton'

export function HowLongToBeat({ title }: { title: string }) {
  const [result, setResult] = useState<HltbResult | null | undefined>(undefined)

  useEffect(() => {
    setResult(undefined)
    searchHltb(title)
      .then((results) => {
        const exact = results.find(
          (r) => r.name.trim().toLowerCase() === title.trim().toLowerCase()
        )
        setResult(exact ?? results[0] ?? null)
      })
      .catch(() => setResult(null))
  }, [title])

  // undefined = cargando, null = sin resultado o error -> no mostrar nada
  if (result === undefined) {
    return <Skeleton className="h-14 w-full" />
  }
  if (result === null) return null

  const items = [
    { label: 'Historia principal', hours: result.mainHours },
    { label: 'Principal + extras', hours: result.mainExtraHours },
    { label: 'Completista', hours: result.completionistHours },
  ].filter((i) => i.hours != null)

  if (items.length === 0) return null

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((i) => (
        <div
          key={i.label}
          className="rounded-md bg-slate-900 p-2 text-center ring-1 ring-slate-800"
        >
          <p className="text-sm font-medium text-slate-100">{i.hours}h</p>
          <p className="text-xs text-slate-500">{i.label}</p>
        </div>
      ))}
    </div>
  )
}
