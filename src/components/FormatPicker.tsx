import { COMMON_FORMATS } from '../lib/formats'
import { parseTags } from '../lib/tags'

interface FormatPickerProps {
  value: string | null | undefined
  onChange: (value: string) => void
}

export function FormatPicker({ value, onChange }: FormatPickerProps) {
  const selected = parseTags(value)

  function toggle(format: string) {
    const next = selected.includes(format)
      ? selected.filter((f) => f !== format)
      : [...selected, format]
    onChange(next.join(', '))
  }

  return (
    <div className="flex flex-wrap gap-2">
      {COMMON_FORMATS.map((format) => {
        const active = selected.includes(format)
        return (
          <button
            key={format}
            type="button"
            onClick={() => toggle(format)}
            className={`rounded-full px-3 py-1 text-xs ${
              active
                ? 'bg-accent text-primary-darker'
                : 'bg-background-surface text-lavender ring-1 ring-primary-dark/30'
            }`}
          >
            {format}
          </button>
        )
      })}
    </div>
  )
}
