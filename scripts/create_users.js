import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const users = [
    { email: 'test1@example.com', password: 'password123', name: '運営事務局' },
    { email: 'test02@example.com', password: 'password123', name: '一般ユーザー' },
    { email: 'test03@example.com', password: 'password123', name: '加盟院管理者' }
];

async function createUsers() {
    console.log('Starting user creation...');

    for (const user of users) {
        console.log(`Creating user: ${user.email}...`);

        const { data, error } = await supabase.auth.signUp({
            email: user.email,
            password: user.password,
            options: {
                data: {
                    name: user.name,
                    // We can't set 'role' directly in metadata to control permissions securely 
                    // without a trigger or admin API, but we can set it for display.
                    // The actual role enforcement relies on the 'role' column in public.profiles
                    // which we will update via SQL.
                }
            }
        });

        if (error) {
            console.error(`Error creating ${user.email}:`, error.message);
        } else {
            console.log(`Success! User created: ${user.email} (ID: ${data.user?.id})`);
            if (data.user?.identities?.length === 0) {
                console.log('  -> User already exists (or identity missing).');
            }
        }
    }
    console.log('Finished.');
}

createUsers();
