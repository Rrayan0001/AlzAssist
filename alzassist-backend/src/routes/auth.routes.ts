import { Router, Response } from 'express';
import { z } from 'zod';
import type { AuthenticatedRequest, Role } from '../types/index';
import { supabaseAdmin } from '../db/supabase';
import { profileService } from '../services/profile.service';
import { sendSuccess, sendError, sendCreated } from '../utils/response';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Signup - Create profile after Supabase Auth signup
const signupSchema = z.object({
    userId: z.string().uuid(),
    role: z.enum(['PATIENT', 'CARETAKER']),
    name: z.string().min(1)
});

router.post('/signup', async (req, res: Response) => {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
        return sendError(res, parsed.error.message);
    }

    const { userId, role, name } = parsed.data;

    // Check if profile already exists
    const existing = await profileService.getById(userId);
    if (existing) {
        return sendError(res, 'Profile already exists');
    }

    const profile = await profileService.create(userId, role as Role, name);
    if (!profile) {
        return sendError(res, 'Failed to create profile');
    }

    return sendCreated(res, profile);
});

// Get current authenticated user
router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    const profile = await profileService.getById(req.user!.id);
    return sendSuccess(res, {
        user: req.user,
        profile
    });
});

export default router;
