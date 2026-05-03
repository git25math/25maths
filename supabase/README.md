# Supabase Setup Notes (Member System)

The website exercise product line is retired. Final schema must not expose the
old exercise telemetry tables or exercise-catalog assignment tables.

## Migration File

- `supabase/migrations/20260218000000_member_system_mvp.sql`
- `supabase/migrations/20260218070100_payhip_webhook_event_log.sql`
- `supabase/migrations/20260218211000_payhip_event_log_processing_state.sql`
- `supabase/migrations/20260218214000_payhip_reconcile_lookup_index.sql`
- `supabase/migrations/20260218230000_member_benefit_offers.sql`
- `supabase/migrations/20260227000000_engagement_system.sql`
- `supabase/migrations/20260227010000_b2b_institution_tables.sql`
- `supabase/migrations/20260503080000_retire_exercise_schema.sql`

## Apply Options

1. Supabase SQL Editor:
   - Open SQL Editor in Supabase dashboard.
   - Run the migration SQL file content directly.

2. Supabase CLI (if configured):

```bash
supabase db push
```

## Seed Member Offers (Optional)

Template file:

- `supabase/seed.member_benefit_offers.sql`

Run in SQL Editor after migrations if you want DB-managed coupons/offers immediately.

## Post-Apply Verification (SQL)

```sql
select tablename
from pg_tables
where schemaname = 'public'
  and tablename in (
    'profiles',
    'membership_status',
    'entitlements',
    'payhip_event_log',
    'member_benefit_offers',
    'user_streaks',
    'user_daily_activity',
    'achievement_definitions',
    'user_achievements',
    'user_xp',
    'institutions',
    'institution_members',
    'classes',
    'class_students'
  )
order by tablename;
```

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'profiles',
    'membership_status',
    'entitlements',
    'user_streaks',
    'user_daily_activity',
    'achievement_definitions',
    'user_achievements',
    'user_xp',
    'institutions',
    'institution_members',
    'classes',
    'class_students'
  )
order by tablename;
```

Retired tables should be absent:

```sql
select tablename
from pg_tables
where schemaname = 'public'
  and tablename in (
    'exercise_sessions',
    'question_attempts',
    'assignments',
    'assignment_submissions'
  );
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
