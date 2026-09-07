# PlayDex

PWA mobile-first para trackear videojuegos: backlog, progreso, horas jugadas y estadísticas personales.

Ver [`playdex-plan.md`](./playdex-plan.md) para el plan original de desarrollo.

En producción: https://playdex.netlify.app/

## Stack

- React + Vite + TypeScript + Tailwind CSS
- PWA vía `vite-plugin-pwa`
- Supabase (Postgres + Auth + Edge Functions + RLS)
- Deploy: Netlify

## Integraciones externas (todas vía Edge Functions de Supabase, nunca desde el frontend)

- **IGDB** (metadata de juegos, populares y duración estimada) — vía Twitch OAuth. Función `igdb-search`, con modos `query` (default), `popular` y `timeToBeat` (endpoint oficial `game_time_to_beats`).
- **Steam Web API** (importar biblioteca propia con horas jugadas reales). Función `steam-library`.
- **CheapShark** (precios actuales en tiendas de PC, sin API key). Función `game-deals`. Los resultados se cachean en la tabla `price_cache` (TTL 12 h) porque CheapShark limita por IP y los Edge Functions comparten IP; usa `steam_appid` cuando está disponible para un match exacto.

> La duración estimada antes venía de HowLongToBeat (scraping de un endpoint interno no oficial). Se migró a IGDB `game_time_to_beats` por estabilidad; la función `hltb-search` fue eliminada.

## Funcionalidades

- Login/registro con Supabase Auth
- Biblioteca con filtros por estado/plataforma, búsqueda por título y orden (recientes, título, horas, puntaje)
- Alta de juegos con autocompletado desde IGDB (portada, plataformas, géneros, sinopsis, año)
- Importar biblioteca de Steam con horas jugadas reales
- Detalle/edición: estado, plataformas (multi-selección), fechas de inicio/fin, horas jugadas, puntaje (estrellas), notas, reseña
- Precios actuales en tiendas de PC (CheapShark) para juegos en estado "Pendiente"
- Duración estimada (IGDB: rápido / normal / completista) en el detalle de cada juego
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
3. Ejecutar las migraciones SQL en Supabase, en orden (carpeta `supabase/migrations/`, actualmente 0001 a 0005), o `supabase db push`.
4. Configurar los secrets de las Edge Functions (nunca en el frontend) y desplegarlas:
   ```
   supabase secrets set TWITCH_CLIENT_ID=xxx TWITCH_CLIENT_SECRET=xxx
   supabase secrets set STEAM_API_KEY=xxx STEAM_ID=xxx
   supabase functions deploy igdb-search steam-library game-deals
   ```
   `game-deals` no necesita secrets (API pública); usa la `SUPABASE_SERVICE_ROLE_KEY` que Supabase inyecta automáticamente para escribir en `price_cache`.
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

Todas las fases del plan original (`playdex-plan.md`) están completas y en producción. El desarrollo actual es iterativo, agregando mejoras e integraciones sobre la base ya funcionando.
