import { useCallback, useEffect, useState } from 'react'
import { supabase, ensureSession } from '../lib/supabaseClient'
import type { GameList } from '../types/game'

export function useLists() {
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

  return { lists, loading, createList, deleteList, refetch: fetchLists }
}

export function useGameListIds(gameId: string | undefined) {
  const [listIds, setListIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  const fetchListIds = useCallback(async () => {
    if (!gameId) return
    setLoading(true)
    await ensureSession()
    const { data, error } = await supabase
      .from('list_games')
      .select('list_id')
      .eq('game_id', gameId)

    if (!error) setListIds(new Set(data.map((row) => row.list_id as string)))
    setLoading(false)
  }, [gameId])

  useEffect(() => {
    fetchListIds()
  }, [fetchListIds])

  const toggle = useCallback(
    async (listId: string) => {
      if (!gameId) return
      if (listIds.has(listId)) {
        const { error } = await supabase
          .from('list_games')
          .delete()
          .eq('list_id', listId)
          .eq('game_id', gameId)
        if (error) throw error
        setListIds((prev) => {
          const next = new Set(prev)
          next.delete(listId)
          return next
        })
      } else {
        const { error } = await supabase
          .from('list_games')
          .insert({ list_id: listId, game_id: gameId })
        if (error) throw error
        setListIds((prev) => new Set(prev).add(listId))
      }
    },
    [gameId, listIds]
  )

  return { listIds, loading, toggle }
}

export function useListGameIds(listId: string | undefined) {
  const [gameIds, setGameIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const fetchGameIds = useCallback(async () => {
    if (!listId) return
    setLoading(true)
    await ensureSession()
    const { data, error } = await supabase
      .from('list_games')
      .select('game_id')
      .eq('list_id', listId)
      .order('added_at', { ascending: false })

    if (!error) setGameIds(data.map((row) => row.game_id as string))
    setLoading(false)
  }, [listId])

  useEffect(() => {
    fetchGameIds()
  }, [fetchGameIds])

  const removeGame = useCallback(
    async (gameId: string) => {
      if (!listId) return
      const { error } = await supabase
        .from('list_games')
        .delete()
        .eq('list_id', listId)
        .eq('game_id', gameId)
      if (error) throw error
      setGameIds((prev) => prev.filter((id) => id !== gameId))
    },
    [listId]
  )

  return { gameIds, loading, removeGame }
}
