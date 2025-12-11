import { Router, Response } from 'express';
import type { AuthenticatedRequest } from '../types/index';
import { alertService } from '../services/alert.service';
import { sendSuccess, sendNotFound } from '../utils/response';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireCaretaker } from '../middleware/role.middleware';

const router = Router();

// Get all alerts (Caretaker only)
router.get('/', authMiddleware, requireCaretaker, async (req: AuthenticatedRequest, res: Response) => {
    const alerts = await alertService.getForCaretaker(req.user!.id);
    return sendSuccess(res, alerts);
});

// Get unresolved count (Caretaker only)
router.get('/count', authMiddleware, requireCaretaker, async (req: AuthenticatedRequest, res: Response) => {
    const count = await alertService.getUnresolvedCount(req.user!.id);
    return sendSuccess(res, { count });
});

// Mark alert as resolved (Caretaker only)
router.put('/:id/resolve', authMiddleware, requireCaretaker, async (req: AuthenticatedRequest, res: Response) => {
    const resolved = await alertService.markResolved(req.params.id, req.user!.id);
    if (!resolved) {
        return sendNotFound(res, 'Alert');
    }
    return sendSuccess(res, resolved);
});

export default router;
