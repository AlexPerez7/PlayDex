import { COMMON_FORMATS } from '../lib/formats'
import { parseTags } from '../lib/tags'
import { Chip } from './Chip'

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
    <div className="flex flex-wrap gap-x-2 gap-y-3">
      {COMMON_FORMATS.map((format) => (
        <Chip key={format} active={selected.includes(format)} onClick={() => toggle(format)}>
          {format}
        </Chip>
      ))}
    </div>
  )
}
