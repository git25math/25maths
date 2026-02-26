-- 25Maths B2B institution platform schema
-- Date: 2026-02-27
-- Spec: plan/specs/B2B-INSTITUTION-PLATFORM.md

begin;

-- ============================================================
-- 1. Extend profiles with role
-- ============================================================

alter table public.profiles
  add column if not exists role text default 'student'
    check (role in ('student', 'teacher', 'institution_admin', 'platform_admin'));

alter table public.profiles
  add column if not exists preferred_lang text default 'en'
    check (preferred_lang in ('en', 'zh-CN'));

alter table public.profiles
  add column if not exists report_cc_email text;

alter table public.profiles
  add column if not exists report_cc_lang text default 'en'
    check (report_cc_lang in ('en', 'zh-CN'));

alter table public.profiles
  add column if not exists weekly_report_enabled boolean default true;

-- ============================================================
-- 2. Institutions
-- ============================================================

create table if not exists public.institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  primary_color text default '#2563eb',
  contact_email text not null,
  contact_phone text,
  contact_wechat text,
  plan text not null default 'starter'
    check (plan in ('starter', 'professional', 'enterprise')),
  max_students integer not null default 50,
  max_teachers integer not null default 5,
  billing_email text,
  billing_cycle text default 'annual'
    check (billing_cycle in ('monthly', 'quarterly', 'annual')),
  features jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz,
  is_active boolean default true
);

drop trigger if exists institutions_set_updated_at on public.institutions;
create trigger institutions_set_updated_at
before update on public.institutions
for each row execute function public.set_updated_at();

-- ============================================================
-- 3. Institution members
-- ============================================================

create table if not exists public.institution_members (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('student', 'teacher', 'admin')),
  display_name text,
  student_number text,
  joined_at timestamptz not null default now(),
  is_active boolean default true,
  unique(institution_id, user_id)
);

create index if not exists idx_im_institution
  on public.institution_members (institution_id);
create index if not exists idx_im_user
  on public.institution_members (user_id);

-- ============================================================
-- 4. Classes
-- ============================================================

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  name text not null,
  board text not null check (board in ('cie0580', 'edexcel-4ma1')),
  tier text,
  teacher_id uuid not null references auth.users(id),
  academic_year text,
  created_at timestamptz not null default now(),
  is_active boolean default true
);

create index if not exists idx_classes_institution
  on public.classes (institution_id);
create index if not exists idx_classes_teacher
  on public.classes (teacher_id);

-- ============================================================
-- 5. Class students
-- ============================================================

create table if not exists public.class_students (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  is_active boolean default true,
  unique(class_id, student_id)
);

create index if not exists idx_cs_class
  on public.class_students (class_id);
create index if not exists idx_cs_student
  on public.class_students (student_id);

-- ============================================================
-- 6. Assignments
-- ============================================================

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  teacher_id uuid not null references auth.users(id),
  class_id uuid not null references public.classes(id) on delete cascade,
  title text not null,
  description text,
  exercise_slugs text[] not null,
  question_count integer,
  difficulty_mode text default 'linear'
    check (difficulty_mode in ('linear', 'adaptive', 'fixed-easy', 'fixed-medium', 'fixed-hard')),
  assigned_at timestamptz not null default now(),
  due_at timestamptz not null,
  late_submission boolean default true,
  show_answers_after text default 'due'
    check (show_answers_after in ('immediately', 'submit', 'due', 'never')),
  allow_retry boolean default false,
  max_retries integer default 1,
  status text default 'active'
    check (status in ('draft', 'active', 'closed')),
  created_at timestamptz not null default now()
);

create index if not exists idx_assignments_class
  on public.assignments (class_id);
create index if not exists idx_assignments_teacher
  on public.assignments (teacher_id);

-- ============================================================
-- 7. Assignment submissions
-- ============================================================

create table if not exists public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid references public.exercise_sessions(id),
  status text default 'not_started'
    check (status in ('not_started', 'in_progress', 'submitted', 'late')),
  score integer,
  question_count integer,
  accuracy_pct numeric(4,1),
  time_spent_seconds integer,
  started_at timestamptz,
  submitted_at timestamptz,
  unique(assignment_id, student_id)
);

create index if not exists idx_asub_assignment
  on public.assignment_submissions (assignment_id);
create index if not exists idx_asub_student
  on public.assignment_submissions (student_id);

-- ============================================================
-- 8. RLS policies
-- ============================================================

alter table public.institutions enable row level security;
alter table public.institution_members enable row level security;
alter table public.classes enable row level security;
alter table public.class_students enable row level security;
alter table public.assignments enable row level security;
alter table public.assignment_submissions enable row level security;

