# Supabase Setup Notes (Member System)

## Migration File

- `supabase/migrations/20260218000000_member_system_mvp.sql`
- `supabase/migrations/20260218070100_payhip_webhook_event_log.sql`
- `supabase/migrations/20260218211000_payhip_event_log_processing_state.sql`
- `supabase/migrations/20260218214000_payhip_reconcile_lookup_index.sql`
- `supabase/migrations/20260218230000_member_benefit_offers.sql`

## Apply Options

1. Supabase SQL Editor:
   - Open SQL Editor in Supabase dashboard.
   - Run the migration SQL file content directly.

2. Supabase CLI (if configured):

```bash
supabase db push
```

## Post-Apply Verification (SQL)

```sql
select tablename
from pg_tables
where schemaname = 'public'
  and tablename in (
    'profiles',
    'exercise_sessions',
    'question_attempts',
    'membership_status',
    'entitlements'
  )
order by tablename;
```

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'profiles',
    'exercise_sessions',
    'question_attempts',
    'membership_status',
    'entitlements'
  )
order by tablename;
```

## Frontend Auth Bootstrap Config

Update `_config.yml`:

```yaml
supabase:
  enabled: true
  url: "https://<project-ref>.supabase.co"
  anon_key: "sb_publishable_..."
```

Use the `Project URL` and `Publishable Key` from Supabase dashboard.
