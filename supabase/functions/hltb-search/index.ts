// Edge Function: proxy hacia HowLongToBeat.
// HLTB no tiene API publica/oficial: esto imita la request que hace su propio
// sitio internamente. Es la integracion mas fragil de las tres (IGDB, Steam,
// CheapShark, HLTB) porque HLTB puede cambiar el endpoint o el formato sin
// aviso. Si en algun momento deja de funcionar, hay que revisar de nuevo como
// arma la request el sitio (inspeccionar network tab de howlongtobeat.com).
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const HLTB_HEADERS = {
  'Content-Type': 'application/json',
  Referer: 'https://howlongtobeat.com/',
  Origin: 'https://howlongtobeat.com',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
}

interface HltbEntry {
  game_id: number
  game_name: string
  comp_main: number
  comp_plus: number
  comp_100: number
}

function buildSearchBody(query: string) {
  return JSON.stringify({
    searchType: 'games',
    searchTerms: query.split(' ').filter(Boolean),
    searchPage: 1,
    size: 5,
    searchOptions: {
      games: {
        userId: 0,
        platform: '',
        sortCategory: 'popular',
        rangeCategory: 'main',
        rangeTime: { min: 0, max: 0 },
        gameplay: { perspective: '', flow: '', genre: '' },
        rangeYear: { min: '', max: '' },
        modifier: '',
      },
      users: { sortCategory: 'postcount' },
      lists: { sortCategory: 'follows' },
      filter: '',
      sort: 0,
      randomizer: 0,
    },
    useCache: true,
  })
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
    const { query } = await req.json()
    if (!query || typeof query !== 'string') {
      return new Response(JSON.stringify({ error: 'Falta el parametro query' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const res = await fetch('https://howlongtobeat.com/api/search', {
      method: 'POST',
      headers: HLTB_HEADERS,
      body: buildSearchBody(query),
    })

    if (!res.ok) {
      throw new Error(`HowLongToBeat no respondio como se esperaba (${res.status})`)
    }

    const data = await res.json()
    const entries: HltbEntry[] = data?.data ?? []

    const results = entries.slice(0, 3).map((e) => ({
      name: e.game_name,
      mainHours: e.comp_main ? Math.round((e.comp_main / 3600) * 10) / 10 : null,
      mainExtraHours: e.comp_plus ? Math.round((e.comp_plus / 3600) * 10) / 10 : null,
      completionistHours: e.comp_100 ? Math.round((e.comp_100 / 3600) * 10) / 10 : null,
    }))

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
