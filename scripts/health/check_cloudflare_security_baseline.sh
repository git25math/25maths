#!/usr/bin/env bash
set -euo pipefail

site_url="${1:-https://www.25maths.com}"
site_url="${site_url%/}"

core_checks=(
  "/"
  "/cie0580/products.html"
  "/support.html"
  "/free-gift.html"
)

legacy_redirect_checks=(
  "/en/|/"
  "/zh-cn/|/"
  "/zh-cn/cie0580/products/algebra.html|/cie0580/products.html"
)

failures=0

status_from_headers() {
  awk 'toupper($1) ~ /^HTTP\// { code=$2 } END { print code }'
}

header_value() {
  local key="$1"
  awk -v want="${key}:" 'tolower($1)==tolower(want) { print $2 }' | tr -d '\r' | tail -n 1
}

echo "== Cloudflare Security Baseline Check =="
echo "Base URL: ${site_url}"

echo "-- Core page accessibility (no challenge/403) --"
for path in "${core_checks[@]}"; do
  url="${site_url}${path}"
  echo "--- ${url}"

  headers="$(curl -sSI "${url}")"
  status="$(printf '%s\n' "${headers}" | status_from_headers)"
  server="$(printf '%s\n' "${headers}" | header_value server)"
  cf_ray="$(printf '%s\n' "${headers}" | header_value cf-ray)"
  cf_mitigated="$(printf '%s\n' "${headers}" | header_value cf-mitigated)"

  if [[ "${server}" != "cloudflare" ]]; then
    echo "FAIL: expected Cloudflare edge, got server=${server:-n/a}"
    failures=$((failures + 1))
    continue
  fi

  if [[ -z "${status}" || "${status}" == "403" ]]; then
    echo "FAIL: unexpected status=${status:-n/a}"
    echo "INFO: cf-ray=${cf_ray:-n/a} cf-mitigated=${cf_mitigated:-n/a}"
    failures=$((failures + 1))
    continue
  fi

  if [[ "${cf_mitigated:-}" == "challenge" ]]; then
    echo "FAIL: Cloudflare challenge detected"
    echo "INFO: status=${status} cf-ray=${cf_ray:-n/a}"
    failures=$((failures + 1))
    continue
  fi

  echo "PASS: status=${status} server=cloudflare"
done

echo "-- Legacy redirect behavior (must stay 301) --"
for entry in "${legacy_redirect_checks[@]}"; do
  path="${entry%%|*}"
  expected_target="${entry##*|}"
  url="${site_url}${path}"

  echo "--- ${url}"

  headers="$(curl -sSI "${url}")"
  status="$(printf '%s\n' "${headers}" | status_from_headers)"
  location="$(printf '%s\n' "${headers}" | header_value location)"
  cf_mitigated="$(printf '%s\n' "${headers}" | header_value cf-mitigated)"

  if [[ "${status}" != "301" ]]; then
    echo "FAIL: expected 301, got ${status:-n/a}"
    failures=$((failures + 1))
    continue
  fi

  if [[ "${cf_mitigated:-}" == "challenge" ]]; then
    echo "FAIL: challenge detected on redirect path"
    failures=$((failures + 1))
    continue
  fi

  if [[ "${location}" != "${site_url}${expected_target}" && "${location}" != "${expected_target}" ]]; then
    echo "FAIL: unexpected Location=${location:-n/a} expected=${site_url}${expected_target}"
    failures=$((failures + 1))
    continue
  fi

  echo "PASS: 301 -> ${location}"
done

if [[ ${failures} -gt 0 ]]; then
  echo "Result: FAILED (${failures} issue(s) found)"
  exit 1
fi

echo "Result: PASSED (security baseline and redirects are healthy)"
