export type Role = 'PATIENT' | 'CARETAKER';
export type ConnectionStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';
export type AlertType = 'GEOFENCE_EXIT' | 'LOW_BATTERY' | 'MISSED_MEDICATION';

export interface Profile {
    id: string;
    role: Role;
    name: string;
    phone?: string;
    home_lat?: number;
    home_lng?: number;
    created_at: string;
}

export interface Connection {
    id: string;
    caretaker_id: string;
    patient_id: string;
    status: ConnectionStatus;
    created_at: string;
}

export interface Journal {
    id: string;
    patient_id: string;
    content: string;
    mood?: string;
    created_at: string;
}

export interface Medication {
    id: string;
    patient_id: string;
    name: string;
    dosage: string;
    time: string;
    instructions?: string;
    taken: boolean;
    created_at: string;
}

export interface Task {
    id: string;
    patient_id: string;
    text: string;
    completed: boolean;
    created_at: string;
}

export interface Face {
    id: string;
    patient_id: string;
    name: string;
    relation: string;
    image_url: string;
    created_at: string;
}

export interface Location {
    id: string;
    patient_id: string;
    lat: number;
    lng: number;
    recorded_at: string;
}

export interface Alert {
    id: string;
    patient_id: string;
    caretaker_id?: string;
    type: AlertType;
    message: string;
    resolved: boolean;
    created_at: string;
}

// Request user from Supabase Auth
export interface AuthenticatedUser {
    id: string;
    email?: string;
    role: Role;
}

// Express Request extension
import { Request } from 'express';
export interface AuthenticatedRequest extends Request {
    user?: AuthenticatedUser;
}
