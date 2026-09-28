import { Check } from 'lucide-react'
import { BottomSheet } from './BottomSheet'
import { statusColors, statusIcons, statusLabels, statuses } from '../lib/status'
import type { GameStatus } from '../types/game'

interface StatusSheetProps {
  open: boolean
  onClose: () => void
  value: GameStatus
  onChange: (status: GameStatus) => void
  /** Subtítulo opcional (ej. el nombre del juego en la biblioteca). */
  title?: string
}

export function StatusSheet({ open, onClose, value, onChange, title = 'Cambiar estado' }: StatusSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      <div className="flex flex-col gap-1">
        {statuses.map((s) => {
          const StatusIcon = statusIcons[s]
          const active = s === value
          return (
            <button
              key={s}
              type="button"
              onClick={() => onChange(s)}
              className={`flex min-h-14 items-center gap-3 rounded-xl px-3 text-left ${
                active ? 'bg-accent/10' : 'active:bg-primary-dark/10'
              }`}
            >
              <span
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${statusColors[s]}`}
              >
                <StatusIcon size={18} />
              </span>
              <span className={`flex-1 text-sm font-medium ${active ? 'text-accent' : 'text-ink'}`}>
                {statusLabels[s]}
              </span>
              {active && <Check size={18} className="text-accent" />}
            </button>
          )
        })}
      </div>
    </BottomSheet>
  )
}
