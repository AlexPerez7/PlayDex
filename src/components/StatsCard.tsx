import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
}

export function StatsCard({ label, value, icon: Icon }: StatsCardProps) {
  return (
    <div className="rounded-lg bg-background-surface p-4 text-center ring-1 ring-primary-dark/30">
      {Icon && <Icon className="mx-auto text-accent" size={24} />}
      <div className="mt-1 text-2xl font-semibold text-ink">{value}</div>
      <div className="text-xs text-lavender">{label}</div>
    </div>
  )
}
