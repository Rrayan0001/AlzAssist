import { Response, NextFunction } from 'express';
import type { AuthenticatedRequest, Role } from '../types/index';
import { sendForbidden } from '../utils/response';

/**
 * Middleware to restrict access to specific roles
 */
export const requireRole = (...allowedRoles: Role[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            sendForbidden(res, 'User not authenticated');
            return;
        }

        if (!allowedRoles.includes(req.user.role)) {
            sendForbidden(res, `Access denied. Required role: ${allowedRoles.join(' or ')}`);
            return;
        }

        next();
    };
};

/**
 * Middleware to ensure user is a Patient
 */
export const requirePatient = requireRole('PATIENT');

/**
 * Middleware to ensure user is a Caretaker
 */
export const requireCaretaker = requireRole('CARETAKER');
