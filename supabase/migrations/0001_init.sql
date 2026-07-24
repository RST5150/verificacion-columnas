-- Schema for "Verificación Mecánica y Eléctrica de una Columna de Alumbrado Público"
-- Run this in the Supabase SQL editor (Project -> SQL Editor -> New query -> paste -> Run).

create table if not exists ordenes_servicio (
  id                          bigint generated always as identity primary key,
  orden_de_servicio           text not null,
  localidad                   text not null,
  fecha                       date not null,

  empresa                     text,

  -- Reserved for a future OCR-assisted entry stage. Unused for now.
  imagen_url                  text,

  created_at                  timestamptz not null default now()
);

comment on column ordenes_servicio.imagen_url is
  'Reserved for a future OCR flow: reference to the scanned source image. Unused in the manual-entry stage.';

create table if not exists columnas_inspeccionadas (
  id                          bigint generated always as identity primary key,
  orden_servicio_id           bigint not null references ordenes_servicio(id) on delete cascade,

  calle                       text not null,
  altura                      integer not null,
  n_columna                   text not null,

  tapa                        boolean not null,
  aplomada                    boolean not null,
  pintura                     boolean not null,
  oxidada                     boolean not null,
  picada_por_oxido            boolean not null,
  perforada_desprendimiento   boolean not null,
  pat                         boolean not null,
  prot_diferencial            boolean not null,
  prot_contacto_directo       boolean not null,

  observaciones               text,

  created_at                  timestamptz not null default now()
);

create index if not exists idx_columnas_orden_servicio_id
  on columnas_inspeccionadas (orden_servicio_id);

alter table ordenes_servicio enable row level security;
alter table columnas_inspeccionadas enable row level security;

-- RLS policies: no auth exists yet, so the public anon key is the app's only
-- credential. INSERT is open because that's the core requirement of this stage.
-- SELECT is open too, for read-after-write (insert().select() to get the new
-- order's id) and because this is non-sensitive internal operational data.
-- UPDATE/DELETE are intentionally left with no policy (denied by default under
-- RLS) to limit damage if the public anon key is ever misused; add UPDATE
-- policies later when an edit view ships.

create policy "anon can insert ordenes_servicio"
  on ordenes_servicio for insert
  to anon
  with check (true);

create policy "anon can select ordenes_servicio"
  on ordenes_servicio for select
  to anon
  using (true);

create policy "anon can insert columnas_inspeccionadas"
  on columnas_inspeccionadas for insert
  to anon
  with check (true);

create policy "anon can select columnas_inspeccionadas"
  on columnas_inspeccionadas for select
  to anon
  using (true);