-- Institutions: members can read their own institution
drop policy if exists inst_select_member on public.institutions;
create policy inst_select_member
on public.institutions for select to authenticated
using (
  id in (
    select institution_id from public.institution_members
    where user_id = auth.uid() and is_active = true
  )
);

-- Institution members: admins/teachers can manage; members can view own
drop policy if exists im_select on public.institution_members;
create policy im_select
on public.institution_members for select to authenticated
using (
  user_id = auth.uid()
  or institution_id in (
    select institution_id from public.institution_members
    where user_id = auth.uid() and role in ('admin', 'teacher') and is_active = true
  )
);

drop policy if exists im_insert on public.institution_members;
create policy im_insert
on public.institution_members for insert to authenticated
with check (
  institution_id in (
    select institution_id from public.institution_members
    where user_id = auth.uid() and role = 'admin' and is_active = true
  )
);

drop policy if exists im_update on public.institution_members;
create policy im_update
on public.institution_members for update to authenticated
using (
  institution_id in (
    select institution_id from public.institution_members
    where user_id = auth.uid() and role = 'admin' and is_active = true
  )
);

-- Classes: teachers and admins can manage; students can view enrolled
drop policy if exists classes_select on public.classes;
create policy classes_select
on public.classes for select to authenticated
using (
  teacher_id = auth.uid()
  or institution_id in (
    select institution_id from public.institution_members
    where user_id = auth.uid() and role in ('admin', 'teacher') and is_active = true
  )
  or id in (
    select class_id from public.class_students
    where student_id = auth.uid() and is_active = true
  )
);

drop policy if exists classes_insert on public.classes;
create policy classes_insert
on public.classes for insert to authenticated
with check (
  institution_id in (
    select institution_id from public.institution_members
    where user_id = auth.uid() and role in ('admin', 'teacher') and is_active = true
  )
);

drop policy if exists classes_update on public.classes;
create policy classes_update
on public.classes for update to authenticated
using (
  teacher_id = auth.uid()
  or institution_id in (
    select institution_id from public.institution_members
    where user_id = auth.uid() and role = 'admin' and is_active = true
  )
);

-- Class students: teachers/admins manage; students view own enrollment
drop policy if exists cs_select on public.class_students;
create policy cs_select
on public.class_students for select to authenticated
using (
  student_id = auth.uid()
  or class_id in (
    select id from public.classes
    where teacher_id = auth.uid()
  )
  or class_id in (
    select c.id from public.classes c
    join public.institution_members im on im.institution_id = c.institution_id
    where im.user_id = auth.uid() and im.role = 'admin' and im.is_active = true
  )
);

drop policy if exists cs_insert on public.class_students;
create policy cs_insert
on public.class_students for insert to authenticated
with check (
  class_id in (
    select id from public.classes where teacher_id = auth.uid()
  )
  or class_id in (
    select c.id from public.classes c
    join public.institution_members im on im.institution_id = c.institution_id
    where im.user_id = auth.uid() and im.role = 'admin' and im.is_active = true
  )
);

-- Assignments: teachers create; students view their class assignments
drop policy if exists assign_select on public.assignments;
create policy assign_select
on public.assignments for select to authenticated
using (
  teacher_id = auth.uid()
  or class_id in (
    select class_id from public.class_students
    where student_id = auth.uid() and is_active = true
  )
  or institution_id in (
    select institution_id from public.institution_members
    where user_id = auth.uid() and role = 'admin' and is_active = true
  )
);

drop policy if exists assign_insert on public.assignments;
create policy assign_insert
on public.assignments for insert to authenticated
with check (teacher_id = auth.uid());

drop policy if exists assign_update on public.assignments;
create policy assign_update
on public.assignments for update to authenticated
using (teacher_id = auth.uid());

-- Assignment submissions: students own their submissions; teachers view class submissions
drop policy if exists asub_select on public.assignment_submissions;
create policy asub_select
on public.assignment_submissions for select to authenticated
using (
  student_id = auth.uid()
  or assignment_id in (
    select id from public.assignments where teacher_id = auth.uid()
  )
  or assignment_id in (
    select a.id from public.assignments a
    join public.institution_members im on im.institution_id = a.institution_id
    where im.user_id = auth.uid() and im.role = 'admin' and im.is_active = true
  )
);

drop policy if exists asub_insert on public.assignment_submissions;
create policy asub_insert
on public.assignment_submissions for insert to authenticated
with check (student_id = auth.uid());

drop policy if exists asub_update on public.assignment_submissions;
create policy asub_update
on public.assignment_submissions for update to authenticated
using (student_id = auth.uid());

commit;
