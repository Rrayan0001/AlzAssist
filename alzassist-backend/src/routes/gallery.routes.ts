import { Router, Response } from 'express';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../types/index';
import { galleryService } from '../services/gallery.service';
import { sendSuccess, sendError, sendCreated, sendNotFound, sendForbidden } from '../utils/response';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePatient } from '../middleware/role.middleware';

const router = Router();

const createFaceSchema = z.object({
    name: z.string().min(1),
    relation: z.string().min(1),
    image_url: z.string().url()
});

// Add face (Patient only)
router.post('/', authMiddleware, requirePatient, async (req: AuthenticatedRequest, res: Response) => {
    const parsed = createFaceSchema.safeParse(req.body);
    if (!parsed.success) {
        return sendError(res, parsed.error.message);
    }

    const face = await galleryService.create(
        req.user!.id,
        parsed.data.name,
        parsed.data.relation,
        parsed.data.image_url
    );
    if (!face) {
        return sendError(res, 'Failed to add face');
    }
    return sendCreated(res, face);
});

// Get all faces (Patient only)
router.get('/', authMiddleware, requirePatient, async (req: AuthenticatedRequest, res: Response) => {
    const faces = await galleryService.getAll(req.user!.id);
    return sendSuccess(res, faces);
});

// Delete face (Patient only)
router.delete('/:id', authMiddleware, requirePatient, async (req: AuthenticatedRequest, res: Response) => {
    const deleted = await galleryService.delete(req.params.id, req.user!.id);
    if (!deleted) {
        return sendNotFound(res, 'Face');
    }
    return sendSuccess(res, { message: 'Face deleted' });
});

export default router;
