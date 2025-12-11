import { Response } from 'express';

export const sendSuccess = <T>(res: Response, data: T, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        data
    });
};

export const sendError = (res: Response, message: string, statusCode = 400) => {
    return res.status(statusCode).json({
        success: false,
        error: message
    });
};

export const sendCreated = <T>(res: Response, data: T) => {
    return sendSuccess(res, data, 201);
};

export const sendNotFound = (res: Response, resource = 'Resource') => {
    return sendError(res, `${resource} not found`, 404);
};

export const sendUnauthorized = (res: Response, message = 'Unauthorized') => {
    return sendError(res, message, 401);
};

export const sendForbidden = (res: Response, message = 'Forbidden') => {
    return sendError(res, message, 403);
};
