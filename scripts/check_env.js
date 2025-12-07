import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('VITE_SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);
console.log('SERVICE_ROLE_KEY exists:', !!process.env.SERVICE_ROLE_KEY);
