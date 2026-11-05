-- Reusable venue foundation for Ambition Quest Go.
-- Run this AFTER venue-media-setup.sql in the Supabase SQL Editor.
-- Existing Yuby media/tour-point rows remain compatible while gaining a stable venue_id.

create extension if not exists pgcrypto;

create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 2 and 120),
  description text not null default '',
  location text not null default 'Location to be confirmed',
  address text not null default '',
  status text not null default 'pending'
    check (status in ('pending','approved','rejected','suspended')),
  owner_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists venues_owner_user_id_idx on public.venues(owner_user_id);
create index if not exists venues_status_name_idx on public.venues(status, name);

alter table public.venue_media
  add column if not exists venue_id uuid references public.venues(id) on delete cascade;

alter table public.venue_tour_stops
  add column if not exists venue_id uuid references public.venues(id) on delete cascade;

-- Seed the existing pilot as a venue record. Its current prototype visibility is preserved.
insert into public.venues (slug, name, description, location, status)
values (
  'yuby-resort',
  'Yuby Resort',
  'Explore the resort, its facilities and proposed activities before planning a visit.',
  'Location to be confirmed',
  'approved'
)
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description;

-- Associate existing media and custom tour points with the stable venue record.
update public.venue_media vm
set venue_id = v.id
from public.venues v
where vm.venue_id is null
  and lower(trim(vm.venue_name)) = lower(trim(v.name));

update public.venue_tour_stops vs
set venue_id = v.id
from public.venues v
where vs.venue_id is null
  and lower(trim(vs.venue_name)) = lower(trim(v.name));

create index if not exists venue_media_venue_stop_idx
  on public.venue_media(venue_id, stop_id, status, sort_order);
create index if not exists venue_tour_stops_venue_idx
  on public.venue_tour_stops(venue_id, status, created_at);

-- Venue-owned experiences are separate records: one venue can offer many experiences,
-- and the same kind of experience can be offered by multiple venues.
create table if not exists public.venue_experiences (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  title text not null check (char_length(title) between 2 and 120),
  summary text not null default '',
  category text not null default 'Experience & Enjoyment',
  location_details text not null default '',
  price_label text not null default 'Pending verification',
  requirements jsonb not null default '[]'::jsonb
    check (jsonb_typeof(requirements) = 'array'),
  status text not null default 'pending'
    check (status in ('pending','approved','rejected','suspended')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists venue_experiences_venue_status_idx
  on public.venue_experiences(venue_id, status, sort_order);

alter table public.venues enable row level security;
alter table public.venue_experiences enable row level security;

grant select, insert, update on public.venues to authenticated;
grant select on public.venues to anon;
grant select, insert, update, delete on public.venue_experiences to authenticated;
grant select on public.venue_experiences to anon;

drop policy if exists "public read approved venues" on public.venues;
create policy "public read approved venues" on public.venues
  for select to anon using (status = 'approved');

drop policy if exists "authenticated read approved or owned venues" on public.venues;
create policy "authenticated read approved or owned venues" on public.venues
  for select to authenticated
  using (
    status = 'approved'
    or owner_user_id = auth.uid()
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

drop policy if exists "vendors create venue profiles" on public.venues;
create policy "vendors create venue profiles" on public.venues
  for insert to authenticated
  with check (owner_user_id = auth.uid() and status = 'pending');

drop policy if exists "vendors update own venue profiles" on public.venues;
create policy "vendors update own venue profiles" on public.venues
  for update to authenticated
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid() and status = 'pending');

drop policy if exists "admins moderate venues" on public.venues;
create policy "admins moderate venues" on public.venues
  for update to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "public read approved venue experiences" on public.venue_experiences;
create policy "public read approved venue experiences" on public.venue_experiences
  for select to anon using (
    status = 'approved'
    and exists (select 1 from public.venues v where v.id = venue_id and v.status = 'approved')
  );

drop policy if exists "authenticated read approved or owned venue experiences" on public.venue_experiences;
create policy "authenticated read approved or owned venue experiences" on public.venue_experiences
  for select to authenticated using (
    (status = 'approved' and exists (
      select 1 from public.venues v where v.id = venue_id and v.status = 'approved'
    ))
    or created_by = auth.uid()
    or exists (select 1 from public.venues v where v.id = venue_id and v.owner_user_id = auth.uid())
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

drop policy if exists "venue owners submit experiences" on public.venue_experiences;
create policy "venue owners submit experiences" on public.venue_experiences
  for insert to authenticated with check (
    created_by = auth.uid()
    and status = 'pending'
    and exists (select 1 from public.venues v where v.id = venue_id and v.owner_user_id = auth.uid())
  );

drop policy if exists "venue owners update own pending experiences" on public.venue_experiences;
create policy "venue owners update own pending experiences" on public.venue_experiences
  for update to authenticated
  using (exists (
    select 1 from public.venues v where v.id = venue_id and v.owner_user_id = auth.uid()
  ))
  with check (
    status = 'pending'
    and exists (select 1 from public.venues v where v.id = venue_id and v.owner_user_id = auth.uid())
  );

drop policy if exists "venue owners delete own experiences" on public.venue_experiences;
create policy "venue owners delete own experiences" on public.venue_experiences
  for delete to authenticated
  using (exists (
    select 1 from public.venues v where v.id = venue_id and v.owner_user_id = auth.uid()
  ));

drop policy if exists "admins moderate venue experiences" on public.venue_experiences;
create policy "admins moderate venue experiences" on public.venue_experiences
  for update to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


-- New media and tour-point submissions must belong to a venue owned by the submitting account.
-- Null venue_id remains permitted only for older legacy records during migration.
drop policy if exists "vendors submit own media" on public.venue_media;
create policy "vendors submit own media" on public.venue_media
  for insert to authenticated with check (
    auth.uid() = user_id and status = 'pending'
    and venue_id is not null
    and exists (
      select 1 from public.venues v where v.id = venue_id and v.owner_user_id = auth.uid()
    )
  );

drop policy if exists "vendors update own pending media" on public.venue_media;
create policy "vendors update own pending media" on public.venue_media
  for update to authenticated
  using (auth.uid() = user_id and status = 'pending')
  with check (
    auth.uid() = user_id and status = 'pending'
    and venue_id is not null
    and exists (
      select 1 from public.venues v where v.id = venue_id and v.owner_user_id = auth.uid()
    )
  );

drop policy if exists "vendors add own tour points" on public.venue_tour_stops;
create policy "vendors add own tour points" on public.venue_tour_stops
  for insert to authenticated with check (
    auth.uid() = user_id and status = 'pending'
    and (venue_id is null or exists (
      select 1 from public.venues v where v.id = venue_id and v.owner_user_id = auth.uid()
    ))
  );

drop policy if exists "vendors edit own pending tour points" on public.venue_tour_stops;
create policy "vendors edit own pending tour points" on public.venue_tour_stops
  for update to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id and status = 'pending'
    and (venue_id is null or exists (
      select 1 from public.venues v where v.id = venue_id and v.owner_user_id = auth.uid()
    ))
  );

-- Keep the legacy venue_name columns during the transition; new app code should use venue_id.
