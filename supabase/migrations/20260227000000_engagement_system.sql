-- 25Maths engagement system: streaks, achievements, XP
-- Date: 2026-02-27
-- Spec: plan/specs/STREAK-ACHIEVEMENT-SYSTEM.md

begin;

-- ============================================================
-- 1. User streaks
-- ============================================================

create table if not exists public.user_streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  current_streak integer not null default 0,
  best_streak integer not null default 0,
  last_active_date date,
  freeze_available boolean default false,
  freeze_used_at date,
  total_active_days integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_streaks_current_nonneg check (current_streak >= 0),
  constraint user_streaks_best_nonneg check (best_streak >= 0)
);

drop trigger if exists user_streaks_set_updated_at on public.user_streaks;
create trigger user_streaks_set_updated_at
before update on public.user_streaks
for each row execute function public.set_updated_at();

-- ============================================================
-- 2. Daily activity log
-- ============================================================

create table if not exists public.user_daily_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_date date not null,
  sessions_completed integer default 0,
  questions_answered integer default 0,
  correct_answers integer default 0,
  total_time_seconds integer default 0,
  skills_practiced text[] default '{}',
  qualifies_for_streak boolean generated always as (
    sessions_completed >= 1 and questions_answered >= 5
  ) stored,
  created_at timestamptz not null default now(),
  unique(user_id, activity_date)
);

create index if not exists idx_uda_user_date
  on public.user_daily_activity (user_id, activity_date desc);

-- ============================================================
-- 3. Achievement definitions (seed data inserted separately)
-- ============================================================

create table if not exists public.achievement_definitions (
  id text primary key,
  title_en text not null,
  title_cn text not null,
  description_en text not null,
  description_cn text not null,
  icon text not null default '🏆',
  tier text not null check (tier in ('bronze', 'silver', 'gold', 'diamond')),
  category text not null check (category in (
    'streak', 'volume', 'accuracy', 'mastery', 'speed', 'improvement', 'explorer'
  )),
  criteria jsonb not null,
  xp_reward integer not null default 15,
  is_secret boolean default false,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 4. User achievements
-- ============================================================

create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id text not null references public.achievement_definitions(id),
  unlocked_at timestamptz not null default now(),
  notified boolean default false,
  unique(user_id, achievement_id)
);

create index if not exists idx_ua_user
  on public.user_achievements (user_id);

-- ============================================================
-- 5. XP tracking
-- ============================================================

create table if not exists public.user_xp (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  total_xp integer not null default 0,
  level integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_xp_nonneg check (total_xp >= 0),
  constraint user_xp_level_pos check (level >= 1)
);

drop trigger if exists user_xp_set_updated_at on public.user_xp;
create trigger user_xp_set_updated_at
before update on public.user_xp
for each row execute function public.set_updated_at();

-- ============================================================
-- 6. RLS policies
-- ============================================================

alter table public.user_streaks enable row level security;
alter table public.user_daily_activity enable row level security;
alter table public.achievement_definitions enable row level security;
alter table public.user_achievements enable row level security;
alter table public.user_xp enable row level security;

-- Achievement definitions: readable by everyone (public catalog)
drop policy if exists achievement_defs_select_all on public.achievement_definitions;
create policy achievement_defs_select_all
on public.achievement_definitions
for select
to authenticated
using (true);

-- User streaks: own data only
drop policy if exists user_streaks_select_own on public.user_streaks;
create policy user_streaks_select_own
on public.user_streaks for select to authenticated
using (auth.uid() = user_id);

drop policy if exists user_streaks_insert_own on public.user_streaks;
create policy user_streaks_insert_own
on public.user_streaks for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists user_streaks_update_own on public.user_streaks;
create policy user_streaks_update_own
on public.user_streaks for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Daily activity: own data only
drop policy if exists uda_select_own on public.user_daily_activity;
create policy uda_select_own
on public.user_daily_activity for select to authenticated
using (auth.uid() = user_id);

drop policy if exists uda_insert_own on public.user_daily_activity;
create policy uda_insert_own
on public.user_daily_activity for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists uda_update_own on public.user_daily_activity;
create policy uda_update_own
on public.user_daily_activity for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- User achievements: own data only
drop policy if exists ua_select_own on public.user_achievements;
create policy ua_select_own
on public.user_achievements for select to authenticated
using (auth.uid() = user_id);

drop policy if exists ua_insert_own on public.user_achievements;
create policy ua_insert_own
on public.user_achievements for insert to authenticated
with check (auth.uid() = user_id);

-- User XP: own data only
drop policy if exists ux_select_own on public.user_xp;
create policy ux_select_own
on public.user_xp for select to authenticated
using (auth.uid() = user_id);

drop policy if exists ux_insert_own on public.user_xp;
create policy ux_insert_own
on public.user_xp for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists ux_update_own on public.user_xp;
create policy ux_update_own
on public.user_xp for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

commit;
