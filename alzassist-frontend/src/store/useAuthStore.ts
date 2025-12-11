import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { api } from '@/lib/api';

export type Role = 'PATIENT' | 'CARETAKER' | null;

interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
    token: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string, expectedRole: Role) => Promise<boolean>;
    signup: (email: string, password: string, name: string, role: Role, patientEmail?: string) => Promise<boolean>;
    logout: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (email: string, password: string, expectedRole: Role) => {
                set({ isLoading: true, error: null });

                // Check if Supabase is configured
                if (!isSupabaseConfigured()) {
                    set({
                        isLoading: false,
                        error: 'Database not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
                    });
                    return false;
                }

                try {
                    // Sign in with Supabase Auth
                    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                        email,
                        password
                    });

                    if (authError) {
                        set({ isLoading: false, error: authError.message });
                        return false;
                    }

                    if (!authData.user || !authData.session) {
                        set({ isLoading: false, error: 'Login failed. Please try again.' });
                        return false;
                    }

                    // Get user profile to check role
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', authData.user.id)
                        .single();

                    if (profileError || !profile) {
                        set({ isLoading: false, error: 'User profile not found. Please sign up first.' });
                        await supabase.auth.signOut();
                        return false;
                    }

                    // Verify the user's role matches what they selected
                    if (profile.role !== expectedRole) {
                        set({
                            isLoading: false,
                            error: `This account is registered as a ${profile.role}. Please select the correct role.`
                        });
                        await supabase.auth.signOut();
                        return false;
                    }

                    set({
                        user: {
                            id: authData.user.id,
                            email: authData.user.email || email,
                            name: profile.name || email.split('@')[0],
                            role: profile.role,
                            token: authData.session.access_token
                        },
                        isAuthenticated: true,
                        isLoading: false,
                        error: null
                    });

                    return true;
                } catch (error) {
                    console.error('Login error:', error);
                    set({
                        isLoading: false,
                        error: 'An unexpected error occurred. Please try again.'
                    });
                    return false;
                }
            },

            signup: async (email: string, password: string, name: string, role: Role, patientEmail?: string) => {
                set({ isLoading: true, error: null });

                // Check if Supabase is configured
                if (!isSupabaseConfigured()) {
                    set({
                        isLoading: false,
                        error: 'Database not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
                    });
                    return false;
                }

                try {
                    // Sign up with Supabase Auth
                    const { data: authData, error: authError } = await supabase.auth.signUp({
                        email,
                        password,
                        options: {
                            data: {
                                name,
                                role
                            }
                        }
                    });

                    if (authError) {
                        set({ isLoading: false, error: authError.message });
                        return false;
                    }

                    if (!authData.user) {
                        set({ isLoading: false, error: 'Signup failed. Please try again.' });
                        return false;
                    }

                    // Create profile in the database
                    // First check if profile already exists
                    const { data: existingProfile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', authData.user.id)
                        .single();

                    if (!existingProfile) {
                        // Try to create profile via backend API
                        const profileResult = await api.post('/auth/signup', {
                            userId: authData.user.id,
                            role,
                            name
                        });

                        if (!profileResult.success) {
                            // Try to create profile directly via Supabase
                            const { error: insertError } = await supabase
                                .from('profiles')
                                .upsert({
                                    id: authData.user.id,
                                    role,
                                    name
                                }, { onConflict: 'id' });

                            if (insertError && insertError.code !== '23505') {
                                // Ignore duplicate key error, fail on other errors
                                console.error('Profile creation error:', insertError);
                                set({ isLoading: false, error: 'Failed to create profile. Please try again.' });
                                return false;
                            }
                        }
                    }

                    // If caretaker, log the intent to link (connection will be created via dashboard)
                    if (role === 'CARETAKER' && patientEmail) {
                        console.log('Caretaker wants to link to patient:', patientEmail);
                        // Connection can be established via dashboard "Link Patient" feature
                    }

                    // Auto-login after signup
                    if (authData.session) {
                        set({
                            user: {
                                id: authData.user.id,
                                email: authData.user.email || email,
                                name,
                                role,
                                token: authData.session.access_token
                            },
                            isAuthenticated: true,
                            isLoading: false,
                            error: null
                        });
                        return true;
                    } else {
                        // Email confirmation might be required
                        set({
                            isLoading: false,
                            error: 'Please check your email to confirm your account before logging in.'
                        });
                        return false;
                    }
                } catch (error) {
                    console.error('Signup error:', error);
                    set({
                        isLoading: false,
                        error: 'An unexpected error occurred. Please try again.'
                    });
                    return false;
                }
            },

            logout: async () => {
                try {
                    if (isSupabaseConfigured()) {
                        await supabase.auth.signOut();
                    }
                } catch (error) {
                    console.error('Logout error:', error);
                }

                set({ user: null, isAuthenticated: false, error: null });

                // Clear all persisted data
                localStorage.removeItem('auth-storage');
            },

            clearError: () => set({ error: null })
        }),
        {
            name: 'auth-storage',
        }
    )
);
