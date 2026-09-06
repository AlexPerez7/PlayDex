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
                ? 'bg-emerald-600 text-slate-950'
                : 'bg-slate-900 text-slate-400 ring-1 ring-slate-800'
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
