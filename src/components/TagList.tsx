import { parseTags } from '../lib/tags'

export function TagList({ value }: { value: string | null | undefined }) {
  const tags = parseTags(value)
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-primary-dark/20 px-2 py-0.5 text-xs text-lavender"
        >
          {tag}
        </span>
      ))}
    </div>
  )
}
