begin;

create index if not exists idx_payhip_event_log_email_status_id
  on public.payhip_event_log (customer_email, handled_status, id);

commit;
