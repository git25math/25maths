#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-https://www.25maths.com}"
APEX_URL="${APEX_URL:-https://25maths.com}"
TLS_MIN_DAYS="${TLS_MIN_DAYS:-14}"

failures=0
warnings=0

pass() {
  printf 'PASS: %s\n' "$1"
}

warn() {
  warnings=$((warnings + 1))
  printf 'WARN: %s\n' "$1"
}

fail() {
  failures=$((failures + 1))
  printf 'FAIL: %s\n' "$1"
}

check_status_200() {
  local url="$1"
  local code
  code="$(curl -L -s --connect-timeout 8 --max-time 20 -o /dev/null -w '%{http_code}' "$url")"
  if [[ "$code" == "200" ]]; then
    pass "HTTP 200 $url"
  else
    fail "HTTP $code $url"
  fi
}

echo "== 25Maths Site Health Check =="
echo "Base URL: $BASE_URL"
echo

required_urls=(
  "$BASE_URL/"
  "$BASE_URL/kahoot/"
  "$BASE_URL/kahoot/cie0580/"
  "$BASE_URL/kahoot/edexcel-4ma1/"
  "$BASE_URL/projects/kahoot-channel/cie0580/micro-topics/number-c1/c1-01-types-of-number/cover-2320x1520-kahoot-minimal.png"
  "$BASE_URL/projects/kahoot-channel/cie0580/micro-topics/number-c1/c1-01-types-of-number/cover-2320x1520-kahoot-minimal.webp"
  "$BASE_URL/projects/kahoot-channel/edexcel-4ma1/micro-topics/number-f1/f1-01-integers/cover-2320x1520-kahoot-minimal.png"
  "$BASE_URL/projects/kahoot-channel/edexcel-4ma1/micro-topics/number-f1/f1-01-integers/cover-2320x1520-kahoot-minimal.webp"
  "$BASE_URL/sitemap.xml"
  "$BASE_URL/robots.txt"
)

echo "-- status checks --"
for url in "${required_urls[@]}"; do
  check_status_200 "$url"
done
echo

echo "-- redirect checks --"
effective_http_apex="$(curl -L -s --connect-timeout 8 --max-time 20 -o /dev/null -w '%{url_effective}' "http://25maths.com")"
effective_https_apex="$(curl -L -s --connect-timeout 8 --max-time 20 -o /dev/null -w '%{url_effective}' "$APEX_URL")"
if [[ "$effective_http_apex" == "$BASE_URL/"* ]]; then
  pass "http://25maths.com redirects to $effective_http_apex"
else
  fail "Unexpected redirect target for http://25maths.com -> $effective_http_apex"
fi
if [[ "$effective_https_apex" == "$BASE_URL/"* ]]; then
  pass "$APEX_URL redirects to $effective_https_apex"
else
  fail "Unexpected redirect target for $APEX_URL -> $effective_https_apex"
fi
echo

echo "-- TLS expiry check --"
domain="$(printf '%s' "$BASE_URL" | sed -E 's#https?://([^/]+).*#\1#')"
seconds_ahead="$((TLS_MIN_DAYS * 24 * 60 * 60))"
if echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | openssl x509 -checkend "$seconds_ahead" -noout >/dev/null; then
  pass "TLS certificate for $domain is valid for at least $TLS_MIN_DAYS days"
else
  fail "TLS certificate for $domain expires in less than $TLS_MIN_DAYS days"
fi
echo

echo "-- sitemap coverage checks --"
sitemap="$(curl -L -s --connect-timeout 8 --max-time 20 "$BASE_URL/sitemap.xml")"
for required_loc in \
  "$BASE_URL/kahoot/" \
  "$BASE_URL/kahoot/cie0580/" \
  "$BASE_URL/kahoot/edexcel-4ma1/"; do
  if printf '%s' "$sitemap" | grep -Fq "$required_loc"; then
    pass "sitemap contains $required_loc"
  else
    fail "sitemap missing $required_loc"
  fi
done
echo

echo "-- security header visibility (warning-only on GitHub Pages) --"
headers="$(curl -s -I --connect-timeout 8 --max-time 20 "$BASE_URL/")"
for header in \
  "strict-transport-security" \
  "content-security-policy" \
  "x-frame-options" \
  "x-content-type-options" \
  "referrer-policy"; do
  if printf '%s' "$headers" | grep -qi "^${header}:"; then
    pass "header present: $header"
  else
    warn "header missing: $header"
  fi
done
echo

echo "-- security meta baseline checks --"
homepage_html="$(curl -L -s --connect-timeout 8 --max-time 20 "$BASE_URL/")"
if printf '%s' "$homepage_html" | grep -qi 'http-equiv="Content-Security-Policy"'; then
  pass "meta CSP present on homepage"
else
  warn "meta CSP missing on homepage"
fi
if printf '%s' "$homepage_html" | grep -qi 'name="referrer"'; then
  pass "meta referrer policy present on homepage"
else
  warn "meta referrer policy missing on homepage"
fi
if printf '%s' "$homepage_html" | grep -qi '/assets/css/site.css'; then
  pass "local site stylesheet is linked on homepage"
else
  fail "local site stylesheet missing on homepage"
fi
if printf '%s' "$homepage_html" | grep -qi 'cdn.tailwindcss.com'; then
  warn "Tailwind CDN still referenced on homepage"
else
  pass "Tailwind CDN is not referenced on homepage"
fi
echo

echo "== Summary =="
echo "Failures: $failures"
echo "Warnings: $warnings"

if [[ "$failures" -gt 0 ]]; then
  exit 1
fi
