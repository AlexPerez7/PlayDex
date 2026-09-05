# PlayDex

PWA mobile-first para trackear videojuegos: backlog, progreso, horas jugadas y estadísticas personales.

Ver [`playdex-plan.md`](./playdex-plan.md) para el plan completo de desarrollo.

## Stack

- React + Vite + TypeScript + Tailwind CSS
- PWA vía `vite-plugin-pwa`
- Supabase (Postgres + Auth + Edge Functions + RLS)
- IGDB API (metadata de juegos, vía Twitch OAuth)

## Setup

1. Instalar dependencias:
   ```
   npm install
   ```
2. Copiar `.env.example` a `.env.local` y completar con las credenciales de tu proyecto de Supabase:
   ```
   VITE_SUPABASE_URL=
   VITE_SUPABASE_ANON_KEY=
   ```
3. Ejecutar la migración SQL en Supabase (`supabase/migrations/0001_init.sql`) para crear las tablas `games` y `play_sessions` con RLS.
4. Configurar los secrets de la Edge Function `igdb-search` (nunca en el frontend):
   ```
   supabase secrets set TWITCH_CLIENT_ID=xxx TWITCH_CLIENT_SECRET=xxx
   supabase functions deploy igdb-search
   ```
5. Correr en desarrollo:
   ```
   npm run dev
   ```

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción (type-check + Vite build)
- `npm run preview` — preview del build
- `npm run lint` — lint con oxlint

## Estado

Ver el plan de fases en `playdex-plan.md`. Fases 0–3 (setup, datos/auth, integración IGDB, CRUD/UI) implementadas en código; falta provisionar los recursos externos (proyecto Supabase real, credenciales IGDB) y luego Fases 4–6 (PWA fino, dashboard, deploy).
