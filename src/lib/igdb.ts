import { supabase } from './supabaseClient'
import type { IgdbSearchResult } from '../types/game'

export async function searchGames(query: string): Promise<IgdbSearchResult[]> {
  const { data, error } = await supabase.functions.invoke<IgdbSearchResult[]>(
    'igdb-search',
    { body: { query } }
  )

  if (error) throw error
  return data ?? []
}
