import { Router, Response } from 'express';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../types/index';
import { profileService } from '../services/profile.service';
import { sendSuccess, sendError, sendNotFound } from '../utils/response';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Get current user profile
router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    const profile = await profileService.getById(req.user!.id);
    if (!profile) {
        return sendNotFound(res, 'Profile');
    }
    return sendSuccess(res, profile);
});

// Get profile by ID
router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    const profile = await profileService.getById(req.params.id);
    if (!profile) {
        return sendNotFound(res, 'Profile');
    }
    return sendSuccess(res, profile);
});

// Update profile
const updateProfileSchema = z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    home_lat: z.number().optional(),
    home_lng: z.number().optional()
});

router.put('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    // Ensure user can only update their own profile
    if (req.params.id !== req.user!.id) {
        return sendError(res, 'You can only update your own profile', 403);
    }

    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
        return sendError(res, parsed.error.message);
    }

    const updated = await profileService.update(req.params.id, parsed.data);
    if (!updated) {
        return sendError(res, 'Failed to update profile');
    }
    return sendSuccess(res, updated);
});

export default router;
