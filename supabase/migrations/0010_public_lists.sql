-- Listas compartibles por link público (solo lectura).
--
-- En vez de abrir las políticas RLS de `games` a usuarios anónimos (lo que
-- expondría TODAS las columnas de esos juegos, incluidas notas y reseñas
-- privadas), la lectura pública pasa por una función SECURITY DEFINER que
-- devuelve solo campos no sensibles y solo si la lista está marcada como
-- pública. Las tablas siguen sin ninguna política para `anon`.

alter table lists add column if not exists is_public boolean not null default false;

create or replace function get_public_list(p_list_id uuid)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'name', l.name,
    'games', coalesce(
      (
        select json_agg(
          json_build_object(
            'title', g.title,
            'cover_url', g.cover_url,
            'platform', g.platform,
            'genre', g.genre,
            'status', g.status,
            'rating', g.rating,
            'first_release_date', g.first_release_date
          )
          order by lg.added_at desc
        )
        from list_games lg
        join games g on g.id = lg.game_id
        where lg.list_id = l.id
      ),
      '[]'::json
    )
  )
  from lists l
  where l.id = p_list_id
    and l.is_public;
$$;

revoke all on function get_public_list(uuid) from public;
grant execute on function get_public_list(uuid) to anon, authenticated;
