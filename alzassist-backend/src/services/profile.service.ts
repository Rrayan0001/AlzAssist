import { supabaseAdmin } from '../db/supabase';
import type { Profile, Role } from '../types/index';

export const profileService = {
    async getById(id: string): Promise<Profile | null> {
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data as Profile;
    },

    async create(id: string, role: Role, name: string): Promise<Profile | null> {
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .insert({ id, role, name })
            .select()
            .single();

        if (error) {
            console.error('Profile creation error:', error);
            return null;
        }
        return data as Profile;
    },

    async update(id: string, updates: Partial<Pick<Profile, 'name' | 'phone' | 'home_lat' | 'home_lng'>>): Promise<Profile | null> {
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Profile update error:', error);
            return null;
        }
        return data as Profile;
    }
};
