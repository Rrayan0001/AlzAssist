import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../db/supabase';
import { sendSuccess, sendError, sendCreated } from '../utils/response';

const router = Router();

// ========== JOURNALS ==========

// Get journals for a user
router.get('/journals/:userId', async (req: Request, res: Response) => {
    const { userId } = req.params;

    if (!userId) {
        return sendError(res, 'User ID is required');
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('journals')
            .select('*')
            .eq('patient_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Journals fetch error:', error);
            return sendError(res, error.message);
        }
        return sendSuccess(res, data || []);
    } catch (err) {
        console.error('Journals fetch exception:', err);
        return sendError(res, 'Failed to fetch journals');
    }
});

// Create journal entry
router.post('/journals', async (req: Request, res: Response) => {
    const { userId, content, mood } = req.body;

    if (!userId || !content) {
        return sendError(res, 'User ID and content are required');
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('journals')
            .insert({ patient_id: userId, content, mood: mood || 'Neutral' })
            .select()
            .single();

        if (error) {
            console.error('Journal create error:', error);
            return sendError(res, error.message);
        }
        return sendCreated(res, data);
    } catch (err) {
        console.error('Journal create exception:', err);
        return sendError(res, 'Failed to create journal entry');
    }
});

// Delete journal entry
router.delete('/journals/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const { error } = await supabaseAdmin.from('journals').delete().eq('id', id);
        if (error) {
            console.error('Journal delete error:', error);
            return sendError(res, error.message);
        }
        return sendSuccess(res, { message: 'Deleted' });
    } catch (err) {
        console.error('Journal delete exception:', err);
        return sendError(res, 'Failed to delete journal entry');
    }
});

// ========== MEDICATIONS ==========

// Get medications for a user
router.get('/medications/:userId', async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const { data, error } = await supabaseAdmin
            .from('medications')
            .select('*')
            .eq('patient_id', userId)
            .order('time', { ascending: true });

        if (error) return sendError(res, error.message);
        return sendSuccess(res, data || []);
    } catch (err) {
        return sendError(res, 'Failed to fetch medications');
    }
});

// Create medication
router.post('/medications', async (req: Request, res: Response) => {
    const { userId, name, dosage, time, instructions } = req.body;
    try {
        const { data, error } = await supabaseAdmin
            .from('medications')
            .insert({ patient_id: userId, name, dosage, time, instructions, taken: false })
            .select()
            .single();

        if (error) return sendError(res, error.message);
        return sendCreated(res, data);
    } catch (err) {
        return sendError(res, 'Failed to create medication');
    }
});

// Update medication (mark as taken)
router.put('/medications/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { taken } = req.body;
    try {
        const { data, error } = await supabaseAdmin
            .from('medications')
            .update({ taken })
            .eq('id', id)
            .select()
            .single();

        if (error) return sendError(res, error.message);
        return sendSuccess(res, data);
    } catch (err) {
        return sendError(res, 'Failed to update medication');
    }
});

// Delete medication
router.delete('/medications/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const { error } = await supabaseAdmin.from('medications').delete().eq('id', id);
        if (error) return sendError(res, error.message);
        return sendSuccess(res, { message: 'Deleted' });
    } catch (err) {
        return sendError(res, 'Failed to delete medication');
    }
});

// ========== TASKS ==========

// Get tasks for a user
router.get('/tasks/:userId', async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const { data, error } = await supabaseAdmin
            .from('tasks')
            .select('*')
            .eq('patient_id', userId)
            .order('created_at', { ascending: true });

        if (error) return sendError(res, error.message);
        return sendSuccess(res, data || []);
    } catch (err) {
        return sendError(res, 'Failed to fetch tasks');
    }
});

// Create task
router.post('/tasks', async (req: Request, res: Response) => {
    const { userId, text } = req.body;
    try {
        const { data, error } = await supabaseAdmin
            .from('tasks')
            .insert({ patient_id: userId, text, completed: false })
            .select()
            .single();

        if (error) return sendError(res, error.message);
        return sendCreated(res, data);
    } catch (err) {
        return sendError(res, 'Failed to create task');
    }
});

// Update task (toggle completed)
router.put('/tasks/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { completed } = req.body;
    try {
        const { data, error } = await supabaseAdmin
            .from('tasks')
            .update({ completed })
            .eq('id', id)
            .select()
            .single();

        if (error) return sendError(res, error.message);
        return sendSuccess(res, data);
    } catch (err) {
        return sendError(res, 'Failed to update task');
    }
});

