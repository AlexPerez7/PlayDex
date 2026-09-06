import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase, ensureSession } from '../lib/supabaseClient'
import type { Game, NewGame } from '../types/game'

interface GamesContextValue {
  games: Game[]
  loading: boolean
  error: string | null
  addGame: (game: NewGame) => Promise<Game>
  updateGame: (id: string, changes: Partial<Game>) => Promise<Game>
  deleteGame: (id: string) => Promise<void>
  refetch: () => Promise<void>
}

const GamesContext = createContext<GamesContextValue | null>(null)

export function GamesProvider({ children }: { children: ReactNode }) {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGames = useCallback(async () => {
    setLoading(true)
    await ensureSession()
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setGames(data as Game[])
      setError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchGames()
  }, [fetchGames])

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

  const value: GamesContextValue = {
    games,
    loading,
    error,
    addGame,
    updateGame,
    deleteGame,
    refetch: fetchGames,
  }

  return <GamesContext.Provider value={value}>{children}</GamesContext.Provider>
}

export function useGames() {
  const ctx = useContext(GamesContext)
  if (!ctx) throw new Error('useGames debe usarse dentro de <GamesProvider>')
  return ctx
}
