-- 25Maths member system MVP schema
-- Date: 2026-02-18
-- Scope: auth profiles, exercise telemetry, membership status, entitlements

begin;

create extension if not exists pgcrypto;

-- Keep updated_at consistent across tables.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- User profile extensions.
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  target_board text check (target_board in ('cie0580', 'edexcel-4ma1', 'mixed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Exercise session summary per completed run.
create table if not exists public.exercise_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_slug text not null,
  board text not null,
  tier text,
  syllabus_code text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  score integer,
  question_count integer,
  duration_seconds integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exercise_sessions_score_nonnegative check (score is null or score >= 0),
  constraint exercise_sessions_question_count_positive check (question_count is null or question_count > 0),
  constraint exercise_sessions_duration_nonnegative check (duration_seconds is null or duration_seconds >= 0)
);

create index if not exists idx_exercise_sessions_user_id_started_at
  on public.exercise_sessions (user_id, started_at desc);
create index if not exists idx_exercise_sessions_exercise_slug
  on public.exercise_sessions (exercise_slug);

drop trigger if exists exercise_sessions_set_updated_at on public.exercise_sessions;
create trigger exercise_sessions_set_updated_at
before update on public.exercise_sessions
for each row execute function public.set_updated_at();

-- Per-question attempt stream for mistake tracking.
create table if not exists public.question_attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.exercise_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_index integer not null,
  is_correct boolean not null,
  selected_answer integer,
  correct_answer integer,
  skill_tag text,
  created_at timestamptz not null default now(),
  constraint question_attempts_question_index_nonnegative check (question_index >= 0)
);

create index if not exists idx_question_attempts_session_id
  on public.question_attempts (session_id);
create index if not exists idx_question_attempts_user_id_created_at
  on public.question_attempts (user_id, created_at desc);
create index if not exists idx_question_attempts_user_skill
  on public.question_attempts (user_id, skill_tag);

-- Membership status synced from billing system.
create table if not exists public.membership_status (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null check (status in ('active', 'cancelled', 'paused')),
  provider text not null default 'payhip',
  provider_customer_id text,
  period_start timestamptz,
  period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_membership_status_status_period_end
  on public.membership_status (status, period_end);

drop trigger if exists membership_status_set_updated_at on public.membership_status;
create trigger membership_status_set_updated_at
before update on public.membership_status
for each row execute function public.set_updated_at();

-- Fine-grained release access grants.
create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  release_id text not null,
  source text not null check (source in ('payhip', 'member')),
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, release_id, source)
);

create index if not exists idx_entitlements_user_id_release_id
  on public.entitlements (user_id, release_id);

-- RLS enablement.
alter table public.profiles enable row level security;
alter table public.exercise_sessions enable row level security;
alter table public.question_attempts enable row level security;
alter table public.membership_status enable row level security;
alter table public.entitlements enable row level security;

-- Profiles: user can read/write only own row.
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
on public.profiles
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
on public.profiles
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Exercise sessions: user owns own sessions.
drop policy if exists exercise_sessions_select_own on public.exercise_sessions;
create policy exercise_sessions_select_own
on public.exercise_sessions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists exercise_sessions_insert_own on public.exercise_sessions;
create policy exercise_sessions_insert_own
on public.exercise_sessions
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists exercise_sessions_update_own on public.exercise_sessions;
create policy exercise_sessions_update_own
on public.exercise_sessions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Question attempts: user reads and inserts own attempts only.
drop policy if exists question_attempts_select_own on public.question_attempts;
create policy question_attempts_select_own
on public.question_attempts
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists question_attempts_insert_own on public.question_attempts;
create policy question_attempts_insert_own
on public.question_attempts
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.exercise_sessions s
    where s.id = session_id
      and s.user_id = auth.uid()
  )
);

-- Membership status: users can only read own status.
drop policy if exists membership_status_select_own on public.membership_status;
create policy membership_status_select_own
on public.membership_status
for select
to authenticated
using (auth.uid() = user_id);

-- Entitlements: users can only read own grants.
drop policy if exists entitlements_select_own on public.entitlements;
create policy entitlements_select_own
on public.entitlements
for select
to authenticated
using (auth.uid() = user_id);

commit;