// Delete task
router.delete('/tasks/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const { error } = await supabaseAdmin.from('tasks').delete().eq('id', id);
        if (error) return sendError(res, error.message);
        return sendSuccess(res, { message: 'Deleted' });
    } catch (err) {
        return sendError(res, 'Failed to delete task');
    }
});

// ========== EMERGENCY CONTACTS ==========

// Get emergency contacts for a user
router.get('/emergency/:userId', async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const { data, error } = await supabaseAdmin
            .from('emergency_contacts')
            .select('*')
            .eq('patient_id', userId)
            .order('created_at', { ascending: true });

        if (error) return sendError(res, error.message);
        return sendSuccess(res, data || []);
    } catch (err) {
        return sendError(res, 'Failed to fetch emergency contacts');
    }
});

// Create emergency contact
router.post('/emergency', async (req: Request, res: Response) => {
    const { userId, name, phone, relationship } = req.body;
    try {
        const { data, error } = await supabaseAdmin
            .from('emergency_contacts')
            .insert({ patient_id: userId, name, phone, relationship })
            .select()
            .single();

        if (error) return sendError(res, error.message);
        return sendCreated(res, data);
    } catch (err) {
        return sendError(res, 'Failed to create emergency contact');
    }
});

// Delete emergency contact
router.delete('/emergency/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const { error } = await supabaseAdmin.from('emergency_contacts').delete().eq('id', id);
        if (error) return sendError(res, error.message);
        return sendSuccess(res, { message: 'Deleted' });
    } catch (err) {
        return sendError(res, 'Failed to delete emergency contact');
    }
});

// ========== GALLERY ==========

// Get gallery for a user
router.get('/gallery/:userId', async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const { data, error } = await supabaseAdmin
            .from('gallery')
            .select('*')
            .eq('patient_id', userId)
            .order('created_at', { ascending: false });

        if (error) return sendError(res, error.message);
        return sendSuccess(res, data || []);
    } catch (err) {
        return sendError(res, 'Failed to fetch gallery');
    }
});

// Add photo to gallery
router.post('/gallery', async (req: Request, res: Response) => {
    const { userId, imageUrl, caption } = req.body;
    try {
        const { data, error } = await supabaseAdmin
            .from('gallery')
            .insert({ patient_id: userId, image_url: imageUrl, caption })
            .select()
            .single();

        if (error) return sendError(res, error.message);
        return sendCreated(res, data);
    } catch (err) {
        return sendError(res, 'Failed to add photo');
    }
});

// Delete photo
router.delete('/gallery/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const { error } = await supabaseAdmin.from('gallery').delete().eq('id', id);
        if (error) return sendError(res, error.message);
        return sendSuccess(res, { message: 'Deleted' });
    } catch (err) {
        return sendError(res, 'Failed to delete photo');
    }
});

// ========== LOCATION ==========

// Get latest location for a user
router.get('/location/:userId', async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const { data, error } = await supabaseAdmin
            .from('locations')
            .select('*')
            .eq('patient_id', userId)
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') return sendError(res, error.message);
        return sendSuccess(res, data || null);
    } catch (err) {
        return sendError(res, 'Failed to fetch location');
    }
});

// Update location (upsert - insert or update)
router.post('/location', async (req: Request, res: Response) => {
    const { userId, lat, lng } = req.body;

    if (!userId || lat === undefined || lng === undefined) {
        return sendError(res, 'userId, lat, and lng are required');
    }

    try {
        // Check if location exists
        const { data: existing } = await supabaseAdmin
            .from('locations')
            .select('id')
            .eq('patient_id', userId)
            .single();

        if (existing) {
            // Update existing
            const { data, error } = await supabaseAdmin
                .from('locations')
                .update({ lat, lng, updated_at: new Date().toISOString() })
                .eq('patient_id', userId)
                .select()
                .single();

            if (error) return sendError(res, error.message);
            return sendSuccess(res, data);
        } else {
            // Insert new
            const { data, error } = await supabaseAdmin
                .from('locations')
                .insert({ patient_id: userId, lat, lng })
                .select()
                .single();

            if (error) return sendError(res, error.message);
            return sendCreated(res, data);
        }
    } catch (err) {
        return sendError(res, 'Failed to update location');
    }
});

export default router;
