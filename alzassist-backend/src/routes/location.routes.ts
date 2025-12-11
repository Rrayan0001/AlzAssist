import { Router, Response } from 'express';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../types/index';
import { locationService } from '../services/location.service';
import { connectionService } from '../services/connection.service';
import { sendSuccess, sendError, sendCreated, sendForbidden } from '../utils/response';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePatient, requireCaretaker } from '../middleware/role.middleware';

const router = Router();

const submitLocationSchema = z.object({
    lat: z.number(),
    lng: z.number()
});

// Submit location (Patient only)
router.post('/', authMiddleware, requirePatient, async (req: AuthenticatedRequest, res: Response) => {
    const parsed = submitLocationSchema.safeParse(req.body);
    if (!parsed.success) {
        return sendError(res, parsed.error.message);
    }

    const result = await locationService.submitLocation(req.user!.id, parsed.data.lat, parsed.data.lng);
    if (!result.location) {
        return sendError(res, 'Failed to save location');
    }

    return sendCreated(res, {
        location: result.location,
        alertTriggered: result.alertTriggered
    });
});

// Get location history (Caretaker only)
router.get('/:patientId', authMiddleware, requireCaretaker, async (req: AuthenticatedRequest, res: Response) => {
    const { patientId } = req.params;

    // Check if connected
    const isConnected = await connectionService.isConnected(req.user!.id, patientId);
    if (!isConnected) {
        return sendForbidden(res, 'Not connected to this patient');
    }

    const locations = await locationService.getHistory(patientId);
    return sendSuccess(res, locations);
});

// Get latest location (Caretaker only)
router.get('/:patientId/latest', authMiddleware, requireCaretaker, async (req: AuthenticatedRequest, res: Response) => {
    const { patientId } = req.params;

    const isConnected = await connectionService.isConnected(req.user!.id, patientId);
    if (!isConnected) {
        return sendForbidden(res, 'Not connected to this patient');
    }

    const location = await locationService.getLatest(patientId);
    return sendSuccess(res, location);
});

export default router;
