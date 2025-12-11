import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import connectionRoutes from './routes/connection.routes';
import journalRoutes from './routes/journal.routes';
import medicationRoutes from './routes/medication.routes';
import taskRoutes from './routes/task.routes';
import galleryRoutes from './routes/gallery.routes';
import locationRoutes from './routes/location.routes';
import alertRoutes from './routes/alert.routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/journals', journalRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/alerts', alertRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`🚀 AlzAssist Backend running on http://localhost:${PORT}`);
    console.log(`📋 API Endpoints:`);
    console.log(`   - GET  /health`);
    console.log(`   - POST /api/auth/signup`);
    console.log(`   - GET  /api/auth/me`);
    console.log(`   - GET  /api/profiles/:id`);
    console.log(`   - PUT  /api/profiles/:id`);
    console.log(`   - POST /api/connections`);
    console.log(`   - PUT  /api/connections/:id`);
    console.log(`   - GET  /api/connections/patients`);
    console.log(`   - GET  /api/connections/caretakers`);
    console.log(`   - CRUD /api/journals`);
    console.log(`   - CRUD /api/medications`);
    console.log(`   - CRUD /api/tasks`);
    console.log(`   - CRUD /api/gallery`);
    console.log(`   - POST /api/locations (with geofencing)`);
    console.log(`   - GET  /api/alerts`);
});
