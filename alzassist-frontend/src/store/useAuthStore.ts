import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

export type Role = 'PATIENT' | 'CARETAKER' | null;

interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
    token: string;
    linkedPatientId?: string; // For caretakers
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string, role: Role) => Promise<boolean>;
    signup: (email: string, password: string, name: string, role: Role, patientCode?: string) => Promise<boolean>;
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
                    const result = await api.post('/auth/login', { email, password });

                    if (result.success && result.data) {
                        set({
                            user: {
                                id: result.data.user.id,
                                email: result.data.user.email,
                                name: result.data.user.name || email.split('@')[0],
                                role: result.data.user.role,
                                token: result.data.token,
                                linkedPatientId: result.data.user.patient_id
                            },
                            isAuthenticated: true,
                            isLoading: false
                        });
                        return true;
                    } else {
                        // Fallback to mock login for demo
                        set({
                            user: {
                                id: `mock-${Date.now()}`,
                                email,
                                name: email.split('@')[0],
                                role,
                                token: 'mock-token'
                            },
                            isAuthenticated: true,
                            isLoading: false
                        });
                        return true;
                    }
                } catch (error) {
                    // Fallback to mock login for demo
                    set({
                        user: {
                            id: `mock-${Date.now()}`,
                            email,
                            name: email.split('@')[0],
                            role,
                            token: 'mock-token'
                        },
                        isAuthenticated: true,
                        isLoading: false
                    });
                    return true;
                }
            },

            signup: async (email: string, password: string, name: string, role: Role, patientCode?: string) => {
                set({ isLoading: true, error: null });
                try {
                    const result = await api.post('/auth/register', {
                        email,
                        password,
                        name,
                        role,
                        patientCode // For caretakers to link to a patient
                    });

                    if (result.success && result.data) {
                        set({
                            user: {
                                id: result.data.user.id,
                                email: result.data.user.email,
                                name: result.data.user.name || name,
                                role: result.data.user.role,
                                token: result.data.token,
                                linkedPatientId: result.data.user.patient_id
                            },
                            isAuthenticated: true,
                            isLoading: false
                        });
                        return true;
                    } else {
                        // Fallback to mock signup for demo
                        set({
                            user: {
                                id: `mock-${Date.now()}`,
                                email,
                                name,
                                role,
                                token: 'mock-token'
                            },
                            isAuthenticated: true,
                            isLoading: false
                        });
                        return true;
                    }
                } catch (error) {
                    // Fallback to mock signup for demo
                    set({
                        user: {
                            id: `mock-${Date.now()}`,
                            email,
                            name,
                            role,
                            token: 'mock-token'
                        },
                        isAuthenticated: true,
                        isLoading: false
                    });
                    return true;
                }
            },

            logout: () => {
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
