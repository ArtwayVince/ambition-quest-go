-- JET OFF vendor media portal. Run in Supabase SQL Editor.
-- Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the app environment.
-- Media objects are PRIVATE. Only vendor owners, admins, and visitors viewing approved media
-- can obtain short-lived signed URLs through the Storage API.
create extension if not exists pgcrypto;

create table if not exists public.venue_media (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 venue_name text not null check (char_length(venue_name) between 2 and 120),
 stop_id text not null check (char_length(stop_id) between 1 and 80),
 media_type text not null check (media_type in ('image','video')),
 -- Storage object path, e.g. <auth-user-uuid>/<filename>; not a public URL.
 public_url text not null,
 caption text not null default '',
 status text not null default 'pending' check (status in ('pending','approved','rejected')),
 sort_order integer not null default 0,
 created_at timestamptz not null default now()
);

alter table public.venue_media enable row level security;
grant select, insert, update, delete on public.venue_media to authenticated;
grant select on public.venue_media to anon;

drop policy if exists "vendors read own media" on public.venue_media;
create policy "vendors read own media" on public.venue_media
 for select to authenticated
 using (auth.uid() = user_id or status = 'approved' or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "public read approved media" on public.venue_media;
create policy "public read approved media" on public.venue_media
 for select to anon using (status = 'approved');

drop policy if exists "vendors submit own media" on public.venue_media;
create policy "vendors submit own media" on public.venue_media
 for insert to authenticated with check (auth.uid() = user_id and status = 'pending');

drop policy if exists "vendors update own pending media" on public.venue_media;
create policy "vendors update own pending media" on public.venue_media
 for update to authenticated
 using (auth.uid() = user_id and status = 'pending')
 with check (auth.uid() = user_id and status = 'pending');

drop policy if exists "admins read all venue media" on public.venue_media;
create policy "admins read all venue media" on public.venue_media
 for select to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admins moderate venue media" on public.venue_media;
create policy "admins moderate venue media" on public.venue_media
 for update to authenticated
 using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
 with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Private bucket: approved records do not make the underlying object publicly addressable.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('jetoff-venue-media','jetoff-venue-media',false,104857600,
 array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime'])
on conflict (id) do update set public=false, file_size_limit=104857600, allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "vendors upload own media objects" on storage.objects;
create policy "vendors upload own media objects" on storage.objects
 for insert to authenticated
 with check (bucket_id='jetoff-venue-media' and (storage.foldername(name))[1]=auth.uid()::text);

drop policy if exists "vendors read own media objects" on storage.objects;
create policy "vendors read own media objects" on storage.objects
 for select to public
 using (
   bucket_id='jetoff-venue-media'
   and (
     (storage.foldername(name))[1]=auth.uid()::text
     or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
     or exists (
       select 1 from public.venue_media vm
       where vm.public_url = name and vm.status = 'approved'
     )
   )
);

drop policy if exists "public read venue media objects" on storage.objects;
-- Do not grant public object reads. Approved visitors receive time-limited signed URLs only.
