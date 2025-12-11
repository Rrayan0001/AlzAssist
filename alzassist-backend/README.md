# AlzAssist Care Portal - Backend

Node.js + TypeScript + Express backend for AlzAssist, using **Supabase** for PostgreSQL database and authentication.

## Quick Start

### 1. Install Dependencies
```bash
cd alzassist-backend
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in your Supabase credentials:
```bash
cp .env.example .env
```

Edit `.env`:
```
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
GEOFENCE_RADIUS_METERS=500
```

### 3. Setup Database
1. Go to your Supabase project → SQL Editor
2. Run the contents of `src/db/migrations/001_initial_schema.sql`

### 4. Run Development Server
```bash
npm run dev
```
Server will start at `http://localhost:3000`

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/health` | Health check | No |
| POST | `/api/auth/signup` | Create profile | No |
| GET | `/api/auth/me` | Get current user | Yes |
| GET | `/api/profiles/:id` | Get profile | Yes |
| PUT | `/api/profiles/:id` | Update profile | Owner |
| POST | `/api/connections` | Send request | Caretaker |
| PUT | `/api/connections/:id` | Accept/Reject | Patient |
| GET | `/api/connections/patients` | List patients | Caretaker |
| GET | `/api/connections/caretakers` | List caretakers | Patient |
| CRUD | `/api/journals` | Journal entries | Patient |
| CRUD | `/api/medications` | Medications | Patient |
| CRUD | `/api/tasks` | Daily tasks | Patient |
| CRUD | `/api/gallery` | Face gallery | Patient |
| POST | `/api/locations` | Submit location | Patient |
| GET | `/api/locations/:patientId` | Location history | Caretaker |
| GET | `/api/alerts` | Get alerts | Caretaker |
| PUT | `/api/alerts/:id/resolve` | Mark resolved | Caretaker |

## Geofencing

When a patient submits a location update:
1. Backend calculates distance from their registered home location
2. If distance > 500m (configurable), an alert is created for all connected caretakers
3. Caretakers can view and resolve alerts via `/api/alerts`

## Build for Production
```bash
npm run build
npm start
```
