-- Cache global de precios de CheapShark.
-- CheapShark limita por IP y los Edge Functions de Supabase comparten IP entre
-- muchos proyectos, así que sin cache la mayoría de las llamadas devuelven 429.
-- La cache es compartida entre todos los usuarios (los precios no son privados);
-- la función `game-deals` escribe con la service role key, sorteando RLS.

create table if not exists price_cache (
  cache_key text primary key,
  deals jsonb not null,
  fetched_at timestamptz not null default now()
);

alter table price_cache enable row level security;

-- Lectura pública (los precios no son datos sensibles). La escritura solo ocurre
-- desde la Edge Function con service role, que ignora RLS.
create policy price_cache_read
  on price_cache for select
  using (true);
