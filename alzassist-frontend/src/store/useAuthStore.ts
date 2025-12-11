import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

export type Role = 'PATIENT' | 'CARETAKER' | null;

interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string, role: Role) => Promise<boolean>;
    signup: (email: string, password: string, name: string, role: Role) => Promise<boolean>;
    logout: () => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (email: string, password: string, role: Role) => {
                set({ isLoading: true, error: null });

                try {
                    const response = await api.post('/auth/login', {
                        email,
                        password,
                        role
                    });

                    if (!response.success) {
                        set({ isLoading: false, error: response.error || 'Login failed' });
                        return false;
                    }

                    set({
                        user: response.data.user,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null
                    });

                    return true;
                } catch (error) {
                    console.error('Login error:', error);
                    set({
                        isLoading: false,
                        error: 'Unable to connect to server. Please try again.'
                    });
                    return false;
                }
            },

            signup: async (email: string, password: string, name: string, role: Role) => {
                set({ isLoading: true, error: null });

                try {
                    const response = await api.post('/auth/signup', {
                        email,
                        password,
                        name,
                        role
                    });

                    if (!response.success) {
                        set({ isLoading: false, error: response.error || 'Signup failed' });
                        return false;
                    }

                    // Auto-login after successful signup
                    set({
                        user: response.data.user,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null
                    });

                    return true;
                } catch (error) {
                    console.error('Signup error:', error);
                    set({
                        isLoading: false,
                        error: 'Unable to connect to server. Please try again.'
                    });
                    return false;
                }
            },

            logout: () => {
                set({ user: null, isAuthenticated: false, error: null });
                localStorage.removeItem('auth-storage');
            },

            clearError: () => set({ error: null })
        }),
        {
            name: 'auth-storage',
        }
    )
);
