-- Perfil por usuario. Por ahora solo guarda la cuenta de Steam vinculada
-- (SteamID64 + nombre/avatar para mostrar). Antes el Steam ID era un secret
-- global de la Edge Function, así que "importar de Steam" traía siempre la
-- misma biblioteca; ahora cada usuario vincula la suya vía "Sign in through
-- Steam" (OpenID 2.0).

create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  steam_id text,
  steam_persona text,
  steam_avatar text,
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy profiles_owner
  on profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
