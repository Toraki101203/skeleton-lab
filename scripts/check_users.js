import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // Note: listing users usually requires SERVICE_ROLE_KEY, but let's try with ANON or just check public.profiles

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
    console.log('Checking users...');

    // Method 1: Check public.profiles (accessible if RLS allows reading own profile, but maybe not all. 
    // However, if we are anon, we might not see anything. 
    // But we can try to sign in as one of the users I created earlier if any succeeded.)

    // Actually, we can't list auth users with anon key.
    // We can only check if we can sign in.

    const email = 'test01@example.com';
    const password = 'password123';

    console.log(`Attempting login for ${email}...`);
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        console.log(`Login failed for ${email}:`, error.message);
    } else {
        console.log(`Login SUCCESS for ${email}! User ID: ${data.user.id}`);
    }

    const email2 = 'test1@example.com';
    console.log(`Attempting login for ${email2}...`);
    const { data: data2, error: error2 } = await supabase.auth.signInWithPassword({
        email: email2,
        password
    });

    if (error2) {
        console.log(`Login failed for ${email2}:`, error2.message);
    } else {
        console.log(`Login SUCCESS for ${email2}! User ID: ${data2.user.id}`);
    }
}

checkUsers();
