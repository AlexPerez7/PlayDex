import type { ReactNode } from 'react'

export function PageContainer({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-6 md:max-w-3xl lg:max-w-5xl">
      {children}
    </div>
  )
}
