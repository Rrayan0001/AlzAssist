import { createClient, SupabaseClient } from '@supabase/supabase-js';

// These should be set in environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
    return !!(supabaseUrl && supabaseAnonKey && supabaseUrl.includes('supabase'));
};

// Create a mock client that won't crash the app
const createMockClient = (): SupabaseClient => {
    return {
        auth: {
            signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
            signUp: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
            signOut: async () => ({ error: null }),
            getUser: async () => ({ data: { user: null }, error: null }),
        },
        from: () => ({
            select: () => ({ eq: () => ({ single: async () => ({ data: null, error: { message: 'Supabase not configured' } }) }) }),
            insert: () => ({ select: () => ({ single: async () => ({ data: null, error: { message: 'Supabase not configured' } }) }) }),
        }),
    } as unknown as SupabaseClient;
};

// Create the client - use mock if not configured
export const supabase: SupabaseClient = isSupabaseConfigured()
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createMockClient();

if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
}
