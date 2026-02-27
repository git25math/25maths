#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PLAN_FILE="${ROOT}/plan/MEMBER-LEARNING-PLATFORM-EXECUTION-PLAN.md"
COMMAND_CENTER_FILE="${ROOT}/plan/MEMBER-SYSTEM-COMMAND-CENTER.md"
WORKBOARD_FILE="${ROOT}/plan/MEMBER-SYSTEM-WORKBOARD.md"
RUN_ROOT="${ROOT}/plan/member-agent-runs"
SELF_HEAL_FILE="${ROOT}/scripts/member/dispatch_member_agents.selfheal.md"

MODEL_GEMINI_FLASH="${MODEL_GEMINI_FLASH:-gemini-2.5-flash}"
MODEL_GEMINI_PRO="${MODEL_GEMINI_PRO:-gemini-2.5-pro}"
MODEL_CODEX="${MODEL_CODEX:-gpt-5}"

usage() {
  cat <<'USAGE'
Usage:
  bash scripts/member/dispatch_member_agents.sh preflight
  bash scripts/member/dispatch_member_agents.sh kickoff
  bash scripts/member/dispatch_member_agents.sh status
  bash scripts/member/dispatch_member_agents.sh gate
  bash scripts/member/dispatch_member_agents.sh qa

Environment variables:
  MODEL_CODEX          Default: gpt-5
  MODEL_GEMINI_FLASH   Default: gemini-2.5-flash
  MODEL_GEMINI_PRO     Default: gemini-2.5-pro
USAGE
}

