-- Demo accounts + test data seed script
-- Date: 2026-02-27
--
-- USAGE:
--   1. First create auth users via Supabase Dashboard or Admin API:
--      - demo-student@25maths.com (password: Demo2026!Student)
--      - demo-teacher@25maths.com (password: Demo2026!Teacher)
--   2. Get their UUIDs from auth.users table
--   3. Replace the placeholder UUIDs below with real ones
--   4. Run this script in Supabase SQL Editor
--
-- Alternatively, run the companion script:
--   node scripts/seed_demo_accounts.js

-- ============================================================
-- STEP 0: Set demo user UUIDs (REPLACE THESE)
-- ============================================================

do $$
declare
  v_student_id uuid := '00000000-0000-0000-0000-000000000001'; -- REPLACE with real UUID
  v_teacher_id uuid := '00000000-0000-0000-0000-000000000002'; -- REPLACE with real UUID
  v_institution_id uuid;
  v_class_id uuid;
  v_day_offset integer;
  v_qcount integer;
  v_correct integer;
  v_duration integer;
  v_skill text;
begin

-- ============================================================
-- STEP 1: Profiles
-- ============================================================

insert into public.profiles (user_id, display_name, target_board, role, preferred_lang)
values
  (v_student_id, 'Demo Student (王小明)', 'cie0580', 'student', 'en'),
  (v_teacher_id, 'Demo Teacher (张老师)', 'mixed', 'teacher', 'zh-CN')
on conflict (user_id) do update set
  display_name = excluded.display_name,
  role = excluded.role;

-- ============================================================
-- STEP 2: Membership status (teacher = active member)
-- ============================================================

insert into public.membership_status (user_id, status, provider, period_start, period_end)
values
  (v_teacher_id, 'active', 'demo', now(), now() + interval '1 year')
on conflict (user_id) do update set
  status = 'active',
  period_end = now() + interval '1 year';

-- ============================================================
-- STEP 3: Institution + class + enrollment
-- ============================================================

insert into public.institutions (id, name, slug, contact_email, plan, max_students, max_teachers)
values (gen_random_uuid(), 'Demo Academy 示范学院', 'demo-academy', 'demo@25maths.com', 'professional', 100, 10)
returning id into v_institution_id;

insert into public.institution_members (institution_id, user_id, role, display_name)
values
  (v_institution_id, v_teacher_id, 'admin', 'Demo Teacher'),
  (v_institution_id, v_student_id, 'student', 'Demo Student');

insert into public.classes (id, institution_id, name, board, tier, teacher_id, academic_year)
values (gen_random_uuid(), v_institution_id, 'CIE 0580 Extended Demo Class', 'cie0580', 'Extended', v_teacher_id, '2025-2026')
returning id into v_class_id;

insert into public.class_students (class_id, student_id)
values (v_class_id, v_student_id);

-- ============================================================
-- STEP 4: Generate 30 days of resource-based learning activity
-- ============================================================

for v_day_offset in 0..29 loop
  v_skill := (array[
    'C1-04',
    'C1-13',
    'C2-05',
    'C3-03',
    'C4-06',
    'C5-04',
    'E6-05',
    'E8-04'
  ])[1 + floor(random() * 8)::int];

  v_qcount := 8 + floor(random() * 5)::int; -- 8-12 questions
  v_correct := floor(v_qcount * (0.55 + random() * 0.40))::int; -- 55-95% accuracy
  v_duration := 180 + floor(random() * 420)::int; -- 3-10 minutes

  insert into public.user_daily_activity
    (user_id, activity_date, sessions_completed, questions_answered, correct_answers, total_time_seconds, skills_practiced)
  values (
    v_student_id,
    current_date - v_day_offset,
    1,
    v_qcount,
    v_correct,
    v_duration,
    array[v_skill]
  )
  on conflict (user_id, activity_date) do update set
    sessions_completed = excluded.sessions_completed,
    questions_answered = excluded.questions_answered,
    correct_answers = excluded.correct_answers,
    total_time_seconds = excluded.total_time_seconds,
    skills_practiced = excluded.skills_practiced;
end loop;

-- ============================================================
-- STEP 5: Streak data for student
-- ============================================================

insert into public.user_streaks (user_id, current_streak, best_streak, last_active_date, total_active_days)
values (v_student_id, 12, 18, current_date - 1, 25)
on conflict (user_id) do update set
  current_streak = 12, best_streak = 18, last_active_date = current_date - 1, total_active_days = 25;

-- ============================================================
-- STEP 6: XP and achievements for student
-- ============================================================

insert into public.user_xp (user_id, total_xp, level)
values (v_student_id, 340, 4)
on conflict (user_id) do update set total_xp = 340, level = 4;

-- Unlock some achievements
insert into public.user_achievements (user_id, achievement_id, unlocked_at, notified)
values
  (v_student_id, 'streak-3', now() - interval '20 days', true),
  (v_student_id, 'streak-7', now() - interval '12 days', true),
  (v_student_id, 'volume-10', now() - interval '10 days', true),
  (v_student_id, 'accuracy-80-5', now() - interval '5 days', true),
  (v_student_id, 'explorer-5', now() - interval '3 days', true)
on conflict (user_id, achievement_id) do nothing;

raise notice 'Demo data seeded successfully!';
raise notice 'Student UUID: %', v_student_id;
raise notice 'Teacher UUID: %', v_teacher_id;
raise notice 'Institution: % (slug: demo-academy)', v_institution_id;
raise notice 'Class: %', v_class_id;

end $$;
