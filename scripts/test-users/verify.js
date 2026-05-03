#!/usr/bin/env node
'use strict';

/**
 * Test User Verification Script
 * Runs DB-layer + API-layer checks for each test user.
 *
 * Usage:
 *   node verify.js             # verify all users
 *   node verify.js --user T01  # single user
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.SUPABASE_ANON_KEY;
const API_BASE = process.env.API_BASE_URL;
const EMAIL_BASE = process.env.TEST_EMAIL_BASE;

if (!SUPABASE_URL || !SERVICE_KEY || !EMAIL_BASE) {
  console.error('Missing required env vars');
  process.exit(1);
}

// Service-role client for DB checks (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Anon client for signInWithPassword (does NOT pollute the service-role client's auth state)
const anonClient = createClient(SUPABASE_URL, ANON_KEY || SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const usersConfig = JSON.parse(readFileSync(resolve(__dirname, 'users.json'), 'utf-8'));
const ALL_CIE = usersConfig.ALL_CIE;

const XP_THRESHOLDS = [0, 50, 200, 500, 1000, 2000, 4000, 8000, 16000, 32000];
function computeLevel(xp) {
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

function makeEmail(alias) {
  const [local, domain] = EMAIL_BASE.split('@');
  return `${local}+${alias}@${domain}`;
}

// ── Result tracking ──
const results = [];
function check(userId, category, name, passed, detail = '') {
  const status = passed ? 'PASS' : 'FAIL';
  const icon = passed ? '✅' : '❌';
  results.push({ userId, category, name, status, detail });
  console.log(`  ${icon} ${name}${detail ? ` — ${detail}` : ''}`);
  return passed;
}

function warn(userId, category, name, detail = '') {
  results.push({ userId, category, name, status: 'WARNING', detail });
  console.log(`  ⚠️  ${name}${detail ? ` — ${detail}` : ''}`);
}

// ── DB Checks ──
async function verifyDbUser(userCfg, userId) {
  console.log(`\n  --- DB Checks ---`);

  // 1. profiles exists + display_name correct
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id, display_name, target_board, preferred_lang')
    .eq('user_id', userId)
    .maybeSingle();
  check(userId, 'DB', 'profiles exists', !!profile, profile ? `display_name=${profile.display_name}` : 'NOT FOUND');
  check(userId, 'DB', 'profiles.display_name', profile?.display_name === userCfg.display_name,
    `expected=${userCfg.display_name}, got=${profile?.display_name}`);

  // 2. membership_status
  const { data: mem } = await supabase
    .from('membership_status')
    .select('status, period_start, period_end')
    .eq('user_id', userId)
    .maybeSingle();

  if (userCfg.membership) {
    check(userId, 'DB', 'membership exists', !!mem, mem ? `status=${mem.status}` : 'NOT FOUND');
    check(userId, 'DB', 'membership.status', mem?.status === userCfg.membership.status,
      `expected=${userCfg.membership.status}, got=${mem?.status}`);
    if (userCfg.membership.period_end_days_ago) {
      const endDate = new Date(mem?.period_end);
      const expired = endDate < new Date();
      check(userId, 'DB', 'membership expired', expired, `period_end=${mem?.period_end}`);
    }
  } else {
    check(userId, 'DB', 'membership none', !mem, mem ? `unexpected: status=${mem.status}` : 'correctly absent');
  }

  // 3. entitlements count
  const expectedEntitlements = userCfg.entitlements === 'ALL_CIE' ? ALL_CIE.length : (userCfg.entitlements || []).length;
  const { count: entCount } = await supabase
    .from('entitlements')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  check(userId, 'DB', 'entitlements count', entCount === expectedEntitlements,
    `expected=${expectedEntitlements}, got=${entCount}`);

  // T03 special: entitlements expired
  if (userCfg.entitlements_expired) {
    const { data: ents } = await supabase
      .from('entitlements')
      .select('expires_at')
      .eq('user_id', userId)
      .limit(1);
    const ent = ents?.[0];
    const isExpired = ent?.expires_at && new Date(ent.expires_at) < new Date();
    check(userId, 'DB', 'entitlements expired', isExpired,
      `expires_at=${ent?.expires_at}`);
  }

  // 4. retired exercise tables are cleaned for test users
  const { count: sessCount } = await supabase
    .from('exercise_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  check(userId, 'DB', 'exercise_sessions retired cleanup', sessCount === 0,
    `expected=0, got=${sessCount}`);

  const { count: attCount } = await supabase
    .from('question_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  check(userId, 'DB', 'question_attempts retired cleanup', attCount === 0,
    `expected=0, got=${attCount}`);

  // 5. user_streaks
  const { data: streak } = await supabase
    .from('user_streaks')
    .select('current_streak, best_streak, total_active_days')
    .eq('user_id', userId)
    .maybeSingle();

  if (userCfg.streak) {
    check(userId, 'DB', 'streak exists', !!streak);
    check(userId, 'DB', 'streak.current', streak?.current_streak === userCfg.streak.current,
      `expected=${userCfg.streak.current}, got=${streak?.current_streak}`);
    check(userId, 'DB', 'streak.best', streak?.best_streak === userCfg.streak.best,
      `expected=${userCfg.streak.best}, got=${streak?.best_streak}`);
    check(userId, 'DB', 'streak.total_active_days', streak?.total_active_days === userCfg.streak.total_active_days,
      `expected=${userCfg.streak.total_active_days}, got=${streak?.total_active_days}`);
  } else {
    check(userId, 'DB', 'streak none', !streak, streak ? 'unexpected record found' : 'correctly absent');
  }

  // 7. user_xp
  const { data: xp } = await supabase
    .from('user_xp')
    .select('total_xp, level')
    .eq('user_id', userId)
    .maybeSingle();

  if (userCfg.xp > 0) {
    const expectedLevel = computeLevel(userCfg.xp);
    check(userId, 'DB', 'xp exists', !!xp);
    check(userId, 'DB', 'xp.total', xp?.total_xp === userCfg.xp,
      `expected=${userCfg.xp}, got=${xp?.total_xp}`);
    check(userId, 'DB', 'xp.level', xp?.level === expectedLevel,
      `expected=${expectedLevel}, got=${xp?.level}`);
  } else {
    check(userId, 'DB', 'xp none/zero', !xp || xp.total_xp === 0,
      xp ? `total_xp=${xp.total_xp}` : 'correctly absent');
  }

  // 8. user_daily_activity date range
  if (userCfg.sessions > 0) {
    const { data: activities } = await supabase
      .from('user_daily_activity')
      .select('activity_date')
      .eq('user_id', userId)
      .order('activity_date', { ascending: false });
    const dayCount = activities?.length || 0;
    check(userId, 'DB', 'daily_activity exists', dayCount > 0, `${dayCount} day(s)`);
  }
}

// ── API Checks ──
async function getAccessToken(email, password) {
  const { data, error } = await anonClient.auth.signInWithPassword({ email, password });
  if (error) return null;
  return data?.session?.access_token || null;
}

async function apiGet(endpoint, token) {
  const url = `${API_BASE}${endpoint}`;
  try {
    const resp = await fetch(url, {
      headers: token ? { authorization: `Bearer ${token}` } : {},
    });
    const body = await resp.json().catch(() => ({}));
    return { status: resp.status, body };
  } catch (err) {
    return { status: 0, body: { error: err.message } };
  }
}

async function apiPost(endpoint, token, payload = {}) {
  const url = `${API_BASE}${endpoint}`;
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    const body = await resp.json().catch(() => ({}));
    return { status: resp.status, body };
  } catch (err) {
    return { status: 0, body: { error: err.message } };
  }
}

async function verifyApiUser(userCfg, userId) {
  if (!API_BASE) {
    warn(userId, 'API', 'API_BASE_URL not set', 'skipping API checks');
    return;
  }

  console.log(`\n  --- API Checks ---`);
  const email = makeEmail(userCfg.alias);
  const token = await getAccessToken(email, userCfg.password);

  if (!token) {
    warn(userId, 'API', 'access token', 'could not sign in — skipping API checks');
    return;
  }
  console.log(`  Token acquired for ${userCfg.alias}`);

  // 1. GET /v1/user/profile
  const profile = await apiGet('/v1/user/profile', token);
  check(userId, 'API', 'GET /profile → 200', profile.status === 200, `status=${profile.status}`);
  if (profile.status === 200) {
    check(userId, 'API', 'profile.display_name', profile.body.display_name === userCfg.display_name,
      `expected=${userCfg.display_name}, got=${profile.body.display_name}`);
  }

  // 2. GET /v1/engagement/streak
  const streak = await apiGet('/v1/engagement/streak', token);
  check(userId, 'API', 'GET /streak → 200', streak.status === 200, `status=${streak.status}`);
  if (streak.status === 200 && userCfg.streak) {
    check(userId, 'API', 'streak.current_streak',
      streak.body.current_streak === userCfg.streak.current,
      `expected=${userCfg.streak.current}, got=${streak.body.current_streak}`);
  }

  // 3. GET /v1/reports/weekly
  const weekly = await apiGet('/v1/reports/weekly', token);
  if (weekly.status === 200 && userCfg.xp > 0) {
    const expectedLevel = computeLevel(userCfg.xp);
    check(userId, 'API', 'weekly xp.level',
      weekly.body.xp?.level === expectedLevel,
      `expected=${expectedLevel}, got=${weekly.body.xp?.level}`);
  } else {
    check(userId, 'API', 'GET /weekly → response', weekly.status === 200 || weekly.status === 404,
      `status=${weekly.status}`);
  }

  // 4. GET /v1/engagement/achievements (read-only, no side effects)
  const achGet = await apiGet('/v1/engagement/achievements', token);
  check(userId, 'API', 'GET /achievements → 200',
    achGet.status === 200,
    `status=${achGet.status}`);

  // 5. GET /v1/download/member-week01-number-fdp-en-2026w10
  const downloadId = 'member-week01-number-fdp-en-2026w10';
  const dl = await apiGet(`/v1/download/${downloadId}`, token);

  // T01/T08 (active membership + valid entitlements) → should succeed (200)
  // T03 (cancelled + expired) → should get 403
  // T04 (no membership, no entitlements) → should get 403
  const isActiveUser = userCfg.membership?.status === 'active' && !userCfg.entitlements_expired;
  const expectedDlStatus = isActiveUser ? 200 : 403;
  check(userId, 'API', `GET /download → ${expectedDlStatus}`,
    dl.status === expectedDlStatus,
    `expected=${expectedDlStatus}, got=${dl.status}${dl.status !== expectedDlStatus ? ' body=' + JSON.stringify(dl.body).slice(0, 100) : ''}`);
}

// ── Main ──
async function main() {
  const args = process.argv.slice(2);
  const userFilter = args.find((_, i) => args[i - 1] === '--user');

  let targetUsers = usersConfig.users;
  if (userFilter) {
    targetUsers = targetUsers.filter(u => u.id === userFilter);
  }

  console.log(`Verifying ${targetUsers.length} test user(s)...`);
  console.log(`Supabase: ${SUPABASE_URL}`);
  console.log(`API: ${API_BASE || '(not set)'}`);

  // Resolve user IDs from auth
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const emailToId = new Map();
  for (const u of authUsers?.users || []) {
    emailToId.set(u.email, u.id);
  }

  for (const userCfg of targetUsers) {
    const email = makeEmail(userCfg.alias);
    const userId = emailToId.get(email);

    console.log(`\n${'='.repeat(60)}`);
    console.log(`[${userCfg.id}] ${userCfg.display_name} <${email}>`);
    if (!userId) {
      console.log(`  ❌ User not found in auth — run setup.js first`);
      results.push({ userId: null, category: 'AUTH', name: 'user exists', status: 'FAIL', detail: email });
      continue;
    }
    console.log(`  UUID: ${userId}`);
    console.log('='.repeat(60));

    await verifyDbUser(userCfg, userId);
    await verifyApiUser(userCfg, userId);
  }

  // ── Summary ──
  console.log(`\n${'='.repeat(60)}`);
  console.log('SUMMARY');
  console.log('='.repeat(60));

  const pass = results.filter(r => r.status === 'PASS').length;
  const fail = results.filter(r => r.status === 'FAIL').length;
  const warnings = results.filter(r => r.status === 'WARNING').length;
  console.log(`  ✅ PASS: ${pass}   ❌ FAIL: ${fail}   ⚠️  WARNING: ${warnings}`);
  console.log(`  Total checks: ${results.length}`);

  if (fail > 0) {
    console.log(`\n  Failed checks:`);
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`    ❌ [${r.userId?.slice(0, 8) || '?'}] ${r.name} — ${r.detail}`);
    });
  }

  // ── Save report ──
  const reportsDir = resolve(__dirname, 'reports');
  mkdirSync(reportsDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const reportPath = resolve(reportsDir, `verify-${ts}.json`);
  const report = {
    timestamp: new Date().toISOString(),
    supabase_url: SUPABASE_URL,
    api_base: API_BASE,
    summary: { pass, fail, warnings, total: results.length },
    checks: results,
  };
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n  Report saved: ${reportPath}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
