-- Dynamic venue tour points and safe vendor deletion.
-- Run once in Supabase SQL Editor after the existing venue-media setup.
create table if not exists public.venue_tour_stops (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  venue_name text not null check (char_length(venue_name) between 2 and 120),
  name text not null check (char_length(name) between 2 and 100),
  info text not null default '',
  protocol text not null default '',
  x integer not null default 50 check (x between 5 and 95),
  y integer not null default 50 check (y between 5 and 95),
  created_at timestamptz not null default now()
);
alter table public.venue_tour_stops enable row level security;
grant select on public.venue_tour_stops to anon, authenticated;
grant insert, update, delete on public.venue_tour_stops to authenticated;
drop policy if exists "public read venue tour points" on public.venue_tour_stops;
create policy "public read venue tour points" on public.venue_tour_stops
 for select to anon, authenticated using (true);
drop policy if exists "vendors add own venue tour points" on public.venue_tour_stops;
create policy "vendors add own venue tour points" on public.venue_tour_stops
 for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "vendors update own venue tour points" on public.venue_tour_stops;
create policy "vendors update own venue tour points" on public.venue_tour_stops
 for update to authenticated using (auth.uid() = user_id)
 with check (auth.uid() = user_id);
drop policy if exists "vendors delete own venue tour points" on public.venue_tour_stops;
create policy "vendors delete own venue tour points" on public.venue_tour_stops
 for delete to authenticated using (auth.uid() = user_id);

drop policy if exists "vendors delete own media rows" on public.venue_media;
create policy "vendors delete own media rows" on public.venue_media
 for delete to authenticated using (auth.uid() = user_id);
drop policy if exists "vendors delete own media objects" on storage.objects;
create policy "vendors delete own media objects" on storage.objects
 for delete to authenticated
 using (bucket_id='jetoff-venue-media' and (storage.foldername(name))[1]=auth.uid()::text);
