// Cliente de Supabase para Edge Functions que necesitan actuar como el usuario
// que llamó (respetando RLS). Se aísla en su propio archivo para no arrastrar
// la dependencia de @supabase/supabase-js a las funciones que no la usan.
import { createClient, type User } from 'https://esm.sh/@supabase/supabase-js@2'
import { jsonResponse } from './http.ts'

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

/**
 * Exige un usuario logueado. La verificación de JWT del gateway no alcanza: la
 * anon key también es un JWT válido y es pública (va en el bundle del
 * frontend), así que sin esto cualquiera podría usar la función como proxy
 * gratuito hacia IGDB/CheapShark con nuestras credenciales y cuota.
 *
 * Devuelve el usuario, o una Response 401 lista para retornar.
 */
export async function requireUser(req: Request): Promise<User | Response> {
  const {
    data: { user },
  } = await userClient(req).auth.getUser()
  return user ?? jsonResponse({ error: 'No autenticado.' }, 401)
}
