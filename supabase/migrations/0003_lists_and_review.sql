alter table games add column if not exists review text;

create table lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  name text not null,
  created_at timestamptz default now()
);

alter table lists enable row level security;

create policy lists_owner_policy
  on lists for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table list_games (
  id uuid primary key default gen_random_uuid(),
  list_id uuid references lists(id) on delete cascade not null,
  game_id uuid references games(id) on delete cascade not null,
  added_at timestamptz default now(),
  unique (list_id, game_id)
);

alter table list_games enable row level security;

create policy list_games_owner_policy
  on list_games for all
  using (exists (select 1 from lists where lists.id = list_games.list_id and lists.user_id = auth.uid()));
