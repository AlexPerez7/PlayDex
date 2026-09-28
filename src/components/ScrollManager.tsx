import { useEffect, useLayoutEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

// Posición de scroll de cada entrada del historial (por location.key).
const positions = new Map<string, number>()

/**
 * Restauración de scroll (BrowserRouter no la trae):
 * - navegar a una pantalla nueva (PUSH/REPLACE) arranca arriba;
 * - volver atrás (POP) deja el scroll donde estaba, ej. la biblioteca en el
 *   juego que se había tocado.
 */
export function ScrollManager() {
  const location = useLocation()
  const navigationType = useNavigationType()

  // Registrar continuamente la posición de la pantalla actual. Hacerlo en el
  // cleanup de la navegación no sirve: para entonces el DOM ya es el de la
  // pantalla nueva y el scroll puede haberse recortado.
  useEffect(() => {
    let frame = 0
    function onScroll() {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => positions.set(location.key, window.scrollY))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [location.key])

  useLayoutEffect(() => {
    const saved = positions.get(location.key)
    if (navigationType !== 'POP' || saved == null) {
      window.scrollTo(0, 0)
      return
    }
    // La pantalla puede tardar unos frames en tener su altura final (chunk
    // lazy, datos): reintentar hasta que el scroll guardado sea alcanzable.
    let tries = 0
    let frame = 0
    function restore() {
      const reachable = document.documentElement.scrollHeight - window.innerHeight >= saved!
      if (reachable || tries++ > 30) {
        window.scrollTo(0, saved!)
        return
      }
      frame = requestAnimationFrame(restore)
    }
    restore()
    return () => cancelAnimationFrame(frame)
  }, [location.key, navigationType])

  return null
}
