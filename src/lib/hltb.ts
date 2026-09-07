import { supabase } from './supabaseClient'

export interface HltbResult {
  name: string
  mainHours: number | null
  mainExtraHours: number | null
  completionistHours: number | null
}

export async function searchHltb(query: string): Promise<HltbResult[]> {
  const { data, error } = await supabase.functions.invoke<HltbResult[]>('hltb-search', {
    body: { query },
  })
  if (error) throw error
  return data ?? []
}
