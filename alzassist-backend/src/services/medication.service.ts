import { supabaseAdmin } from '../db/supabase';
import type { Medication } from '../types/index';

export const medicationService = {
    async create(patientId: string, data: Omit<Medication, 'id' | 'patient_id' | 'created_at'>): Promise<Medication | null> {
        const { data: created, error } = await supabaseAdmin
            .from('medications')
            .insert({ patient_id: patientId, ...data })
            .select()
            .single();

        if (error) {
            console.error('Medication create error:', error);
            return null;
        }
        return created as Medication;
    },

    async getAll(patientId: string): Promise<Medication[]> {
        const { data, error } = await supabaseAdmin
            .from('medications')
            .select('*')
            .eq('patient_id', patientId)
            .order('time', { ascending: true });

        if (error) return [];
        return data as Medication[];
    },

    async update(id: string, patientId: string, updates: Partial<Medication>): Promise<Medication | null> {
        const { data, error } = await supabaseAdmin
            .from('medications')
            .update(updates)
            .eq('id', id)
            .eq('patient_id', patientId)
            .select()
            .single();

        if (error) return null;
        return data as Medication;
    },

    async delete(id: string, patientId: string): Promise<boolean> {
        const { error } = await supabaseAdmin
            .from('medications')
            .delete()
            .eq('id', id)
            .eq('patient_id', patientId);

        return !error;
    }
};
