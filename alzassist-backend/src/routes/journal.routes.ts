import { Router, Response } from 'express';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../types/index';
import { journalService } from '../services/journal.service';
import { connectionService } from '../services/connection.service';
import { sendSuccess, sendError, sendCreated, sendNotFound, sendForbidden } from '../utils/response';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Create journal entry (Patient only)
const createJournalSchema = z.object({
    content: z.string().min(1),
    mood: z.string().optional()
});

router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    if (req.user!.role !== 'PATIENT') {
        return sendForbidden(res, 'Only patients can create journals');
    }

    const parsed = createJournalSchema.safeParse(req.body);
    if (!parsed.success) {
        return sendError(res, parsed.error.message);
    }

    const journal = await journalService.create(req.user!.id, parsed.data.content, parsed.data.mood);
    if (!journal) {
        return sendError(res, 'Failed to create journal');
    }
    return sendCreated(res, journal);
});

// Get all journals
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    let patientId = req.user!.id;

    // If caretaker, they need to specify patientId
    if (req.user!.role === 'CARETAKER') {
        const { patient_id } = req.query;
        if (!patient_id || typeof patient_id !== 'string') {
            return sendError(res, 'patient_id query parameter is required for caretakers');
        }

        // Check if connected
        const isConnected = await connectionService.isConnected(req.user!.id, patient_id);
        if (!isConnected) {
            return sendForbidden(res, 'Not connected to this patient');
        }
        patientId = patient_id;
    }

    const journals = await journalService.getAll(patientId);
    return sendSuccess(res, journals);
});

// Update journal (Patient only)
router.put('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    if (req.user!.role !== 'PATIENT') {
        return sendForbidden(res, 'Only patients can edit journals');
    }

    const updated = await journalService.update(req.params.id, req.user!.id, req.body);
    if (!updated) {
        return sendNotFound(res, 'Journal');
    }
    return sendSuccess(res, updated);
});

// Delete journal (Patient only)
router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    if (req.user!.role !== 'PATIENT') {
        return sendForbidden(res, 'Only patients can delete journals');
    }

    const deleted = await journalService.delete(req.params.id, req.user!.id);
    if (!deleted) {
        return sendNotFound(res, 'Journal');
    }
    return sendSuccess(res, { message: 'Journal deleted' });
});

export default router;
