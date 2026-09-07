import { COMMON_PLATFORMS } from '../lib/platforms'
import { parseTags } from '../lib/tags'

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
    <div className="flex flex-wrap gap-2">
      {options.map((platform) => {
        const active = selected.includes(platform)
        return (
          <button
            key={platform}
            type="button"
            onClick={() => toggle(platform)}
            className={`rounded-full px-3 py-1 text-xs ${
              active
                ? 'bg-accent text-primary-darker'
                : 'bg-background-surface text-lavender ring-1 ring-primary-dark/30'
            }`}
          >
            {active ? '✓ ' : ''}
            {platform}
          </button>
        )
      })}
    </div>
  )
}
