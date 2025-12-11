import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../db/supabase';
import { sendSuccess, sendError, sendCreated, sendUnauthorized } from '../utils/response';

const router = Router();

// Signup Schema
const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(1),
    role: z.enum(['PATIENT', 'CARETAKER'])
});

// Login Schema
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
    role: z.enum(['PATIENT', 'CARETAKER'])
});

// SIGNUP - Create new user
router.post('/signup', async (req: Request, res: Response) => {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
        return sendError(res, parsed.error.errors[0].message);
    }

    const { email, password, name, role } = parsed.data;

    try {
        // Check if user already exists
        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', email.toLowerCase())
            .single();

        if (existingUser) {
            return sendError(res, 'An account with this email already exists. Please log in.');
        }

        // Create new user
        const { data: newUser, error } = await supabaseAdmin
            .from('users')
            .insert({
                email: email.toLowerCase(),
                password, // Plain text as requested
                name,
                role
            })
            .select()
            .single();

        if (error) {
            console.error('Signup error:', error);
            return sendError(res, 'Failed to create account. Please try again.');
        }

        // Return user data (without password)
        return sendCreated(res, {
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role
            }
        });
    } catch (err) {
        console.error('Signup error:', err);
        return sendError(res, 'An unexpected error occurred.');
    }
});

// LOGIN - Authenticate user
router.post('/login', async (req: Request, res: Response) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return sendError(res, parsed.error.errors[0].message);
    }

    const { email, password, role } = parsed.data;

    try {
        // Find user by email
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', email.toLowerCase())
            .single();

        if (error || !user) {
            return sendUnauthorized(res, 'No account found with this email. Please sign up.');
        }

        // Check password
        if (user.password !== password) {
            return sendUnauthorized(res, 'Incorrect password. Please try again.');
        }

        // Check role matches
        if (user.role !== role) {
            return sendUnauthorized(res, `This account is registered as a ${user.role}. Please select the correct role.`);
        }

        // Return user data (without password)
        return sendSuccess(res, {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        return sendError(res, 'An unexpected error occurred.');
    }
});

// GET ME - Get current user (for session validation)
router.get('/me/:userId', async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('id, email, name, role')
            .eq('id', userId)
            .single();

        if (error || !user) {
            return sendUnauthorized(res, 'User not found');
        }

        return sendSuccess(res, { user });
    } catch (err) {
        console.error('Get user error:', err);
        return sendError(res, 'An unexpected error occurred.');
    }
});

export default router;
