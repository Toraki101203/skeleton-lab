import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Please check your .env file.');
}

console.log('Supabase URL:', supabaseUrl); // Debug logging

export const supabase = createClient(
    supabaseUrl || 'https://mock-project.supabase.co',
    supabaseAnonKey || 'mock-key'
);
