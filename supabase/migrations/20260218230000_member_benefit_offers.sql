begin;

create table if not exists public.member_benefit_offers (
  id text primary key,
  kind text not null default 'benefit',
  title text not null,
  description text,
  cta_label text,
  cta_url text,
  coupon_code text,
  available_for text not null default 'paid',
  is_active boolean not null default true,
  priority integer not null default 100,
  starts_at timestamptz,
  ends_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint member_benefit_offers_available_for_check
    check (available_for in ('all', 'free', 'paid'))
);

create index if not exists idx_member_benefit_offers_active_priority
  on public.member_benefit_offers (is_active, available_for, priority, created_at desc);

alter table public.member_benefit_offers enable row level security;

do $$
begin
  if exists (
    select 1
    from pg_proc
    where proname = 'set_updated_at'
      and pg_function_is_visible(oid)
  ) then
    drop trigger if exists member_benefit_offers_set_updated_at on public.member_benefit_offers;
    create trigger member_benefit_offers_set_updated_at
    before update on public.member_benefit_offers
    for each row execute function public.set_updated_at();
  end if;
end $$;

commit;
