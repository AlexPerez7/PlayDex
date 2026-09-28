import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

/** Distancia de arrastre (px) a partir de la cual soltar cierra la hoja. */
const DRAG_CLOSE_THRESHOLD = 90

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  const titleId = useId()
  const sheetRef = useRef<HTMLDivElement>(null)
  const [dragY, setDragY] = useState(0)
  const dragStart = useRef<number | null>(null)

  // Bloquear el scroll de la página de fondo y cerrar con Escape.
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    sheetRef.current?.focus()
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  // Deslizar hacia abajo desde la manija / título para cerrar.
  function onTouchStart(e: React.TouchEvent) {
    dragStart.current = e.touches[0].clientY
  }
  function onTouchMove(e: React.TouchEvent) {
    if (dragStart.current == null) return
    setDragY(Math.max(0, e.touches[0].clientY - dragStart.current))
  }
  function onTouchEnd() {
    if (dragY > DRAG_CLOSE_THRESHOLD) onClose()
    dragStart.current = null
    setDragY(0)
  }

  return (
    <>
      <div className="fade-in fixed inset-0 z-40 bg-black/60" onClick={onClose} />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="sheet-in fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[85dvh] max-w-lg overflow-y-auto overscroll-contain rounded-t-3xl bg-background-surface px-5 shadow-lg outline-none"
        style={{
          paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))',
          transform: dragY ? `translateY(${dragY}px)` : undefined,
          transition: dragY ? 'none' : 'transform 150ms ease-out',
        }}
      >
        <div
          className="sticky top-0 -mx-5 bg-background-surface px-5 pb-3 pt-3"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-primary-dark/40" />
          <h2 id={titleId} className="text-lg font-bold text-ink">
            {title}
          </h2>
        </div>
        {children}
      </div>
    </>
  )
}
