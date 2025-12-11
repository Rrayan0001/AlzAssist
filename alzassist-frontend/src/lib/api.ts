// API Configuration
// In development, the backend runs on localhost:3000
// In production, replace with your Render backend URL

// Dynamically determine API URL based on current hostname
// This allows the app to work on localhost and LAN IPs (e.g. 192.168.x.x)
const hostname = window.location.hostname;
export const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${hostname}:3000`;

export const api = {
    get: async (endpoint: string, token?: string) => {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
        return response.json();
    },

    post: async (endpoint: string, data: unknown, token?: string) => {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        return response.json();
    },

    put: async (endpoint: string, data: unknown, token?: string) => {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data)
        });
        return response.json();
    },

    delete: async (endpoint: string, token?: string) => {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers
        });
        return response.json();
    }
};
