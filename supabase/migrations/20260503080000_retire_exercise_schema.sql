-- Retire website exercise product-line schema.
-- Date: 2026-05-03
--
-- The public website no longer has exercise pages, player JS, or write APIs.
-- Keep institution/class/account tables, but remove the old telemetry tables and
-- the assignment tables that depended on the removed exercise catalog.

begin;

drop table if exists public.assignment_submissions cascade;
drop table if exists public.assignments cascade;
drop table if exists public.question_attempts cascade;
drop table if exists public.exercise_sessions cascade;

commit;
