import { statuses, statusLabels, statusColors } from '../lib/status'
import type { GameStatus } from '../types/game'
import { Chip } from './Chip'

interface StatusPickerProps {
  value: GameStatus
  onChange: (value: GameStatus) => void
}

export function StatusPicker({ value, onChange }: StatusPickerProps) {
  return (
    <div className="flex flex-wrap gap-x-2 gap-y-3">
      {statuses.map((s) => (
        <Chip
          key={s}
          active={s === value}
          onClick={() => onChange(s)}
          activeClassName={statusColors[s]}
        >
          {statusLabels[s]}
        </Chip>
      ))}
    </div>
  )
}
