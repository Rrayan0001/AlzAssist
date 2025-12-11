import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../db/supabase';
import { sendSuccess, sendError, sendCreated } from '../utils/response';

const router = Router();

// Link patient to caretaker (by email)
const linkSchema = z.object({
    caretakerId: z.string().uuid(),
    patientEmail: z.string().email()
});

router.post('/link', async (req: Request, res: Response) => {
    const parsed = linkSchema.safeParse(req.body);
    if (!parsed.success) {
        return sendError(res, parsed.error.errors[0].message);
    }

    const { caretakerId, patientEmail } = parsed.data;

    try {
        // Find patient by email
        const { data: patient, error: patientError } = await supabaseAdmin
            .from('users')
            .select('id, name, email')
            .eq('email', patientEmail.toLowerCase())
            .eq('role', 'PATIENT')
            .single();

        if (patientError || !patient) {
            return sendError(res, 'No patient found with this email. Make sure the patient has signed up first.');
        }

        // Check if link already exists
        const { data: existingLink } = await supabaseAdmin
            .from('patient_links')
            .select('id')
            .eq('caretaker_id', caretakerId)
            .eq('patient_id', patient.id)
            .single();

        if (existingLink) {
            return sendError(res, 'This patient is already linked to your account.');
        }

        // Create the link
        const { data: link, error: linkError } = await supabaseAdmin
            .from('patient_links')
            .insert({
                caretaker_id: caretakerId,
                patient_id: patient.id
            })
            .select()
            .single();

        if (linkError) {
            console.error('Link creation error:', linkError);
            return sendError(res, 'Failed to link patient. Please try again.');
        }

        return sendCreated(res, {
            link,
            patient: {
                id: patient.id,
                name: patient.name,
                email: patient.email
            }
        });
    } catch (err) {
        console.error('Link patient error:', err);
        return sendError(res, 'An unexpected error occurred.');
    }
});

// Get all patients linked to a caretaker
router.get('/patients/:caretakerId', async (req: Request, res: Response) => {
    const { caretakerId } = req.params;

    try {
        // Get all patient links for this caretaker
        const { data: links, error: linksError } = await supabaseAdmin
            .from('patient_links')
            .select('patient_id, created_at')
            .eq('caretaker_id', caretakerId);

        if (linksError) {
            console.error('Get links error:', linksError);
            return sendError(res, 'Failed to fetch linked patients.');
        }

        if (!links || links.length === 0) {
            return sendSuccess(res, { patients: [] });
        }

        // Get patient details
        const patientIds = links.map(l => l.patient_id);
        const { data: patients, error: patientsError } = await supabaseAdmin
            .from('users')
            .select('id, name, email')
            .in('id', patientIds);

        if (patientsError) {
            console.error('Get patients error:', patientsError);
            return sendError(res, 'Failed to fetch patient details.');
        }

        // Get latest location for each patient
        const patientsWithLocation = await Promise.all(
            (patients || []).map(async (patient) => {
                const { data: location } = await supabaseAdmin
                    .from('locations')
                    .select('lat, lng, updated_at')
                    .eq('patient_id', patient.id)
                    .order('updated_at', { ascending: false })
                    .limit(1)
                    .single();

                return {
                    ...patient,
                    location: location || null,
                    linkedAt: links.find(l => l.patient_id === patient.id)?.created_at
                };
            })
        );

        return sendSuccess(res, { patients: patientsWithLocation });
    } catch (err) {
        console.error('Get patients error:', err);
        return sendError(res, 'An unexpected error occurred.');
    }
});

// Unlink patient from caretaker
router.delete('/unlink/:caretakerId/:patientId', async (req: Request, res: Response) => {
    const { caretakerId, patientId } = req.params;

    try {
        const { error } = await supabaseAdmin
            .from('patient_links')
            .delete()
            .eq('caretaker_id', caretakerId)
            .eq('patient_id', patientId);

        if (error) {
            console.error('Unlink error:', error);
            return sendError(res, 'Failed to unlink patient.');
        }

        return sendSuccess(res, { message: 'Patient unlinked successfully' });
    } catch (err) {
        console.error('Unlink error:', err);
        return sendError(res, 'An unexpected error occurred.');
    }
});

export default router;
