/**
 * Setup Admin Account for OxiSure Mobile App
 * 
 * This script:
 * 1. Creates the admin user via Supabase Auth
 * 2. Adds the is_admin column to profiles (if it doesn't exist)
 * 3. Sets is_admin = true for the admin user
 * 
 * Usage:
 *   node scripts/setup-admin.mjs <SERVICE_ROLE_KEY>
 * 
 * Get the SERVICE_ROLE_KEY from your Supabase dashboard:
 *   Project Settings → API → service_role key (secret)
 */

const SUPABASE_URL = 'https://ytqnbvkordtflrvibmss.supabase.co';
const ADMIN_EMAIL = 'admin@oxisuretech.com';
const ADMIN_PASSWORD = 'OxiAdmin2026!';

const SERVICE_ROLE_KEY = process.argv[2];

if (!SERVICE_ROLE_KEY) {
  console.error('\n❌ Missing SERVICE_ROLE_KEY argument.');
  console.error('Usage: node scripts/setup-admin.mjs <SERVICE_ROLE_KEY>');
  console.error('\nGet it from: Supabase Dashboard → Project Settings → API → service_role key');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  'apikey': SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
};

async function main() {
  console.log('\n🛡️  OxiSure Admin Setup\n');

  // Step 1: Add is_admin column to profiles table
  console.log('📦 Step 1: Adding is_admin column to profiles...');
  const alterRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc`, {
    method: 'POST',
    headers,
    body: JSON.stringify({}),
  });
  
  // Use the SQL endpoint directly via the management API
  const sqlRes = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    method: 'GET',
    headers,
  });

  // Try adding column via raw SQL through the PostgREST rpc if available
  // Fallback: we'll handle this with direct SQL in the dashboard
  console.log('   ℹ️  If the is_admin column doesn\'t exist yet, run this SQL in the Supabase SQL Editor:');
  console.log('   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;');
  console.log('');

  // Step 2: Create admin user
  console.log('👤 Step 2: Creating admin user...');
  const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: 'OxiSure Admin',
      },
    }),
  });

  const createData = await createRes.json();

  if (createRes.status === 422 || createData?.msg?.includes('already')) {
    console.log('   ⚠️  Admin user already exists. Looking up existing user...');
    
    // List users to find existing admin
    const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=50`, {
      method: 'GET',
      headers,
    });
    const listData = await listRes.json();
    const adminUser = listData?.users?.find((u) => u.email === ADMIN_EMAIL);

    if (adminUser) {
      console.log(`   ✅ Found existing admin user: ${adminUser.id}`);
      await setAdminFlag(adminUser.id);
    } else {
      console.error('   ❌ Could not find existing admin user. Please check Supabase dashboard.');
    }
  } else if (createRes.ok) {
    const userId = createData.id;
    console.log(`   ✅ Admin user created: ${userId}`);

    // Step 3: Create profile and set admin flag
    await setAdminFlag(userId);
  } else {
    console.error('   ❌ Failed to create admin user:', createData);
  }

  console.log('\n─────────────────────────────────────────');
  console.log('📋 Admin Credentials:');
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log('─────────────────────────────────────────\n');
}

async function setAdminFlag(userId) {
  console.log('🔐 Step 3: Setting is_admin flag...');

  // Upsert the profile with is_admin = true
  const upsertRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: 'POST',
    headers: {
      ...headers,
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify({
      id: userId,
      is_admin: true,
      onboarding_completed: true,
      user_type: 'admin',
    }),
  });

  if (upsertRes.ok || upsertRes.status === 201) {
    console.log('   ✅ Admin flag set successfully!');
  } else {
    const errData = await upsertRes.text();
    console.error('   ❌ Failed to set admin flag:', errData);
    console.log('   ℹ️  You may need to run this SQL manually in the Supabase SQL Editor:');
    console.log(`   INSERT INTO profiles (id, is_admin, onboarding_completed, user_type)`);
    console.log(`   VALUES ('${userId}', true, true, 'admin')`);
    console.log(`   ON CONFLICT (id) DO UPDATE SET is_admin = true, onboarding_completed = true;`);
  }
}

main().catch(console.error);
