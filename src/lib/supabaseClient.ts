import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan las variables de entorno VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Revisa tu archivo .env.local'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Espera a que la sesión persistida se termine de restaurar antes de
// disparar una consulta. Sin esto, la primera consulta al abrir la app
// (ej. desde un link directo o reabriendo una pestaña vieja) puede
// dispararse antes de que el cliente adjunte el token del usuario,
// devolviendo listas vacías por RLS en vez de los datos reales.
export async function ensureSession() {
  await supabase.auth.getSession()
}
