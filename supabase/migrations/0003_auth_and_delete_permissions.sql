-- Login con roles (superusuario / usuario normal) y borrado con permisos.
-- A partir de esta migración la app requiere estar autenticado.

-- Perfil de usuario con rol. Se crea automáticamente para cada usuario que
-- se da de alta en auth.users (incluso si se crea a mano desde el dashboard
-- de Supabase, que es el flujo elegido: alta solo por invitación).
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  role       text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "los usuarios pueden ver su propio perfil"
  on profiles for select
  to authenticated
  using (id = auth.uid());

-- Sin política de insert/update para "authenticated": nadie puede
-- auto-promoverse a admin llamando a la API directamente.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Chequeo de admin usado dentro de las políticas de borrado. security
-- definer para poder leer "profiles" sin quedar sujeta a su propio RLS
-- (evitaría recursión si no fuera security definer).
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- Quién cargó cada orden, para poder restringir el borrado a su dueño.
-- Las órdenes cargadas antes de esta migración (sin auth) quedan con
-- created_by = null: solo el admin podrá borrarlas.
alter table ordenes_servicio
  add column if not exists created_by uuid references auth.users(id) default auth.uid();

-- Se reemplazan las políticas abiertas para "anon" por políticas para
-- "authenticated", y se agregan las de DELETE.
drop policy if exists "anon can insert ordenes_servicio" on ordenes_servicio;
drop policy if exists "anon can select ordenes_servicio" on ordenes_servicio;
drop policy if exists "anon can insert columnas_inspeccionadas" on columnas_inspeccionadas;
drop policy if exists "anon can select columnas_inspeccionadas" on columnas_inspeccionadas;

create policy "usuarios autenticados pueden insertar ordenes"
  on ordenes_servicio for insert
  to authenticated
  with check (true);

create policy "usuarios autenticados pueden ver ordenes"
  on ordenes_servicio for select
  to authenticated
  using (true);

create policy "el creador o un admin puede borrar la orden"
  on ordenes_servicio for delete
  to authenticated
  using (created_by = auth.uid() or public.is_admin());

create policy "usuarios autenticados pueden insertar columnas"
  on columnas_inspeccionadas for insert
  to authenticated
  with check (true);

create policy "usuarios autenticados pueden ver columnas"
  on columnas_inspeccionadas for select
  to authenticated
  using (true);

create policy "el creador de la orden o un admin puede borrar la columna"
  on columnas_inspeccionadas for delete
  to authenticated
  using (
    exists (
      select 1 from ordenes_servicio o
      where o.id = columnas_inspeccionadas.orden_servicio_id
        and (o.created_by = auth.uid() or public.is_admin())
    )
  );
