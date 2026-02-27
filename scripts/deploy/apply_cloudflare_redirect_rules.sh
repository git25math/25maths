#!/usr/bin/env bash
set -euo pipefail

# Apply zone-level Redirect Rules (phase: http_request_dynamic_redirect)
# for legacy language path canonicalization.
#
# Required env vars:
# - CF_API_TOKEN
# - CF_ZONE_ID
#
# Optional env var:
# - CF_CANONICAL_ORIGIN (default: https://www.25maths.com)

if [[ -z "${CF_API_TOKEN:-}" || -z "${CF_ZONE_ID:-}" ]]; then
  echo "Missing required environment variables."
  echo "Required: CF_API_TOKEN, CF_ZONE_ID"
  exit 1
fi

origin="${CF_CANONICAL_ORIGIN:-https://www.25maths.com}"
api="https://api.cloudflare.com/client/v4"

# Cloudflare dashboard copy often introduces whitespace/newline artifacts.
zone_id="$(printf '%s' "${CF_ZONE_ID}" | tr -d '[:space:]')"
api_token="$(printf '%s' "${CF_API_TOKEN}" | tr -d '\r\n')"

if [[ ! "${zone_id}" =~ ^[A-Fa-f0-9]{32}$ ]]; then
  echo "Invalid CF_ZONE_ID format: expected 32 hex characters."
  echo "Current value length after trimming whitespace: ${#zone_id}"
  exit 1
fi

entrypoint_url="${api}/zones/${zone_id}/rulesets/phases/http_request_dynamic_redirect/entrypoint"

payload="$(cat <<JSON
{
  "description": "25maths legacy language redirect rules",
  "rules": [
    {
      "description": "legacy-zh-products-to-hub",
      "expression": "starts_with(http.request.uri.path, \"/zh-cn/cie0580/products/\")",
      "action": "redirect",
      "action_parameters": {
        "from_value": {
          "status_code": 301,
          "target_url": {
            "expression": "concat(\"${origin}\", \"/cie0580/products.html\")"
          },
          "preserve_query_string": true
        }
      },
      "enabled": true
    },
    {
      "description": "legacy-en-root-to-home",
      "expression": "http.request.uri.path eq \"/en\"",
      "action": "redirect",
      "action_parameters": {
        "from_value": {
          "status_code": 301,
          "target_url": {
            "expression": "concat(\"${origin}\", \"/\")"
          },
          "preserve_query_string": true
        }
      },
      "enabled": true
    },
    {
      "description": "legacy-en-prefix-to-canonical",
      "expression": "starts_with(http.request.uri.path, \"/en/\")",
      "action": "redirect",
      "action_parameters": {
        "from_value": {
          "status_code": 301,
          "target_url": {
            "expression": "concat(\"${origin}\", substring(http.request.uri.path, 3))"
          },
          "preserve_query_string": true
        }
      },
      "enabled": true
    },
    {
      "description": "legacy-zh-root-to-home",
      "expression": "http.request.uri.path eq \"/zh-cn\"",
      "action": "redirect",
      "action_parameters": {
        "from_value": {
          "status_code": 301,
          "target_url": {
            "expression": "concat(\"${origin}\", \"/\")"
          },
          "preserve_query_string": true
        }
      },
      "enabled": true
    },
    {
      "description": "legacy-zh-prefix-to-canonical",
      "expression": "starts_with(http.request.uri.path, \"/zh-cn/\")",
      "action": "redirect",
      "action_parameters": {
        "from_value": {
          "status_code": 301,
          "target_url": {
            "expression": "concat(\"${origin}\", substring(http.request.uri.path, 6))"
          },
          "preserve_query_string": true
        }
      },
      "enabled": true
    }
  ]
}
JSON
)"

response_file="$(mktemp)"
http_code="$(
  curl -sS -o "${response_file}" -w "%{http_code}" \
    -X PUT "${entrypoint_url}" \
    -H "Authorization: Bearer ${api_token}" \
    -H "Content-Type: application/json" \
    --data "${payload}"
)"

if [[ "${http_code}" != "200" ]]; then
  echo "Cloudflare API request failed with HTTP ${http_code}."
  cat "${response_file}"
  rm -f "${response_file}"
  exit 1
fi

# Accept environments without ripgrep.
if command -v rg >/dev/null 2>&1; then
  success_check_cmd=(rg -q '"success":\s*true' "${response_file}")
else
  success_check_cmd=(grep -Eq '"success"[[:space:]]*:[[:space:]]*true' "${response_file}")
fi

if ! "${success_check_cmd[@]}"; then
  echo "Cloudflare API returned success=false:"
  cat "${response_file}"
  rm -f "${response_file}"
  exit 1
fi

echo "Redirect Rules applied successfully."
echo "Now run: scripts/health/check_redirect_301_live.sh ${origin}"
rm -f "${response_file}"
