create table games (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  igdb_id integer,
  title text not null,
  platform text,
  status text check (status in ('pendiente','jugando','completado','abandonado','en_pausa')) default 'pendiente',
  hours_played numeric default 0,
  rating integer check (rating between 1 and 10),
  cover_url text,
  genre text,
  notes text,
  date_started date,
  date_finished date,
  created_at timestamptz default now()
);

alter table games enable row level security;

create policy "Users can manage their own games"
  on games for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table play_sessions (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id) on delete cascade,
  duration_minutes integer not null,
  played_at timestamptz default now(),
  notes text
);

alter table play_sessions enable row level security;

create policy "Users can manage sessions of their own games"
  on play_sessions for all
  using (exists (select 1 from games where games.id = play_sessions.game_id and games.user_id = auth.uid()));
