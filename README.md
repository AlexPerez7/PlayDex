# PlayDex

PWA mobile-first para trackear videojuegos: backlog, progreso, horas jugadas y estadísticas personales.

Ver [`playdex-plan.md`](./playdex-plan.md) para el plan original de desarrollo.

En producción: https://playdex.netlify.app/

## Stack

- React + Vite + TypeScript + Tailwind CSS
- PWA vía `vite-plugin-pwa`
- Supabase (Postgres + Auth + Edge Functions + RLS)
- IGDB API (metadata y populares, vía Twitch OAuth)
- Deploy: Netlify

## Funcionalidades

- Login/registro con Supabase Auth
- Biblioteca con filtros por estado/plataforma, búsqueda por título y orden (recientes, título, horas, puntaje)
- Alta de juegos con autocompletado desde IGDB (portada, plataformas, géneros, sinopsis, año)
- Detalle/edición: estado, plataformas (multi-selección), fechas de inicio/fin, horas jugadas, puntaje (estrellas), notas, reseña
- Registro de sesiones de juego (fecha + minutos), que suman automáticamente a las horas totales
- Listas personalizadas (crear, agregar/quitar juegos)
- Pantalla de Inicio con juegos populares recientes (vía IGDB) y alta rápida a la biblioteca
- Diario: línea de tiempo con altas, inicios, finalizaciones y sesiones registradas
- Dashboard con estadísticas (totales, completados, en curso, horas, género favorito, mejor puntuado, más jugado)
- PWA instalable (manifest, ícono, service worker) y responsive (mobile-first, con ajustes para tablet)

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
3. Ejecutar las migraciones SQL en Supabase, en orden (`supabase/migrations/0001_init.sql`, `0002_add_metadata.sql`, `0003_lists_and_review.sql`).
4. Configurar los secrets de la Edge Function `igdb-search` (nunca en el frontend) y desplegarla:
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

## Deploy

Configurado en Netlify (`netlify.toml`) con deploy automático desde la rama `main`. Variables de entorno (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) configuradas en el sitio de Netlify.

## Estado

Todas las fases del plan original (`playdex-plan.md`) están completas y en producción. El desarrollo actual es iterativo, agregando mejoras sobre la base ya funcionando.
