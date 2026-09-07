import { supabase } from './supabaseClient'

export interface GameDeal {
  store: string
  salePrice: number
  normalPrice: number
  savingsPercent: number
  url: string
}

export async function getGameDeals(title: string): Promise<GameDeal[]> {
  const { data, error } = await supabase.functions.invoke<GameDeal[]>('game-deals', {
    body: { title },
  })

  if (error) throw error
  return data ?? []
}
