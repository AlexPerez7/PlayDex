import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase, ensureSession } from '../lib/supabaseClient'
import { readCache, removeCacheByPrefix, writeCache } from '../lib/localCache'
import type { Game, NewGame } from '../types/game'

interface GamesContextValue {
  games: Game[]
  loading: boolean
  error: string | null
  addGame: (game: NewGame) => Promise<Game>
  updateGame: (id: string, changes: Partial<Game>) => Promise<Game>
  deleteGame: (id: string) => Promise<void>
  /** Relee un juego de la DB (ej. después de que un trigger lo modificó). */
  refreshGame: (id: string) => Promise<void>
  refetch: () => Promise<void>
}

const GamesContext = createContext<GamesContextValue | null>(null)

const CACHE_PREFIX = 'playdex_games_v1:'

export function GamesProvider({ children }: { children: ReactNode }) {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Una vez que hay datos, las recargas son silenciosas (sin esqueletos).
  const hasLoaded = useRef(false)
  // Usuario dueño de los datos en memoria (para la cache local).
  const userIdRef = useRef<string | null>(null)

  const fetchGames = useCallback(async () => {
    if (!hasLoaded.current) setLoading(true)
    await ensureSession()
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      // Si ya hay datos (de la cache o de antes), un fallo de red no borra
      // la biblioteca ni muestra error: se sigue viendo lo último conocido.
      if (!hasLoaded.current) setError(error.message)
    } else {
      setGames(data as Game[])
      setError(null)
      hasLoaded.current = true
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    // onAuthStateChange dispara INITIAL_SESSION apenas nos suscribimos (con la
    // sesión ya restaurada o null), así que no hace falta un fetch aparte al
    // montar. SIGNED_IN cubre el caso en que el provider ya estaba montado sin
    // sesión cuando el usuario hace login.
    //
    // Se ignoran TOKEN_REFRESHED y USER_UPDATED: en mobile el token se renueva
    // cada vez que la PWA vuelve del segundo plano, y recargar ahí hacía
    // parpadear toda la app con esqueletos.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        hasLoaded.current = false
        userIdRef.current = null
        removeCacheByPrefix(CACHE_PREFIX)
        setGames([])
        setError(null)
        setLoading(false)
        return
      }
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        // Pintar al instante la última biblioteca conocida de este usuario y
        // revalidar contra la DB en segundo plano.
        if (userIdRef.current !== session.user.id) {
          userIdRef.current = session.user.id
          const cached = readCache<Game[]>(CACHE_PREFIX + session.user.id)
          if (cached) {
            setGames(cached.data)
            setLoading(false)
            hasLoaded.current = true
          }
        }
        // Diferido: no se debe llamar a otros métodos de supabase dentro del
        // callback de onAuthStateChange (puede bloquearse esperando el lock).
        setTimeout(fetchGames, 0)
      }
    })
    return () => subscription.unsubscribe()
  }, [fetchGames])

  // Mantener la cache local al día con cada cambio (alta, edición, borrado).
  useEffect(() => {
    if (hasLoaded.current && userIdRef.current) {
      writeCache(CACHE_PREFIX + userIdRef.current, games)
    }
  }, [games])

  const addGame = useCallback(async (game: NewGame) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('No hay sesión activa')

    const { data, error } = await supabase
      .from('games')
      .insert({ ...game, user_id: user.id })
      .select()
      .single()

    if (error) throw error
    setGames((prev) => [data as Game, ...prev])
    return data as Game
  }, [])

  const updateGame = useCallback(async (id: string, changes: Partial<Game>) => {
    const { data, error } = await supabase
      .from('games')
      .update(changes)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    setGames((prev) => prev.map((g) => (g.id === id ? (data as Game) : g)))
    return data as Game
  }, [])

  const deleteGame = useCallback(async (id: string) => {
    const { error } = await supabase.from('games').delete().eq('id', id)
    if (error) throw error
    setGames((prev) => prev.filter((g) => g.id !== id))
  }, [])

  const refreshGame = useCallback(async (id: string) => {
    const { data, error } = await supabase.from('games').select('*').eq('id', id).single()
    if (error) throw error
    setGames((prev) => prev.map((g) => (g.id === id ? (data as Game) : g)))
  }, [])

  const value = useMemo<GamesContextValue>(
    () => ({
      games,
      loading,
      error,
      addGame,
      updateGame,
      deleteGame,
      refreshGame,
      refetch: fetchGames,
    }),
    [games, loading, error, addGame, updateGame, deleteGame, refreshGame, fetchGames]
  )

  return <GamesContext.Provider value={value}>{children}</GamesContext.Provider>
}

export function useGames() {
  const ctx = useContext(GamesContext)
  if (!ctx) throw new Error('useGames debe usarse dentro de <GamesProvider>')
  return ctx
}
