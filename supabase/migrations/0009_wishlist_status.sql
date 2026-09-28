-- Nuevo estado "deseado" (wishlist): juegos que todavía no se tienen pero se
-- quieren comprar. Se separa de "pendiente" (ya lo tengo, falta jugarlo) para
-- que el backlog y las estadísticas no mezclen ambas cosas.
alter table games drop constraint if exists games_status_check;

alter table games
  add constraint games_status_check
  check (status in ('deseado', 'pendiente', 'jugando', 'completado', 'abandonado', 'en_pausa'));
