#!/usr/bin/env node
/**
 * Create demo student and teacher accounts in Supabase Auth,
 * then run the SQL seed script to populate test data.
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   node scripts/seed_demo_accounts.js
 *
 * This script:
 *   1. Creates (or finds) two auth users: demo-student@25maths.com, demo-teacher@25maths.com
 *   2. Creates their profiles
 *   3. Outputs UUIDs for use with seed.demo_accounts.sql
 *
 * The SQL seed can then be run separately in Supabase SQL Editor
 * with the correct UUIDs substituted.
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const DEMO_USERS = [
  {
    email: 'demo-student@25maths.com',
    password: 'Demo2026!Student',
    role: 'student',
    display_name: 'Demo Student (王小明)',
    target_board: 'cie0580',
    preferred_lang: 'en',
  },
  {
    email: 'demo-teacher@25maths.com',
    password: 'Demo2026!Teacher',
    role: 'teacher',
    display_name: 'Demo Teacher (张老师)',
    target_board: 'mixed',
    preferred_lang: 'zh-CN',
  },
];

async function adminFetch(path, options = {}) {
  const url = `${SUPABASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const body = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, body };
}

async function findOrCreateUser(user) {
  // Try to find existing user by email
  const listRes = await adminFetch(
    `/auth/v1/admin/users?page=1&per_page=1000`
  );
  if (listRes.ok && listRes.body?.users) {
    const existing = listRes.body.users.find(
      (u) => u.email === user.email
    );
    if (existing) {
      console.log(`  Found existing: ${user.email} -> ${existing.id}`);
      return existing.id;
    }
  }

  // Create new user
  const createRes = await adminFetch('/auth/v1/admin/users', {
    method: 'POST',
    body: JSON.stringify({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        role: user.role,
        display_name: user.display_name,
      },
    }),
  });

  if (!createRes.ok) {
    console.error(`  Failed to create ${user.email}:`, createRes.body);
    return null;
  }

  console.log(`  Created: ${user.email} -> ${createRes.body.id}`);
  return createRes.body.id;
}

async function upsertProfile(userId, user) {
  const res = await adminFetch('/rest/v1/profiles', {
    method: 'POST',
    headers: {
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify({
      user_id: userId,
      display_name: user.display_name,
      target_board: user.target_board,
      role: user.role,
      preferred_lang: user.preferred_lang,
    }),
  });

  if (res.ok || res.status === 201) {
    console.log(`  Profile upserted for ${user.email}`);
  } else {
    console.warn(`  Profile upsert issue for ${user.email}:`, res.status, res.body);
  }
}

async function main() {
  console.log('=== 25Maths Demo Account Setup ===\n');
  console.log(`Supabase: ${SUPABASE_URL}\n`);

  const userIds = {};

  for (const user of DEMO_USERS) {
    console.log(`Processing: ${user.email} (${user.role})`);
    const userId = await findOrCreateUser(user);
    if (!userId) {
      console.error(`  Skipping profile for ${user.email}`);
      continue;
    }
    userIds[user.role] = userId;
    await upsertProfile(userId, user);
    console.log();
  }

  console.log('=== Results ===\n');

  if (userIds.student) {
    console.log(`Student UUID: ${userIds.student}`);
    console.log(`  Email: demo-student@25maths.com`);
    console.log(`  Password: Demo2026!Student`);
  }
  if (userIds.teacher) {
    console.log(`Teacher UUID: ${userIds.teacher}`);
    console.log(`  Email: demo-teacher@25maths.com`);
    console.log(`  Password: Demo2026!Teacher`);
  }

  console.log('\n=== Next Steps ===\n');
  console.log('1. Copy the UUIDs above');
  console.log('2. Open supabase/seed.demo_accounts.sql');
  console.log('3. Replace the placeholder UUIDs:');
  console.log('   v_student_id := \'<student-uuid>\';');
  console.log('   v_teacher_id := \'<teacher-uuid>\';');
  console.log('4. Run the SQL in Supabase SQL Editor');
  console.log('5. Or use the Supabase CLI: supabase db execute < supabase/seed.demo_accounts.sql');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
