begin;

alter table if exists public.payhip_event_log
  add column if not exists handled_status text not null default 'pending';

alter table if exists public.payhip_event_log
  add column if not exists handled_at timestamptz;

alter table if exists public.payhip_event_log
  add column if not exists attempts integer not null default 0;

alter table if exists public.payhip_event_log
  add column if not exists last_error text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'payhip_event_log_handled_status_check'
  ) then
    alter table public.payhip_event_log
      add constraint payhip_event_log_handled_status_check
      check (handled_status in ('pending', 'handled', 'ignored', 'failed'));
  end if;
end $$;

create index if not exists idx_payhip_event_log_handled_status
  on public.payhip_event_log (handled_status, id desc);

commit;
