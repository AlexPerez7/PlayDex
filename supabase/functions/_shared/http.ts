// Helpers compartidos por las Edge Functions: CORS + respuestas JSON.
// Se centraliza acá para no repetir los headers en cada función y para
// asegurar `charset=utf-8` en todas las respuestas (nombres con ™, ©, etc.).

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

/** Responde al preflight OPTIONS. Devuelve null si no es un preflight. */
export function handlePreflight(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  return null
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
  })
}

export function errorResponse(err: unknown, status = 500): Response {
  const message = err instanceof Error ? err.message : 'Error desconocido'
  return jsonResponse({ error: message }, status)
}
