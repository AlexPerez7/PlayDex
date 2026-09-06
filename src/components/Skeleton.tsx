export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-800 ${className}`} />
}

export function GameCardSkeleton() {
  return (
    <div className="flex w-full items-center gap-3 rounded-lg bg-slate-900 p-3 ring-1 ring-slate-800">
      <Skeleton className="h-20 w-14 flex-shrink-0" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  )
}

export function GameCardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-2 sm:grid sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <GameCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function PopularCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg bg-slate-900 ring-1 ring-slate-800">
      <Skeleton className="aspect-[3/4] w-full rounded-none" />
      <div className="flex flex-col gap-2 p-2.5">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-7 w-full" />
      </div>
    </div>
  )
}

export function StatsCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-slate-900 p-3 ring-1 ring-slate-800">
      <Skeleton className="h-4 w-10" />
      <Skeleton className="h-6 w-16" />
    </div>
  )
}
