#!/usr/bin/env bash
set -euo pipefail

site_url="${1:-https://www.25maths.com}"
site_url="${site_url%/}"

checks=(
  "/en/|/"
  "/zh-cn/|/"
  "/zh-cn/cie0580/products/algebra.html|/cie0580/products.html"
)

failures=0

echo "== Live Redirect 301 Check =="
echo "Base URL: ${site_url}"

for entry in "${checks[@]}"; do
  path="${entry%%|*}"
  expected_target="${entry##*|}"
  url="${site_url}${path}"

  echo "--- ${url}"
  headers="$(curl -sSI "${url}")"
  status="$(printf '%s\n' "${headers}" | awk 'toupper($1) ~ /^HTTP\// { code=$2 } END { print code }')"
  location="$(printf '%s\n' "${headers}" | awk 'tolower($1)=="location:" { print $2 }' | tr -d '\r' | tail -n 1)"
  server="$(printf '%s\n' "${headers}" | awk 'tolower($1)=="server:" { print $2 }' | tr -d '\r' | tail -n 1)"
  cf_ray="$(printf '%s\n' "${headers}" | awk 'tolower($1)=="cf-ray:" { print $2 }' | tr -d '\r' | tail -n 1)"
  cf_mitigated="$(printf '%s\n' "${headers}" | awk 'tolower($1)=="cf-mitigated:" { print $2 }' | tr -d '\r' | tail -n 1)"

  if [[ -z "${status}" ]]; then
    echo "FAIL: no HTTP status returned"
    echo "INFO: server=${server:-n/a} cf-ray=${cf_ray:-n/a} location=${location:-n/a}"
    failures=$((failures + 1))
    continue
  fi

  if [[ "${status}" != "301" ]]; then
    echo "FAIL: expected HTTP 301, got ${status}"
    echo "INFO: server=${server:-n/a} cf-ray=${cf_ray:-n/a} location=${location:-n/a}"
    if [[ "${status}" == "403" && "${cf_mitigated:-}" == "challenge" ]]; then
      echo "HINT: Cloudflare Managed Challenge is blocking this request. Disable Under Attack mode / challenge rule, or add a WAF skip rule for this check path/IP."
    fi
    failures=$((failures + 1))
    continue
  fi

  if [[ -z "${location}" ]]; then
    echo "FAIL: missing Location header"
    echo "INFO: server=${server:-n/a} cf-ray=${cf_ray:-n/a}"
    failures=$((failures + 1))
    continue
  fi

  if [[ "${location}" != "${site_url}${expected_target}" && "${location}" != "${expected_target}" ]]; then
    echo "FAIL: unexpected Location header: ${location} (expected ${site_url}${expected_target})"
    failures=$((failures + 1))
    continue
  fi

  echo "PASS: 301 -> ${location}"
done

if [[ ${failures} -gt 0 ]]; then
  echo "Result: FAILED (${failures} check(s) did not meet 301 expectations)"
  exit 1
fi

echo "Result: PASSED (all legacy language URLs return expected 301)"
