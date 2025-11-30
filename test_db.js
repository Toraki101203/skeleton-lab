import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('Testing connection to profiles table...');
    const start = Date.now();
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .limit(1);

        const duration = Date.now() - start;
        console.log(`Query took ${duration}ms`);

        if (error) {
            console.error('Error fetching profiles:', error);
        } else {
            console.log('Successfully fetched profiles:', data);
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

testConnection();
