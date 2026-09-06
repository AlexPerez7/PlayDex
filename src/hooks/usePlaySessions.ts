import { useCallback, useEffect, useState } from 'react'
import { supabase, ensureSession } from '../lib/supabaseClient'
import type { PlaySession } from '../types/game'

export function usePlaySessions(gameId: string | undefined) {
  const [sessions, setSessions] = useState<PlaySession[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSessions = useCallback(async () => {
    if (!gameId) return
    setLoading(true)
    await ensureSession()
    const { data, error } = await supabase
      .from('play_sessions')
      .select('*')
      .eq('game_id', gameId)
      .order('played_at', { ascending: false })

    if (!error) setSessions(data as PlaySession[])
    setLoading(false)
  }, [gameId])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const addSession = useCallback(
    async (durationMinutes: number, playedAt: string, notes?: string) => {
      if (!gameId) return
      const { data, error } = await supabase
        .from('play_sessions')
        .insert({
          game_id: gameId,
          duration_minutes: durationMinutes,
          played_at: playedAt,
          notes: notes || null,
        })
        .select()
        .single()

      if (error) throw error
      setSessions((prev) => [data as PlaySession, ...prev])
      return data as PlaySession
    },
    [gameId]
  )

  const deleteSession = useCallback(async (id: string) => {
    const { error } = await supabase.from('play_sessions').delete().eq('id', id)
    if (error) throw error
    setSessions((prev) => prev.filter((s) => s.id !== id))
  }, [])

  return { sessions, loading, addSession, deleteSession, refetch: fetchSessions }
}
