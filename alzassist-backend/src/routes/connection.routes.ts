import { Router, Response } from 'express';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../types/index';
import { connectionService } from '../services/connection.service';
import { sendSuccess, sendError, sendCreated } from '../utils/response';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePatient, requireCaretaker } from '../middleware/role.middleware';

const router = Router();

// Send connection request (Caretaker only)
router.post('/', authMiddleware, requireCaretaker, async (req: AuthenticatedRequest, res: Response) => {
    const { patientId } = req.body;
    if (!patientId) {
        return sendError(res, 'Patient ID is required');
    }

    const connection = await connectionService.sendRequest(req.user!.id, patientId);
    if (!connection) {
        return sendError(res, 'Failed to send connection request');
    }
    return sendCreated(res, connection);
});

// Accept/Reject connection request (Patient only)
const updateStatusSchema = z.object({
    status: z.enum(['ACCEPTED', 'REJECTED'])
});

router.put('/:id', authMiddleware, requirePatient, async (req: AuthenticatedRequest, res: Response) => {
    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) {
        return sendError(res, 'Invalid status. Must be ACCEPTED or REJECTED');
    }

    const updated = await connectionService.updateStatus(req.params.id, req.user!.id, parsed.data.status);
    if (!updated) {
        return sendError(res, 'Failed to update connection');
    }
    return sendSuccess(res, updated);
});

// Get connected patients (Caretaker only)
router.get('/patients', authMiddleware, requireCaretaker, async (req: AuthenticatedRequest, res: Response) => {
    const patients = await connectionService.getConnectedPatients(req.user!.id);
    return sendSuccess(res, patients);
});

// Get connected caretakers (Patient only)
router.get('/caretakers', authMiddleware, requirePatient, async (req: AuthenticatedRequest, res: Response) => {
    const caretakers = await connectionService.getConnectedCaretakers(req.user!.id);
    return sendSuccess(res, caretakers);
});

// Get pending requests (Patient only)
router.get('/requests', authMiddleware, requirePatient, async (req: AuthenticatedRequest, res: Response) => {
    const requests = await connectionService.getPendingRequests(req.user!.id);
    return sendSuccess(res, requests);
});

export default router;
