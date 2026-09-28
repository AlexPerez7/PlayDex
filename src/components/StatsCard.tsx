import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  /** Si se pasa, la tarjeta es un link (ej. a la biblioteca filtrada). */
  to?: string
}

export function StatsCard({ label, value, icon: Icon, to }: StatsCardProps) {
  const content = (
    <>
      {Icon && <Icon className="mx-auto text-accent" size={24} />}
      <div className="mt-1 text-2xl font-semibold text-ink">{value}</div>
      <div className="text-xs text-lavender">{label}</div>
    </>
  )
  const className =
    'block rounded-lg bg-background-surface p-4 text-center ring-1 ring-primary-dark/30'

  if (to) {
    return (
      <Link to={to} className={`${className} transition-transform active:scale-[0.98]`}>
        {content}
      </Link>
    )
  }
  return <div className={className}>{content}</div>
}
