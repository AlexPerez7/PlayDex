-- Las horas jugadas se actualizan en la DB al registrar/borrar una sesión.
--
-- Antes el frontend leía hours_played, le sumaba los minutos y hacía un UPDATE
-- con el total. Con varios toques seguidos en "+30 min" (o desde dos
-- dispositivos) cada request partía del mismo valor viejo y se perdían horas.
-- Un UPDATE con `hours_played = hours_played + delta` es atómico.

create or replace function apply_session_hours()
returns trigger
language plpgsql
as $$
declare
  delta numeric;
  target uuid;
begin
  -- Si el borrado de la sesión viene en cascada desde el borrado del juego,
  -- el juego ya no existe: no hay nada que actualizar.
  if tg_op = 'DELETE' and pg_trigger_depth() > 1 then
    return old;
  end if;

  if tg_op = 'INSERT' then
    delta := new.duration_minutes / 60.0;
    target := new.game_id;
  else
    delta := -(old.duration_minutes / 60.0);
    target := old.game_id;
  end if;

  update games
     set hours_played = greatest(0, round(coalesce(hours_played, 0) + delta, 1))
   where id = target;

  return coalesce(new, old);
end;
$$;

drop trigger if exists play_sessions_hours on play_sessions;

create trigger play_sessions_hours
  after insert or delete on play_sessions
  for each row execute function apply_session_hours();
