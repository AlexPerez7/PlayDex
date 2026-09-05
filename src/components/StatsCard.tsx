interface StatsCardProps {
  label: string
  value: string | number
  icon?: string
}

export function StatsCard({ label, value, icon }: StatsCardProps) {
  return (
    <div className="rounded-lg bg-slate-900 p-4 text-center ring-1 ring-slate-800">
      {icon && <div className="text-2xl">{icon}</div>}
      <div className="mt-1 text-2xl font-semibold text-slate-100">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  )
}
