# Dispatch Self-Heal Ledger

> This file is auto-updated by `dispatch_member_agents.sh`.
> Rule: any failure must be recorded with signature + fix strategy.

## 20260218T123710Z | codex-backend
- Signature: auth_failure
- Fix: auto-retry-once
- Recorded at: 2026-02-18T12:38:14Z

## 20260218T123710Z | codex-backend
- Signature: auth_failure
- Fix: retry_failed_stop_line
- Recorded at: 2026-02-18T12:38:26Z

## 20260218T124247Z | commander-repair
- Signature: codex_auth_env_pollution_and_reasoning_mismatch
- Fix: added preflight codex probe, unset conflicting key envs for codex agents, forced compatible reasoning effort in dispatcher
- Recorded at: 2026-02-18T12:47:30Z

## 20260218T233800Z | commander-repair
- Signature: supabase_migration_history_mismatch_8_digit_version
- Fix: renamed migration `20260218_member_system_mvp.sql` -> `20260218000000_member_system_mvp.sql`, repaired remote history (`reverted 20260218`, `applied 20260218000000`), then revalidated `supabase db push --include-all`
- Recorded at: 2026-02-18T23:38:00Z
## 20260218T205415Z | commander-repair
- Signature: supabase_cli_parallel_auth_race
- Fix: added `dispatch_member_agents.sh gate` command that runs `supabase migration list --linked` and `supabase db push --include-all` sequentially (plus build/node/health checks), avoiding parallel auth contention.
- Recorded at: 2026-02-18T20:58:00Z

