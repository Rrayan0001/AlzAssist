import { Router, Response } from 'express';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../types/index';
import { medicationService } from '../services/medication.service';
import { connectionService } from '../services/connection.service';
import { sendSuccess, sendError, sendCreated, sendNotFound, sendForbidden } from '../utils/response';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

const createMedicationSchema = z.object({
    name: z.string().min(1),
    dosage: z.string().min(1),
    time: z.string().min(1),
    instructions: z.string().optional(),
    taken: z.boolean().default(false)
});

// Create medication (Patient only)
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    if (req.user!.role !== 'PATIENT') {
        return sendForbidden(res, 'Only patients can add medications');
    }

    const parsed = createMedicationSchema.safeParse(req.body);
    if (!parsed.success) {
        return sendError(res, parsed.error.message);
    }

    const medication = await medicationService.create(req.user!.id, parsed.data);
    if (!medication) {
        return sendError(res, 'Failed to create medication');
    }
    return sendCreated(res, medication);
});

// Get all medications
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    let patientId = req.user!.id;

    if (req.user!.role === 'CARETAKER') {
        const { patient_id } = req.query;
        if (!patient_id || typeof patient_id !== 'string') {
            return sendError(res, 'patient_id query parameter is required for caretakers');
        }

        const isConnected = await connectionService.isConnected(req.user!.id, patient_id);
        if (!isConnected) {
            return sendForbidden(res, 'Not connected to this patient');
        }
        patientId = patient_id;
    }

    const medications = await medicationService.getAll(patientId);
    return sendSuccess(res, medications);
});

// Update medication (Patient only)
router.put('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    if (req.user!.role !== 'PATIENT') {
        return sendForbidden(res, 'Only patients can edit medications');
    }

    const updated = await medicationService.update(req.params.id, req.user!.id, req.body);
    if (!updated) {
        return sendNotFound(res, 'Medication');
    }
    return sendSuccess(res, updated);
});

// Delete medication (Patient only)
router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    if (req.user!.role !== 'PATIENT') {
        return sendForbidden(res, 'Only patients can delete medications');
    }

    const deleted = await medicationService.delete(req.params.id, req.user!.id);
    if (!deleted) {
        return sendNotFound(res, 'Medication');
    }
    return sendSuccess(res, { message: 'Medication deleted' });
});

export default router;
