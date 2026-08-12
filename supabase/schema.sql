-- ============================================================
-- COBBIT Hackathon #01 — Supabase schema
-- Run this once in Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. PROFILES ---------------------------------------------------
-- One row per authenticated user (created automatically on signup)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  role text not null default 'participant' check (role in ('participant', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Admins can view every profile (needed for the admin dashboard)
create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Auto-create a profile row whenever someone signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. REGISTRATIONS ------------------------------------------------
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('individual', 'team')),
  team_name text,
  -- members: array of { full_name, email, phone, university, university_email, student_id_proof_url }
  -- individual = 1 member, team = exactly 3 members (leader + 2)
  members jsonb not null,
  fee_amount int not null check (fee_amount in (300, 500)),
  transaction_id text not null,
  payment_screenshot_url text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id) -- one registration per account
);

alter table public.registrations enable row level security;

create policy "Users can view their own registration"
  on public.registrations for select
  using (auth.uid() = profile_id);

create policy "Users can insert their own registration"
  on public.registrations for insert
  with check (auth.uid() = profile_id);

create policy "Admins can view all registrations"
  on public.registrations for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Admins can update all registrations"
  on public.registrations for update
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );


-- 3. SUBMISSIONS ---------------------------------------------------
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations(id) on delete cascade unique,
  project_title text,
  description text,
  repo_url text,
  demo_url text,
  video_url text,
  status text not null default 'not_submitted' check (status in ('not_submitted', 'submitted', 'winner')),
  submitted_at timestamptz
);

alter table public.submissions enable row level security;

create policy "Users can view their own submission"
  on public.submissions for select
  using (
    exists (select 1 from public.registrations r where r.id = registration_id and r.profile_id = auth.uid())
  );

create policy "Users can insert their own submission"
  on public.submissions for insert
  with check (
    exists (select 1 from public.registrations r where r.id = registration_id and r.profile_id = auth.uid() and r.status = 'approved')
  );

create policy "Users can update their own submission"
  on public.submissions for update
  using (
    exists (select 1 from public.registrations r where r.id = registration_id and r.profile_id = auth.uid())
  );

create policy "Admins can view all submissions"
  on public.submissions for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Admins can update all submissions"
  on public.submissions for update
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Auto-create an empty submission row when a registration is approved
create or replace function public.handle_registration_approved()
returns trigger as $$
begin
  if new.status = 'approved' and old.status is distinct from 'approved' then
    insert into public.submissions (registration_id)
    values (new.id)
    on conflict (registration_id) do nothing;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_registration_approved on public.registrations;
create trigger on_registration_approved
  after update on public.registrations
  for each row execute procedure public.handle_registration_approved();


-- 4. STORAGE BUCKETS -------------------------------------------------
-- Payment screenshots + student ID proofs. Private buckets — accessed via signed URLs.
insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('student-ids', 'student-ids', false)
on conflict (id) do nothing;

create policy "Users can upload their own payment proof"
  on storage.objects for insert
  with check (bucket_id = 'payment-proofs' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can view their own payment proof"
  on storage.objects for select
  using (bucket_id = 'payment-proofs' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Admins can view all payment proofs"
  on storage.objects for select
  using (
    bucket_id = 'payment-proofs' and
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Users can upload their own student id"
  on storage.objects for insert
  with check (bucket_id = 'student-ids' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can view their own student id"
  on storage.objects for select
  using (bucket_id = 'student-ids' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Admins can view all student ids"
  on storage.objects for select
  using (
    bucket_id = 'student-ids' and
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );


-- 5. CERTIFICATES ---------------------------------------------------
-- One row per certificate per person (a team of 3 produces 3 participation
-- rows; the winning team also gets 3 appreciation rows).
create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations(id) on delete cascade,
  member_index int not null, -- 0 = leader, 1/2 = teammates
  recipient_name text not null,
  recipient_email text not null,
  type text not null check (type in ('participation', 'appreciation')),
  certificate_number text not null unique,
  storage_path text not null,
  issued_at timestamptz not null default now()
);

alter table public.certificates enable row level security;

create policy "Users can view certificates tied to their registration"
  on public.certificates for select
  using (
    exists (select 1 from public.registrations r where r.id = registration_id and r.profile_id = auth.uid())
  );

create policy "Admins can view all certificates"
  on public.certificates for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

insert into storage.buckets (id, name, public)
values ('certificates', 'certificates', false)
on conflict (id) do nothing;

create policy "Users can view their own certificates in storage"
  on storage.objects for select
  using (
    bucket_id = 'certificates' and
    exists (
      select 1 from public.registrations r
      where r.id::text = (storage.foldername(name))[1] and r.profile_id = auth.uid()
    )
  );

create policy "Admins can view all certificate files"
  on storage.objects for select
  using (
    bucket_id = 'certificates' and
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );


-- 6. EVENT SETTINGS ---------------------------------------------------
-- Single row holding everything that changes between hackathons: dates,
-- prize amount, and community links. Admin edits this from the dashboard;
-- the public site and emails read from it instead of hardcoded values.
create table if not exists public.event_settings (
  id int primary key default 1,
  event_name text not null default 'COBBIT Hackathon #01',
  registration_start date not null default '2026-08-10',
  registration_end date not null default '2026-08-30',
  hackathon_start date not null default '2026-08-31',
  hackathon_end date not null default '2026-09-06',
  submission_deadline date not null default '2026-09-06',
  prize_amount text default '', -- empty = "to be announced" on the site
  discord_link text default '',
  whatsapp_link text default 'https://chat.whatsapp.com/G3IJ8BOK2Xm0hiOdnoNctr',
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

insert into public.event_settings (id) values (1) on conflict (id) do nothing;

alter table public.event_settings enable row level security;

-- Anyone (including logged-out visitors) can read settings — the homepage needs this.
create policy "Anyone can view event settings"
  on public.event_settings for select
  using (true);

create policy "Admins can update event settings"
  on public.event_settings for update
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );


-- 7. MAKE YOURSELF ADMIN ----------------------------------------------
-- After you sign up on the site with your own admin email, run this once
-- (replace the email) to promote that account to admin:
--
-- update public.profiles set role = 'admin' where email = 'you@example.com';
