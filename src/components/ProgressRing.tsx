import type { LucideIcon } from 'lucide-react'

interface ProgressRingProps {
  icon: LucideIcon
  label: string
  percent: number
  size?: number
}

const STROKE = 5

export function ProgressRing({ icon: Icon, label, percent, size = 72 }: ProgressRingProps) {
  const radius = (size - STROKE) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, percent))
  const offset = circumference * (1 - clamped / 100)

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={STROKE}
            className="stroke-primary-dark/30"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="stroke-accent transition-[stroke-dashoffset]"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <Icon size={14} className="text-lavender" />
          <span className="text-xs font-semibold text-ink">{clamped}%</span>
        </div>
      </div>
      <span className="text-xs text-lavender">{label}</span>
    </div>
  )
}