log() {
  printf '[dispatch] %s\n' "$*"
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

latest_run_dir() {
  if [[ ! -d "${RUN_ROOT}" ]]; then
    return 1
  fi
  ls -1d "${RUN_ROOT}"/* 2>/dev/null | sort | tail -n 1
}

ensure_files() {
  [[ -f "${PLAN_FILE}" ]] || { echo "Missing ${PLAN_FILE}" >&2; exit 1; }
  [[ -f "${COMMAND_CENTER_FILE}" ]] || { echo "Missing ${COMMAND_CENTER_FILE}" >&2; exit 1; }
  [[ -f "${WORKBOARD_FILE}" ]] || { echo "Missing ${WORKBOARD_FILE}" >&2; exit 1; }
}

ensure_self_heal_file() {
  mkdir -p "$(dirname "${SELF_HEAL_FILE}")"
  if [[ ! -f "${SELF_HEAL_FILE}" ]]; then
    cat > "${SELF_HEAL_FILE}" <<'EOF_HEAL'
# Dispatch Self-Heal Ledger

> This file is auto-updated by `dispatch_member_agents.sh`.
> Rule: any failure must be recorded with signature + fix strategy.

EOF_HEAL
  fi
}

append_self_heal_entry() {
  local run_id="$1"
  local agent="$2"
  local signature="$3"
  local fix="$4"

  {
    echo "## ${run_id} | ${agent}"
    echo "- Signature: ${signature}"
    echo "- Fix: ${fix}"
    echo "- Recorded at: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo
  } >> "${SELF_HEAL_FILE}"
}

run_cmd_with_env_fix() {
  local fix_mode="$1"
  shift

  case "${fix_mode}" in
    clear_proxy)
      env -u http_proxy -u https_proxy -u HTTP_PROXY -u HTTPS_PROXY -u all_proxy -u ALL_PROXY -u no_proxy -u NO_PROXY "$@"
      ;;
    sanitize_codex_env)
      env -u CODEX_API_KEY -u OPENAI_API_KEY "$@"
      ;;
    clear_proxy_and_sanitize_codex_env)
      env -u http_proxy -u https_proxy -u HTTP_PROXY -u HTTPS_PROXY -u all_proxy -u ALL_PROXY -u no_proxy -u NO_PROXY -u CODEX_API_KEY -u OPENAI_API_KEY "$@"
      ;;
    *)
      "$@"
      ;;
  esac
}

write_prompts() {
  local out_dir="$1"

  cat > "${out_dir}/prompt-codex-backend.txt" <<'EOF_P1'
You are Agent-Codex-Backend.

Read and follow these files before proposing work:
- plan/MEMBER-SYSTEM-COMMAND-CENTER.md
- plan/MEMBER-SYSTEM-WORKBOARD.md
- plan/MEMBER-LEARNING-PLATFORM-EXECUTION-PLAN.md

Task:
1) Produce the next concrete backend implementation wave for free->paid member system:
- membership_status / entitlements lifecycle
- webhook reliability and idempotency
- download authorization hardening
2) Give exact file-level patch plan and test plan.
3) List blockers and rollback steps.

Output sections:
- Wave Scope
- File Change Plan
- SQL/API Validation
- Failure/Rollback
- Risks
EOF_P1

  cat > "${out_dir}/prompt-codex-frontend.txt" <<'EOF_P2'
You are Agent-Codex-Frontend.

Read and follow these files before proposing work:
- plan/MEMBER-SYSTEM-COMMAND-CENTER.md
- plan/MEMBER-SYSTEM-WORKBOARD.md
- plan/MEMBER-LEARNING-PLATFORM-EXECUTION-PLAN.md

Task:
1) Produce the next frontend implementation wave:
- free member login UX
- progress + weak-point dashboard
- paid member recommendation cards and coupon visibility logic
2) Keep anonymous exercise flow intact.
3) Provide browser compatibility checks.

Output sections:
- Wave Scope
- File Change Plan
- UX State Matrix
- Compatibility Checklist
- Risks
EOF_P2

  cat > "${out_dir}/prompt-gemini-architect.txt" <<'EOF_P3'
You are Agent-Gemini-Architect.

Read and follow these files before proposing work:
- plan/MEMBER-SYSTEM-COMMAND-CENTER.md
- plan/MEMBER-SYSTEM-WORKBOARD.md
- plan/MEMBER-LEARNING-PLATFORM-EXECUTION-PLAN.md

Task:
1) Audit current free vs paid membership architecture.
2) Identify 10 highest-risk failure points across auth, webhook, entitlement, and discount logic.
3) Propose stronger design alternatives with tradeoffs.

Output sections:
- Architecture Audit
- Top Risks (ranked)
- Better Options and Tradeoffs
- Immediate Hardening Actions
EOF_P3

  cat > "${out_dir}/prompt-gemini-qa.txt" <<'EOF_P4'
You are Agent-Gemini-QA.

Read and follow these files before proposing work:
- plan/MEMBER-SYSTEM-COMMAND-CENTER.md
- plan/MEMBER-SYSTEM-WORKBOARD.md
- plan/MEMBER-LEARNING-PLATFORM-EXECUTION-PLAN.md

Task:
1) Build end-to-end test matrix for free member and paid member.
2) Include failure branches (network, webhook retry, invalid token, expired entitlement).
3) Include release gate and rollback checklist.

Output sections:
- E2E Test Matrix
- Failure Injection Cases
- Release Gate Checklist
- Rollback Checklist
EOF_P4
}

run_codex_agent() {
  local out_dir="$1"
  local agent="$2"
  local model="$3"
  local prompt_file="$4"
  local fix_mode="${5:-sanitize_codex_env}"

  run_cmd_with_env_fix "${fix_mode}" \
    codex exec -C "${ROOT}" -m "${model}" \
      -c model_reasoning_effort=high \
      -o "${out_dir}/${agent}.md" \
      "$(cat "${prompt_file}")" \
      > "${out_dir}/${agent}.log" 2>&1
}

run_gemini_agent() {
  local out_dir="$1"
  local agent="$2"
  local model="$3"
  local prompt_file="$4"
  local fix_mode="${5:-none}"

  run_cmd_with_env_fix "${fix_mode}" \
    gemini -m "${model}" -p "$(cat "${prompt_file}")" --output-format text \
      > "${out_dir}/${agent}.md" 2> "${out_dir}/${agent}.log"
}

detect_failure_signature() {
  local log_file="$1"
  if rg -q "invalid_api_key|Incorrect API key provided|401 Unauthorized" "${log_file}" 2>/dev/null; then
    echo "auth_failure"
    return
  fi
  if rg -q "Unsupported value: 'xhigh'|reasoning.effort|unsupported_value" "${log_file}" 2>/dev/null; then
    echo "unsupported_reasoning_effort"
    return
  fi
  if rg -q "127.0.0.1 port 7890|Could not resolve host|proxy" "${log_file}" 2>/dev/null; then
    echo "proxy_resolution_failure"
    return
  fi
  if rg -q "not logged in|login|authentication|auth" "${log_file}" 2>/dev/null; then
    echo "auth_failure"
    return
  fi
  if rg -q "rate limit|429|quota" "${log_file}" 2>/dev/null; then
    echo "rate_limit"
    return
  fi
  echo "unknown_failure"
}

retry_failed_agent_once() {
  local out_dir="$1"
  local agent="$2"
  local signature="$3"

  local fix_mode="none"
  case "${signature}" in
    proxy_resolution_failure)
      fix_mode="clear_proxy_and_sanitize_codex_env"
      ;;
    auth_failure)
      fix_mode="sanitize_codex_env"
      ;;
    unsupported_reasoning_effort)
      fix_mode="sanitize_codex_env"
      ;;
    *)
      fix_mode="none"
      ;;
  esac

  local prompt_file=""
  local model=""
  local engine=""

  case "${agent}" in
    codex-backend)
      prompt_file="${out_dir}/prompt-codex-backend.txt"
      model="${MODEL_CODEX}"
      engine="codex"
      ;;
    codex-frontend)
      prompt_file="${out_dir}/prompt-codex-frontend.txt"
      model="${MODEL_CODEX}"
      engine="codex"
      ;;
    gemini-architect)
      prompt_file="${out_dir}/prompt-gemini-architect.txt"
      model="${MODEL_GEMINI_PRO}"
      engine="gemini"
      ;;
    gemini-qa)
      prompt_file="${out_dir}/prompt-gemini-qa.txt"
      model="${MODEL_GEMINI_FLASH}"
      engine="gemini"
      ;;
    *)
      return 1
      ;;
  esac

  log "Retrying ${agent} with fix mode: ${fix_mode}"
  if [[ "${engine}" == "codex" ]]; then
    run_codex_agent "${out_dir}" "${agent}" "${model}" "${prompt_file}" "${fix_mode}"
  else
    run_gemini_agent "${out_dir}" "${agent}" "${model}" "${prompt_file}" "${fix_mode}"
  fi
}

preflight() {
  ensure_files
  ensure_self_heal_file
  require_cmd codex
  require_cmd gemini
  require_cmd node
  require_cmd git

  log "Toolchain versions"
  codex --version
  gemini --version

  log "Plan baseline check"
  echo "- ${PLAN_FILE}"
  echo "- ${COMMAND_CENTER_FILE}"
  echo "- ${WORKBOARD_FILE}"

  log "Codex auth/model probe"
  local codex_probe_out codex_probe_log
  codex_probe_out="$(mktemp)"
  codex_probe_log="$(mktemp)"
  if ! run_cmd_with_env_fix "sanitize_codex_env" \
    codex exec -C "${ROOT}" -m "${MODEL_CODEX}" -c model_reasoning_effort=high \
      -o "${codex_probe_out}" "Reply with OK only." \
      > "${codex_probe_log}" 2>&1; then
    echo "Codex probe failed. Likely key/auth config issue. Run: codex login status" >&2
    sed -n '1,80p' "${codex_probe_log}" >&2
    rm -f "${codex_probe_out}" "${codex_probe_log}"
    exit 1
  fi
  rm -f "${codex_probe_out}" "${codex_probe_log}"

  log "Preflight OK"
}

kickoff() {
  preflight

  mkdir -p "${RUN_ROOT}"
  local run_id
  run_id="$(date -u +%Y%m%dT%H%M%SZ)"
  local out_dir="${RUN_ROOT}/${run_id}"
  mkdir -p "${out_dir}"

  write_prompts "${out_dir}"

  cat > "${out_dir}/RUN-CONTEXT.md" <<EOF_CTX
# Run Context ${run_id}

- Plan baseline: ${PLAN_FILE}
- Command center: ${COMMAND_CENTER_FILE}
- Workboard: ${WORKBOARD_FILE}
- Commander rule: stop on first failure, repair, log to self-heal ledger.
EOF_CTX

  log "Dispatching 4 agents in parallel"

  local pids=()
  local names=()

  (run_codex_agent "${out_dir}" "codex-backend" "${MODEL_CODEX}" "${out_dir}/prompt-codex-backend.txt") &
  pids+=("$!")
  names+=("codex-backend")

  (run_codex_agent "${out_dir}" "codex-frontend" "${MODEL_CODEX}" "${out_dir}/prompt-codex-frontend.txt") &
  pids+=("$!")
  names+=("codex-frontend")

  (run_gemini_agent "${out_dir}" "gemini-architect" "${MODEL_GEMINI_PRO}" "${out_dir}/prompt-gemini-architect.txt") &
  pids+=("$!")
  names+=("gemini-architect")

  (run_gemini_agent "${out_dir}" "gemini-qa" "${MODEL_GEMINI_FLASH}" "${out_dir}/prompt-gemini-qa.txt") &
  pids+=("$!")
  names+=("gemini-qa")

  local failed_agents=()
  local i
  for i in "${!pids[@]}"; do
    if ! wait "${pids[$i]}"; then
      failed_agents+=("${names[$i]}")
    fi
  done

  if [[ ${#failed_agents[@]} -gt 0 ]]; then
    log "Failure detected. Entering repair workflow."

    : > "${out_dir}/FAILED-AGENTS.txt"
    local agent
    for agent in "${failed_agents[@]}"; do
      echo "${agent}" >> "${out_dir}/FAILED-AGENTS.txt"

      local sig
      sig="$(detect_failure_signature "${out_dir}/${agent}.log")"
      append_self_heal_entry "${run_id}" "${agent}" "${sig}" "auto-retry-once"

      if ! retry_failed_agent_once "${out_dir}" "${agent}" "${sig}"; then
        append_self_heal_entry "${run_id}" "${agent}" "${sig}" "retry_failed_stop_line"
        echo "Stop-The-Line: ${agent} failed after retry." >&2
        exit 1
      fi
    done

    log "Repair retry succeeded for failed agents"
  fi

  cat > "${out_dir}/README.md" <<EOF_DONE
# Member Agent Run ${run_id}

## Models
- codex-backend: ${MODEL_CODEX}
- codex-frontend: ${MODEL_CODEX}
- gemini-architect: ${MODEL_GEMINI_PRO}
- gemini-qa: ${MODEL_GEMINI_FLASH}

## Outputs
- codex-backend.md
- codex-frontend.md
- gemini-architect.md
- gemini-qa.md

## Logs
- *.log
EOF_DONE

  log "Kickoff completed: ${out_dir}"
}

status() {
  local latest
  latest="$(latest_run_dir || true)"
  if [[ -z "${latest:-}" ]]; then
    echo "No member agent run found."
    return 0
  fi
  echo "Latest run: ${latest}"
  ls -la "${latest}"
}

qa() {
  log "Running health checks"
  (
    cd "${ROOT}"
    python3 scripts/health/check_exercise_data.py
    python3 scripts/health/check_kahoot_data.py
  )
  log "QA checks completed"
}

gate() {
  ensure_files
  ensure_self_heal_file
  require_cmd node
  require_cmd supabase
  require_cmd bundle
  require_cmd python3

  mkdir -p "${RUN_ROOT}"
  local run_id out_dir
  run_id="$(date -u +%Y%m%dT%H%M%SZ)"
  out_dir="${RUN_ROOT}/${run_id}"
  mkdir -p "${out_dir}"

  cat > "${out_dir}/RUN-CONTEXT.md" <<EOF_CTX
# Gate Verification Run ${run_id}

- Scope: member system gate validation
- Rule: run checks sequentially to avoid Supabase CLI auth race
- Root: ${ROOT}
EOF_CTX

  log "Gate checks started: ${out_dir}"
  (
    cd "${ROOT}"

    bundle exec jekyll build > "${out_dir}/01-jekyll-build.log" 2>&1

    {
      for f in \
        assets/js/member_auth.js \
        assets/js/member_center.js \
        assets/js/member_benefits.js \
        assets/js/member_recommendations.js \
        assets/js/exercise_engine.js \
        functions/_lib/payhip_events.js \
        functions/_lib/supabase_server.js \
        functions/api/v1/membership/webhook/payhip.js \
        functions/api/v1/membership/reconcile.js \
        functions/api/v1/membership/benefits.js \
        'functions/api/v1/exercise/session/[id]/attempt.js' \
        'functions/api/v1/exercise/session/[id]/complete.js' \
        functions/api/v1/exercise/session/start.js \
        'functions/api/v1/download/[release_id].js'
      do
        node --check "$f"
      done
      echo "node-check: ok"
    } > "${out_dir}/02-node-check.log" 2>&1

    # Keep Supabase commands sequential to avoid cli_login_postgres auth race.
    supabase migration list --linked > "${out_dir}/03-supabase-migration-list.log" 2>&1
    supabase db push --include-all > "${out_dir}/04-supabase-db-push.log" 2>&1

    {
      python3 scripts/health/check_exercise_data.py
      python3 scripts/health/check_kahoot_data.py
    } > "${out_dir}/05-health-qa.log" 2>&1
  )

  cat > "${out_dir}/README.md" <<EOF_DONE
# Member Gate Verification ${run_id}

## Result
- jekyll build: pass
- node syntax checks: pass
- supabase migration list --linked: pass
- supabase db push --include-all: pass (up to date)
- health QA checks: pass

## Logs
- 01-jekyll-build.log
- 02-node-check.log
- 03-supabase-migration-list.log
- 04-supabase-db-push.log
- 05-health-qa.log
EOF_DONE

  log "Gate checks completed: ${out_dir}"
}

main() {
  if [[ $# -ne 1 ]]; then
    usage
    exit 1
  fi

  case "$1" in
    preflight) preflight ;;
    kickoff) kickoff ;;
    status) status ;;
    gate) gate ;;
    qa) qa ;;
    *) usage; exit 1 ;;
  esac
}

main "$@"
