import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../db/supabase';
import { sendSuccess, sendError, sendNotFound } from '../utils/response';

const router = Router();

// Get profile by ID
router.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const { data: profile, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !profile) {
            return sendNotFound(res, 'Profile');
        }
        return sendSuccess(res, profile);
    } catch (err) {
        return sendError(res, 'Failed to fetch profile');
    }
});

// Update profile
const updateProfileSchema = z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    age: z.number().optional(),
    address: z.string().optional(),
    // Allow any other fields we might need
});

router.put('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    const parsed = updateProfileSchema.safeParse(req.body);
    // basic validation, but let's be flexible

    try {
        const { data: updated, error } = await supabaseAdmin
            .from('users')
            .update(req.body) // Update with whatever is passed
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Update error:', error);
            return sendError(res, 'Failed to update profile');
        }
        return sendSuccess(res, updated);
    } catch (err) {
        return sendError(res, 'Unexpected error updating profile');
    }
});

export default router;
