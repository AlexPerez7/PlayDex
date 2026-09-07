// Cliente de Supabase para Edge Functions que necesitan actuar como el usuario
// que llamó (respetando RLS). Se aísla en su propio archivo para no arrastrar
// la dependencia de @supabase/supabase-js a las funciones que no la usan.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/** Cliente autenticado con el JWT del usuario que hizo la request. */
export function userClient(req: Request) {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  )
}
