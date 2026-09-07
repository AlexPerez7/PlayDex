import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface SectionCardProps {
  icon: LucideIcon
  title: string
  action?: ReactNode
  children: ReactNode
}

export function SectionCard({ icon: Icon, title, action, children }: SectionCardProps) {
  return (
    <div className="rounded-2xl bg-background-surface p-4 ring-1 ring-primary-dark/20">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-lavender" />
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}
