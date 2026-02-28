#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  BASE_URL="https://www.25maths.com" \
  PAYHIP_API_KEY="..." \
  CUSTOMER_EMAIL="user@example.com" \
  PRODUCT_ID="payhip_product_id" \
  EVENT_TYPE="paid" \
  bash scripts/member/e2e_payhip_flow.sh

Optional env:
  EVENT_TYPE      Default: paid
  ACCESS_TOKEN    If set, run /api/v1/membership/reconcile
  RELEASE_ID      If set with ACCESS_TOKEN, run /api/v1/download/:release_id?channel=member
EOF
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing command: $1" >&2
    exit 1
  fi
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

require_cmd curl
require_cmd python3
require_cmd openssl

BASE_URL="${BASE_URL:-}"
PAYHIP_API_KEY="${PAYHIP_API_KEY:-}"
CUSTOMER_EMAIL="${CUSTOMER_EMAIL:-}"
PRODUCT_ID="${PRODUCT_ID:-}"
EVENT_TYPE="${EVENT_TYPE:-paid}"
ACCESS_TOKEN="${ACCESS_TOKEN:-}"
RELEASE_ID="${RELEASE_ID:-}"

if [[ -z "${BASE_URL}" || -z "${PAYHIP_API_KEY}" || -z "${CUSTOMER_EMAIL}" || -z "${PRODUCT_ID}" ]]; then
  echo "Missing required env. Run with --help for details." >&2
  exit 1
fi

export EVENT_ID="manual-$(date -u +%Y%m%dT%H%M%SZ)-$RANDOM"
export NOW_ISO="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
export LEGACY_SIG="$(printf '%s' "${PAYHIP_API_KEY}" | openssl dgst -sha256 | awk '{print $NF}')"

PAYLOAD="$(
  python3 - <<'PY'
import json, os
payload = {
  "event_type": os.environ.get("EVENT_TYPE", "paid"),
  "event_id": os.environ["EVENT_ID"],
  "customer_email": os.environ["CUSTOMER_EMAIL"],
  "product_id": os.environ["PRODUCT_ID"],
  "created_at": os.environ["NOW_ISO"],
  "signature": os.environ["LEGACY_SIG"],
}
print(json.dumps(payload, separators=(",", ":")))
PY
)"

echo "[e2e] POST webhook event: ${EVENT_TYPE} (${EVENT_ID})"
WEBHOOK_RESP="$(mktemp)"
WEBHOOK_CODE="$(
  curl -sS -o "${WEBHOOK_RESP}" -w '%{http_code}' \
    -X POST "${BASE_URL%/}/api/v1/membership/webhook/payhip" \
    -H 'content-type: application/json' \
    --data "${PAYLOAD}"
)"
echo "[e2e] webhook status: ${WEBHOOK_CODE}"
cat "${WEBHOOK_RESP}"
echo
rm -f "${WEBHOOK_RESP}"

if [[ -n "${ACCESS_TOKEN}" ]]; then
  echo "[e2e] POST reconcile"
  RECON_RESP="$(mktemp)"
  RECON_CODE="$(
    curl -sS -o "${RECON_RESP}" -w '%{http_code}' \
      -X POST "${BASE_URL%/}/api/v1/membership/reconcile" \
      -H "authorization: Bearer ${ACCESS_TOKEN}"
  )"
  echo "[e2e] reconcile status: ${RECON_CODE}"
  cat "${RECON_RESP}"
  echo
  rm -f "${RECON_RESP}"
fi

if [[ -n "${ACCESS_TOKEN}" && -n "${RELEASE_ID}" ]]; then
  echo "[e2e] GET member download: ${RELEASE_ID}"
  DL_RESP="$(mktemp)"
  DL_CODE="$(
    curl -sS -o "${DL_RESP}" -w '%{http_code}' \
      -X GET "${BASE_URL%/}/api/v1/download/${RELEASE_ID}?channel=member" \
      -H "authorization: Bearer ${ACCESS_TOKEN}"
  )"
  echo "[e2e] download status: ${DL_CODE}"
  cat "${DL_RESP}"
  echo
  rm -f "${DL_RESP}"
fi

echo "[e2e] done"

