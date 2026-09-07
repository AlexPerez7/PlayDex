import type { ReactNode } from 'react'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-background-surface p-5 pb-8 shadow-lg">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-primary-dark/40" />
        <h2 className="mb-4 text-lg font-bold text-ink">{title}</h2>
        {children}
      </div>
    </>
  )
}
