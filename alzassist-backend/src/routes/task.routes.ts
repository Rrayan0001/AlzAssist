import { Router, Response } from 'express';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../types/index';
import { taskService } from '../services/task.service';
import { connectionService } from '../services/connection.service';
import { sendSuccess, sendError, sendCreated, sendNotFound, sendForbidden } from '../utils/response';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Create task (Patient only)
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    if (req.user!.role !== 'PATIENT') {
        return sendForbidden(res, 'Only patients can add tasks');
    }

    const { text } = req.body;
    if (!text || typeof text !== 'string') {
        return sendError(res, 'Task text is required');
    }

    const task = await taskService.create(req.user!.id, text);
    if (!task) {
        return sendError(res, 'Failed to create task');
    }
    return sendCreated(res, task);
});

// Get all tasks
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

    const tasks = await taskService.getAll(patientId);
    return sendSuccess(res, tasks);
});

// Update task (Patient only)
router.put('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    if (req.user!.role !== 'PATIENT') {
        return sendForbidden(res, 'Only patients can edit tasks');
    }

    const updated = await taskService.update(req.params.id, req.user!.id, req.body);
    if (!updated) {
        return sendNotFound(res, 'Task');
    }
    return sendSuccess(res, updated);
});

// Delete task (Patient only)
router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    if (req.user!.role !== 'PATIENT') {
        return sendForbidden(res, 'Only patients can delete tasks');
    }

    const deleted = await taskService.delete(req.params.id, req.user!.id);
    if (!deleted) {
        return sendNotFound(res, 'Task');
    }
    return sendSuccess(res, { message: 'Task deleted' });
});

export default router;
