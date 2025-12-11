import { supabaseAdmin } from '../db/supabase';
import type { Journal } from '../types/index';

export const journalService = {
    async create(patientId: string, content: string, mood?: string): Promise<Journal | null> {
        const { data, error } = await supabaseAdmin
            .from('journals')
            .insert({ patient_id: patientId, content, mood })
            .select()
            .single();

        if (error) {
            console.error('Journal create error:', error);
            return null;
        }
        return data as Journal;
    },

    async getAll(patientId: string): Promise<Journal[]> {
        const { data, error } = await supabaseAdmin
            .from('journals')
            .select('*')
            .eq('patient_id', patientId)
            .order('created_at', { ascending: false });

        if (error) return [];
        return data as Journal[];
    },

    async update(id: string, patientId: string, updates: Partial<Pick<Journal, 'content' | 'mood'>>): Promise<Journal | null> {
        const { data, error } = await supabaseAdmin
            .from('journals')
            .update(updates)
            .eq('id', id)
            .eq('patient_id', patientId)
            .select()
            .single();

        if (error) return null;
        return data as Journal;
    },

    async delete(id: string, patientId: string): Promise<boolean> {
        const { error } = await supabaseAdmin
            .from('journals')
            .delete()
            .eq('id', id)
            .eq('patient_id', patientId);

        return !error;
    }
};
