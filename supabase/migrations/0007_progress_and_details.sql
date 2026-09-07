-- Campos para el rediseño del detalle de juego: anillos de progreso,
-- favorito, formato de la copia, replays y franquicia.

alter table games add column if not exists story_percent integer not null default 0 check (story_percent between 0 and 100);
alter table games add column if not exists general_percent integer not null default 0 check (general_percent between 0 and 100);
alter table games add column if not exists completionist_percent integer not null default 0 check (completionist_percent between 0 and 100);
alter table games add column if not exists is_favorite boolean not null default false;
alter table games add column if not exists format text;
alter table games add column if not exists replays integer not null default 0;
alter table games add column if not exists franchise text;
