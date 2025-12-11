import { supabaseAdmin } from '../db/supabase';
import type { Location, Alert } from '../types/index';
import { haversineDistance } from '../utils/haversine';
import { profileService } from './profile.service';
import { connectionService } from './connection.service';

const GEOFENCE_RADIUS = parseInt(process.env.GEOFENCE_RADIUS_METERS || '500', 10);

export const locationService = {
    async submitLocation(patientId: string, lat: number, lng: number): Promise<{ location: Location | null; alertTriggered: boolean }> {
        // Insert location record
        const { data: location, error } = await supabaseAdmin
            .from('locations')
            .insert({ patient_id: patientId, lat, lng })
            .select()
            .single();

        if (error) {
            console.error('Location insert error:', error);
            return { location: null, alertTriggered: false };
        }

        // Check geofence
        const profile = await profileService.getById(patientId);
        if (!profile || profile.home_lat === null || profile.home_lng === null) {
            return { location: location as Location, alertTriggered: false };
        }

        const distance = haversineDistance(lat, lng, profile.home_lat!, profile.home_lng!);

        if (distance > GEOFENCE_RADIUS) {
            // Trigger alert for all connected caretakers
            const connections = await connectionService.getConnectedCaretakers(patientId);

            for (const conn of connections) {
                await supabaseAdmin
                    .from('alerts')
                    .insert({
                        patient_id: patientId,
                        caretaker_id: conn.caretaker?.id,
                        type: 'GEOFENCE_EXIT',
                        message: `Patient ${profile.name} has left the safe zone (${Math.round(distance)}m from home)`,
                        resolved: false
                    });
            }

            return { location: location as Location, alertTriggered: true };
        }

        return { location: location as Location, alertTriggered: false };
    },

    async getHistory(patientId: string, limit = 50): Promise<Location[]> {
        const { data, error } = await supabaseAdmin
            .from('locations')
            .select('*')
            .eq('patient_id', patientId)
            .order('recorded_at', { ascending: false })
            .limit(limit);

        if (error) return [];
        return data as Location[];
    },

    async getLatest(patientId: string): Promise<Location | null> {
        const { data, error } = await supabaseAdmin
            .from('locations')
            .select('*')
            .eq('patient_id', patientId)
            .order('recorded_at', { ascending: false })
            .limit(1)
            .single();

        if (error) return null;
        return data as Location;
    }
};
