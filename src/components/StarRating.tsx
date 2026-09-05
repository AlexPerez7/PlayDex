interface StarRatingProps {
  value: number | null
  onChange: (value: number | null) => void
}

const STAR_COUNT = 5

export function StarRating({ value, onChange }: StarRatingProps) {
  const points = value ?? 0

  function handleClick(starIndex: number, half: boolean) {
    const next = starIndex * 2 + (half ? 1 : 2)
    onChange(next === points ? null : next)
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {Array.from({ length: STAR_COUNT }).map((_, i) => {
          const filled = points - i * 2
          return (
            <button
              key={i}
              type="button"
              className="relative h-8 w-8 text-2xl leading-none text-slate-700"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const half = e.clientX - rect.left < rect.width / 2
                handleClick(i, half)
              }}
            >
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                ☆
              </span>
              <span
                className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden text-emerald-400"
                style={{
                  width: filled >= 2 ? '100%' : filled === 1 ? '50%' : '0%',
                }}
              >
                ★
              </span>
            </button>
          )
        })}
      </div>
      <span className="text-sm text-slate-400">
        {value ? `${value}/10` : 'Sin puntaje'}
      </span>
    </div>
  )
}
