import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase, ensureSession } from '../lib/supabaseClient'
import type { GameList } from '../types/game'

interface ListsContextValue {
  lists: GameList[]
  loading: boolean
  createList: (name: string) => Promise<GameList>
  deleteList: (id: string) => Promise<void>
  refetch: () => Promise<void>
}

const ListsContext = createContext<ListsContextValue | null>(null)

export function ListsProvider({ children }: { children: ReactNode }) {
  const [lists, setLists] = useState<GameList[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLists = useCallback(async () => {
    setLoading(true)
    await ensureSession()
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setLists(data as GameList[])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchLists()
  }, [fetchLists])

  const createList = useCallback(async (name: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('No hay sesión activa')

    const { data, error } = await supabase
      .from('lists')
      .insert({ name, user_id: user.id })
      .select()
      .single()

    if (error) throw error
    setLists((prev) => [data as GameList, ...prev])
    return data as GameList
  }, [])

  const deleteList = useCallback(async (id: string) => {
    const { error } = await supabase.from('lists').delete().eq('id', id)
    if (error) throw error
    setLists((prev) => prev.filter((l) => l.id !== id))
  }, [])

  const value: ListsContextValue = {
    lists,
    loading,
    createList,
    deleteList,
    refetch: fetchLists,
  }

  return <ListsContext.Provider value={value}>{children}</ListsContext.Provider>
}

export function useLists() {
  const ctx = useContext(ListsContext)
  if (!ctx) throw new Error('useLists debe usarse dentro de <ListsProvider>')
  return ctx
}
