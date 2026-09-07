// Edge Function: proxy hacia CheapShark (precios de juegos en tiendas de PC).
// No requiere API key ni cuenta - es una API publica.
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const STORE_NAMES: Record<string, string> = {
  '1': 'Steam',
  '2': 'GamersGate',
  '3': 'GreenManGaming',
  '7': 'GOG',
  '8': 'Origin',
  '11': 'Humble Store',
  '13': 'Uplay',
  '15': 'Fanatical',
  '21': 'WinGameStore',
  '23': 'GameBillet',
  '25': 'Epic Games Store',
  '27': 'Gamesplanet',
  '30': 'IndieGala',
}

interface CheapSharkDeal {
  dealID: string
  storeID: string
  title: string
  salePrice: string
  normalPrice: string
  savings: string
  thumb: string
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { title } = await req.json()
    if (!title || typeof title !== 'string') {
      return new Response(JSON.stringify({ error: 'Falta el parametro title' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const params = new URLSearchParams({
      title,
      limit: '10',
      sortBy: 'Price',
    })

    const res = await fetch(`https://www.cheapshark.com/api/1.0/deals?${params}`)
    if (!res.ok) {
      throw new Error(`Error de CheapShark (${res.status})`)
    }

    const deals: CheapSharkDeal[] = await res.json()

    // Un solo resultado por tienda (el mas barato), la API a veces repite juego+tienda
    const seenStores = new Set<string>()
    const results = []
    for (const d of deals) {
      if (seenStores.has(d.storeID)) continue
      seenStores.add(d.storeID)
      results.push({
        store: STORE_NAMES[d.storeID] ?? `Tienda ${d.storeID}`,
        salePrice: parseFloat(d.salePrice),
        normalPrice: parseFloat(d.normalPrice),
        savingsPercent: Math.round(parseFloat(d.savings)),
        url: `https://www.cheapshark.com/redirect?dealID=${d.dealID}`,
      })
      if (results.length >= 5) break
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Error desconocido' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
