#!/usr/bin/env node
'use strict';

/**
 * Test User Setup Script
 * Creates 4 test users (T01, T03, T04, T08) with realistic engagement data.
 *
 * Usage:
 *   node setup.js           # create all users
 *   node setup.js --user T01  # single user
 *   node setup.js --links     # only print magic links
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EMAIL_BASE = process.env.TEST_EMAIL_BASE;

if (!SUPABASE_URL || !SERVICE_KEY || !EMAIL_BASE) {
  console.error('Missing required env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TEST_EMAIL_BASE');
  process.exit(1);
}

// Safety: refuse to run against production
if (SUPABASE_URL.toLowerCase().includes('prod')) {
  console.error('SAFETY: SUPABASE_URL contains "prod". Refusing to run against production.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Load configs ──
const usersConfig = JSON.parse(readFileSync(resolve(__dirname, 'users.json'), 'utf-8'));
const ALL_CIE = usersConfig.ALL_CIE;

const CIE_SKILL_CODES = [
  'C1-04', 'C1-13', 'C2-05', 'C3-03', 'C4-06', 'C5-04',
  'E1-18', 'E2-12', 'E6-05', 'E7-01', 'E8-04', 'E9-06',
];

// ── Helpers ──
function makeEmail(alias) {
  const [local, domain] = EMAIL_BASE.split('@');
  return `${local}+${alias}@${domain}`;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function formatDate(d) {
  return d.toISOString().split('T')[0];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const XP_THRESHOLDS = [0, 50, 200, 500, 1000, 2000, 4000, 8000, 16000, 32000];
function computeLevel(xp) {
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

// ── Core setup per user ──
async function setupUser(userCfg) {
  const email = makeEmail(userCfg.alias);
  console.log(`\n${'='.repeat(60)}`);
  console.log(`[${userCfg.id}] ${userCfg.display_name} <${email}>`);
  console.log('='.repeat(60));

  // (a) Create auth user
  let userId;
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = (existingUsers?.users || []).find(u => u.email === email);

  if (existing) {
    userId = existing.id;
    console.log(`  Auth: already exists (${userId})`);
  } else {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email,
      password: userCfg.password,
      email_confirm: true,
      user_metadata: { display_name: userCfg.display_name },
    });
    if (error) {
      console.error(`  Auth CREATE failed: ${error.message}`);
      return null;
    }
    userId = created.user.id;
    console.log(`  Auth: created (${userId})`);
  }

  // (b) Profiles
  const { error: profErr } = await supabase.from('profiles').upsert({
    user_id: userId,
    display_name: userCfg.display_name,
    target_board: userCfg.target_board_db || userCfg.target_board.toLowerCase().replace(/\s/g, ''),
    preferred_lang: userCfg.preferred_lang,
    role: 'student',
    weekly_report_enabled: true,
  }, { onConflict: 'user_id' });
  console.log(`  Profiles: ${profErr ? 'FAIL ' + profErr.message : 'OK'}`);

  // (c) Membership status
  if (userCfg.membership) {
    const m = userCfg.membership;
    const periodStart = formatDate(daysAgo(m.period_start_days_ago));
    const periodEnd = m.period_end_days_ahead
      ? formatDate(daysAgo(-m.period_end_days_ahead))
      : formatDate(daysAgo(m.period_end_days_ago));
    const { error: memErr } = await supabase.from('membership_status').upsert({
      user_id: userId,
      status: m.status,
      period_start: periodStart,
      period_end: periodEnd,
      provider: 'payhip',
    }, { onConflict: 'user_id' });
    console.log(`  Membership: ${memErr ? 'FAIL ' + memErr.message : 'OK'} (${m.status}, end=${periodEnd})`);
  } else {
    // T04: ensure no membership record — delete if exists
    await supabase.from('membership_status').delete().eq('user_id', userId);
    console.log(`  Membership: none (deleted if existed)`);
  }

  // (d) Entitlements
  const releaseIds = userCfg.entitlements === 'ALL_CIE' ? ALL_CIE : (userCfg.entitlements || []);
  // Clean existing test entitlements first
  await supabase.from('entitlements').delete().eq('user_id', userId);
  if (releaseIds.length > 0) {
    const expiresAt = userCfg.entitlements_expired
      ? daysAgo(6).toISOString()
      : null;
    const rows = releaseIds.map(rid => ({
      user_id: userId,
      release_id: rid,
      source: 'payhip',
      granted_at: daysAgo(60).toISOString(),
      expires_at: expiresAt,
    }));
    const { error: entErr } = await supabase.from('entitlements').insert(rows);
    console.log(`  Entitlements: ${entErr ? 'FAIL ' + entErr.message : 'OK'} (${releaseIds.length} releases${expiresAt ? ', expired' : ''})`);
  } else {
    console.log(`  Entitlements: none`);
  }

  // (e) Retired exercise session cleanup + synthetic learning activity
  const sessionCount = userCfg.sessions || 0;
  await supabase.from('question_attempts').delete().eq('user_id', userId);
  await supabase.from('exercise_sessions').delete().eq('user_id', userId);

  const dailyMap = new Map(); // date -> { sessions, questions, correct, time, skills }

  if (sessionCount > 0) {
    console.log(`  Learning activity: generating ${sessionCount} synthetic day entries...`);
    for (let s = 0; s < sessionCount; s++) {
      const skillCode = pickRandom(CIE_SKILL_CODES);
      const dayOffset = randomInt(1, 30);
      const startTime = daysAgo(dayOffset);
      startTime.setHours(randomInt(8, 20), randomInt(0, 59), 0, 0);
      const durationSec = randomInt(180, 600);
      const questionCount = 12;
      const accuracyPct = randomInt(60, 100);
      const correctCount = Math.round((accuracyPct / 100) * questionCount);

      // Accumulate daily activity
      const dateStr = formatDate(startTime);
      const day = dailyMap.get(dateStr) || {
        sessions: 0, questions: 0, correct: 0, time: 0, skills: new Set(),
      };
      day.sessions += 1;
      day.questions += questionCount;
      day.correct += correctCount;
      day.time += durationSec;
      day.skills.add(skillCode);
      dailyMap.set(dateStr, day);
    }
    console.log(`  Learning activity: ${sessionCount} synthetic sessions counted`);
  } else {
    console.log(`  Learning activity: 0 (skipped)`);
  }

  // (f) User streaks
  await supabase.from('user_streaks').delete().eq('user_id', userId);
  if (userCfg.streak) {
    const st = userCfg.streak;
    const lastActiveDate = st.current > 0 ? formatDate(daysAgo(0)) : formatDate(daysAgo(7));
    const { error: strErr } = await supabase.from('user_streaks').insert({
      user_id: userId,
      current_streak: st.current,
      best_streak: st.best,
      last_active_date: lastActiveDate,
      freeze_available: st.current >= 7,
      total_active_days: st.total_active_days,
    });
    console.log(`  Streaks: ${strErr ? 'FAIL ' + strErr.message : 'OK'} (current=${st.current}, best=${st.best})`);
  } else {
    console.log(`  Streaks: none`);
  }

  // (g) User XP
  await supabase.from('user_xp').delete().eq('user_id', userId);
  if (userCfg.xp > 0) {
    const level = computeLevel(userCfg.xp);
    const { error: xpErr } = await supabase.from('user_xp').insert({
      user_id: userId,
      total_xp: userCfg.xp,
      level,
    });
    console.log(`  XP: ${xpErr ? 'FAIL ' + xpErr.message : 'OK'} (${userCfg.xp} XP, level ${level})`);
  } else {
    console.log(`  XP: 0 (skipped)`);
  }

  // (h) User daily activity
  await supabase.from('user_daily_activity').delete().eq('user_id', userId);
  if (dailyMap.size > 0) {
    const activityRows = [];
    for (const [dateStr, day] of dailyMap) {
      activityRows.push({
        user_id: userId,
        activity_date: dateStr,
        sessions_completed: day.sessions,
        questions_answered: day.questions,
        correct_answers: day.correct,
        total_time_seconds: day.time,
        skills_practiced: [...day.skills],
      });
    }
    const { error: actErr } = await supabase.from('user_daily_activity').insert(activityRows);
    console.log(`  Daily Activity: ${actErr ? 'FAIL ' + actErr.message : 'OK'} (${activityRows.length} days)`);
  } else {
    console.log(`  Daily Activity: none`);
  }

  return { userId, email, alias: userCfg.alias, id: userCfg.id };
}

// ── Magic links ──
async function generateLinks(users) {
  console.log(`\n${'='.repeat(60)}`);
  console.log('MAGIC LINKS');
  console.log('='.repeat(60));

  for (const u of users) {
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: u.email,
    });
    if (error) {
      console.log(`  [${u.id}] ${u.alias}: FAIL — ${error.message}`);
    } else {
      const link = data?.properties?.action_link || 'no link returned';
      console.log(`  [${u.id}] ${u.alias}: ${link}`);
    }
  }
}

// ── Main ──
async function main() {
  const args = process.argv.slice(2);
  const linksOnly = args.includes('--links');
  const userFilter = args.find((_, i) => args[i - 1] === '--user');

  let targetUsers = usersConfig.users;
  if (userFilter) {
    targetUsers = targetUsers.filter(u => u.id === userFilter);
    if (targetUsers.length === 0) {
      console.error(`User ${userFilter} not found in users.json`);
      process.exit(1);
    }
  }

  if (linksOnly) {
    const results = targetUsers.map(u => ({
      userId: null,
      email: makeEmail(u.alias),
      alias: u.alias,
      id: u.id,
    }));
    await generateLinks(results);
    return;
  }

  console.log(`Setting up ${targetUsers.length} test user(s)...`);
  console.log(`Supabase: ${SUPABASE_URL}`);
  console.log(`Email base: ${EMAIL_BASE}`);

  const results = [];
  for (const userCfg of targetUsers) {
    const result = await setupUser(userCfg);
    if (result) results.push(result);
  }

  if (results.length > 0) {
    await generateLinks(results);
  }

  console.log(`\nDone. ${results.length}/${targetUsers.length} users set up successfully.`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
