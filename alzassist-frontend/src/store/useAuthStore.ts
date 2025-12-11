import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'PATIENT' | 'CARETAKER' | null;

interface AuthState {
    user: {
        id: string;
        email: string;
        name: string;
        role: Role;
    } | null;
    isAuthenticated: boolean;
    login: (email: string, role: Role) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            login: (email, role) => set({
                user: {
                    id: "mock-id-123",
                    email,
                    name: email.split('@')[0],
                    role
                },
                isAuthenticated: true
            }),
            logout: () => set({ user: null, isAuthenticated: false }),
        }),
        {
            name: 'auth-storage',
        }
    )
);
