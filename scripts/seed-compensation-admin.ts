/**
 * Seed script to create default compensation admin user
 * Run with: npx tsx scripts/seed-compensation-admin.ts
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// Load environment variables from .env.local
// Make sure to run: export $(cat .env.local | xargs) or set them manually
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  console.error('Make sure .env.local file exists with these values');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedAdmin() {
  try {
    const username = 'admin';
    const password = 'Admin@2025';
    const fullName = 'System Administrator';

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Check if admin already exists
    const { data: existingAdmin } = await supabase
      .from('compensation_admins')
      .select('id, username')
      .eq('username', username)
      .single();

    if (existingAdmin) {
      console.log('Admin user already exists. Updating password...');
      
      // Update existing admin
      const { error: updateError } = await supabase
        .from('compensation_admins')
        .update({
          password_hash: passwordHash,
          full_name: fullName,
          role: 'SUPER_ADMIN',
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingAdmin.id);

      if (updateError) {
        console.error('Error updating admin:', updateError);
        process.exit(1);
      }

      console.log('✅ Admin user updated successfully!');
      console.log(`Username: ${username}`);
      console.log(`Password: ${password}`);
    } else {
      // Create new admin
      const { data: newAdmin, error: insertError } = await supabase
        .from('compensation_admins')
        .insert({
          username,
          password_hash: passwordHash,
          full_name: fullName,
          role: 'SUPER_ADMIN',
          is_active: true,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating admin:', insertError);
        process.exit(1);
      }

      console.log('✅ Admin user created successfully!');
      console.log(`Username: ${username}`);
      console.log(`Password: ${password}`);
      console.log(`Admin ID: ${newAdmin.id}`);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

seedAdmin();

