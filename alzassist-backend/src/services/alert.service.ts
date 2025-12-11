import { supabaseAdmin } from '../db/supabase';
import type { Alert } from '../types/index';

export const alertService = {
    async getForCaretaker(caretakerId: string): Promise<any[]> {
        const { data, error } = await supabaseAdmin
            .from('alerts')
            .select(`
        *,
        patient:profiles!alerts_patient_id_fkey(id, name)
      `)
            .eq('caretaker_id', caretakerId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Alerts fetch error:', error);
            return [];
        }
        return data || [];
    },

    async markResolved(alertId: string, caretakerId: string): Promise<Alert | null> {
        const { data, error } = await supabaseAdmin
            .from('alerts')
            .update({ resolved: true })
            .eq('id', alertId)
            .eq('caretaker_id', caretakerId)
            .select()
            .single();

        if (error) return null;
        return data as Alert;
    },

    async getUnresolvedCount(caretakerId: string): Promise<number> {
        const { count, error } = await supabaseAdmin
            .from('alerts')
            .select('*', { count: 'exact', head: true })
            .eq('caretaker_id', caretakerId)
            .eq('resolved', false);

        if (error) return 0;
        return count || 0;
    }
};
