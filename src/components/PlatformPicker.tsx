import { Check } from 'lucide-react'
import { COMMON_PLATFORMS } from '../lib/platforms'
import { parseTags } from '../lib/tags'
import { Chip } from './Chip'

interface PlatformPickerProps {
  value: string | null | undefined
  onChange: (value: string) => void
}

export function PlatformPicker({ value, onChange }: PlatformPickerProps) {
  const selected = parseTags(value)
  const extras = selected.filter((p) => !COMMON_PLATFORMS.includes(p))
  const options = [...COMMON_PLATFORMS, ...extras]

  function toggle(platform: string) {
    const next = selected.includes(platform)
      ? selected.filter((p) => p !== platform)
      : [...selected, platform]
    onChange(next.join(', '))
  }

  return (
    <div className="flex flex-wrap gap-x-2 gap-y-3">
      {options.map((platform) => {
        const active = selected.includes(platform)
        return (
          <Chip key={platform} active={active} onClick={() => toggle(platform)}>
            {active && <Check size={14} className="-ml-0.5 mr-1" />}
            {platform}
          </Chip>
        )
      })}
    </div>
  )
}
