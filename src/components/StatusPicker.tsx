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
                : 'bg-slate-900 text-slate-500 ring-1 ring-slate-800'
            }`}
          >
            {statusLabels[s]}
          </button>
        )
      })}
    </div>
  )
}
