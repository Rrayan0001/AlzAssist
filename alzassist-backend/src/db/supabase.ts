import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('⚠️  Supabase credentials not found. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
}

// Admin client with service role key (bypasses RLS)
export const supabaseAdmin = createClient(
    supabaseUrl || '',
    supabaseServiceKey || '',
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

// Client for user-scoped operations (uses anon key)
export const getSupabaseClient = (accessToken?: string) => {
    return createClient(
        supabaseUrl || '',
        process.env.SUPABASE_ANON_KEY || '',
        {
            global: {
                headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
            }
        }
    );
};
