import { supabaseAdmin } from '../db/supabase';
import type { Face } from '../types/index';

export const galleryService = {
    async create(patientId: string, name: string, relation: string, imageUrl: string): Promise<Face | null> {
        const { data, error } = await supabaseAdmin
            .from('faces')
            .insert({ patient_id: patientId, name, relation, image_url: imageUrl })
            .select()
            .single();

        if (error) {
            console.error('Face create error:', error);
            return null;
        }
        return data as Face;
    },

    async getAll(patientId: string): Promise<Face[]> {
        const { data, error } = await supabaseAdmin
            .from('faces')
            .select('*')
            .eq('patient_id', patientId)
            .order('created_at', { ascending: false });

        if (error) return [];
        return data as Face[];
    },

    async delete(id: string, patientId: string): Promise<boolean> {
        const { error } = await supabaseAdmin
            .from('faces')
            .delete()
            .eq('id', id)
            .eq('patient_id', patientId);

        return !error;
    }
};
