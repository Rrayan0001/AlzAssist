import { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/index';
import { supabaseAdmin } from '../db/supabase';
import { sendUnauthorized } from '../utils/response';

export const authMiddleware = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            sendUnauthorized(res, 'Missing or invalid authorization header');
            return;
        }

        const token = authHeader.split(' ')[1];

        // Verify the JWT with Supabase
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

        if (error || !user) {
            sendUnauthorized(res, 'Invalid or expired token');
            return;
        }

        // Fetch user profile to get role
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            sendUnauthorized(res, 'User profile not found');
            return;
        }

        req.user = {
            id: user.id,
            email: user.email,
            role: profile.role
        };

        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        sendUnauthorized(res, 'Authentication failed');
    }
};
