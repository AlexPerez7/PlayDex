import { statuses, statusLabels, statusColors } from '../lib/status'
import type { GameStatus } from '../types/game'

interface StatusPickerProps {
  value: GameStatus
  onChange: (value: GameStatus) => void
}

export function StatusPicker({ value, onChange }: StatusPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((s) => {
        const active = s === value
        return (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={`rounded-full px-3 py-1.5 text-sm transition-opacity ${
              active
                ? statusColors[s]
                : 'bg-background-surface text-lavender ring-1 ring-primary-dark/30'
            }`}
          >
            {statusLabels[s]}
          </button>
        )
      })}
    </div>
  )
}
