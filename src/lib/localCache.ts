// Cache local de lectura (stale-while-revalidate). NO es la fuente de verdad:
// todo sigue viviendo en Supabase; esto solo permite pintar la última versión
// conocida al instante mientras llega la respuesta de la red (clave en mobile
// con conexiones lentas o sin señal).
//
// Cualquier acceso a localStorage puede fallar (modo privado, cuota llena):
// en ese caso simplemente no hay cache.

interface Entry<T> {
  savedAt: number
  data: T
}

export function readCache<T>(key: string): Entry<T> | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as Entry<T>) : null
  } catch {
    return null
  }
}

export function writeCache<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data }))
  } catch {
    /* sin espacio o sin acceso: se ignora */
  }
}

export function removeCache(key: string) {
  try {
    localStorage.removeItem(key)
  } catch {
    /* idem */
  }
}

/** Borra todas las entradas con un prefijo (ej. al cerrar sesión). */
export function removeCacheByPrefix(prefix: string) {
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(prefix)) localStorage.removeItem(key)
    }
  } catch {
    /* idem */
  }
}
