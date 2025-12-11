import { supabaseAdmin } from '../db/supabase';
import type { Task } from '../types/index';

export const taskService = {
    async create(patientId: string, text: string): Promise<Task | null> {
        const { data, error } = await supabaseAdmin
            .from('tasks')
            .insert({ patient_id: patientId, text, completed: false })
            .select()
            .single();

        if (error) {
            console.error('Task create error:', error);
            return null;
        }
        return data as Task;
    },

    async getAll(patientId: string): Promise<Task[]> {
        const { data, error } = await supabaseAdmin
            .from('tasks')
            .select('*')
            .eq('patient_id', patientId)
            .order('created_at', { ascending: true });

        if (error) return [];
        return data as Task[];
    },

    async update(id: string, patientId: string, updates: Partial<Pick<Task, 'text' | 'completed'>>): Promise<Task | null> {
        const { data, error } = await supabaseAdmin
            .from('tasks')
            .update(updates)
            .eq('id', id)
            .eq('patient_id', patientId)
            .select()
            .single();

        if (error) return null;
        return data as Task;
    },

    async delete(id: string, patientId: string): Promise<boolean> {
        const { error } = await supabaseAdmin
            .from('tasks')
            .delete()
            .eq('id', id)
            .eq('patient_id', patientId);

        return !error;
    }
};
