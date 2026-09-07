import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
}

export function StatsCard({ label, value, icon: Icon }: StatsCardProps) {
  return (
    <div className="rounded-lg bg-slate-900 p-4 text-center ring-1 ring-slate-800">
      {Icon && <Icon className="mx-auto text-emerald-400" size={24} />}
      <div className="mt-1 text-2xl font-semibold text-slate-100">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  )
}
