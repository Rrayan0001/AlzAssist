import { supabaseAdmin } from '../db/supabase';
import type { Connection, ConnectionStatus } from '../types/index';

export const connectionService = {
    async sendRequest(caretakerId: string, patientId: string): Promise<Connection | null> {
        // Check if connection already exists
        const { data: existing } = await supabaseAdmin
            .from('connections')
            .select('*')
            .eq('caretaker_id', caretakerId)
            .eq('patient_id', patientId)
            .single();

        if (existing) return existing as Connection;

        const { data, error } = await supabaseAdmin
            .from('connections')
            .insert({ caretaker_id: caretakerId, patient_id: patientId, status: 'PENDING' })
            .select()
            .single();

        if (error) {
            console.error('Connection request error:', error);
            return null;
        }
        return data as Connection;
    },

    async updateStatus(connectionId: string, patientId: string, status: ConnectionStatus): Promise<Connection | null> {
        const { data, error } = await supabaseAdmin
            .from('connections')
            .update({ status })
            .eq('id', connectionId)
            .eq('patient_id', patientId) // Ensure patient owns this connection
            .select()
            .single();

        if (error) {
            console.error('Connection update error:', error);
            return null;
        }
        return data as Connection;
    },

    async getConnectedPatients(caretakerId: string): Promise<any[]> {
        const { data, error } = await supabaseAdmin
            .from('connections')
            .select(`
        id,
        status,
        patient:profiles!connections_patient_id_fkey(id, name, phone, home_lat, home_lng)
      `)
            .eq('caretaker_id', caretakerId)
            .eq('status', 'ACCEPTED');

        if (error) {
            console.error('Get patients error:', error);
            return [];
        }
        return data || [];
    },

    async getConnectedCaretakers(patientId: string): Promise<any[]> {
        const { data, error } = await supabaseAdmin
            .from('connections')
            .select(`
        id,
        status,
        caretaker:profiles!connections_caretaker_id_fkey(id, name, phone)
      `)
            .eq('patient_id', patientId)
            .eq('status', 'ACCEPTED');

        if (error) {
            console.error('Get caretakers error:', error);
            return [];
        }
        return data || [];
    },

    async getPendingRequests(patientId: string): Promise<any[]> {
        const { data, error } = await supabaseAdmin
            .from('connections')
            .select(`
        id,
        status,
        created_at,
        caretaker:profiles!connections_caretaker_id_fkey(id, name, phone)
      `)
            .eq('patient_id', patientId)
            .eq('status', 'PENDING');

        if (error) return [];
        return data || [];
    },

    async isConnected(caretakerId: string, patientId: string): Promise<boolean> {
        const { data } = await supabaseAdmin
            .from('connections')
            .select('id')
            .eq('caretaker_id', caretakerId)
            .eq('patient_id', patientId)
            .eq('status', 'ACCEPTED')
            .single();

        return !!data;
    }
};
