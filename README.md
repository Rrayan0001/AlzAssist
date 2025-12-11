# AlzAssist

AlzAssist is a comprehensive care portal for Alzheimer's patients and their caretakers. It provides tools for patient monitoring, medication tracking, daily journaling, memory games, and real-time location sharing.

## Features

### Patient Portal
- **Daily Journal** - Record thoughts with mood tracking
- **Medications** - Track medications and mark as taken
- **Daily Tasks** - Checklist with progress tracking
- **Emergency Contacts** - Quick-dial emergency numbers
- **Photo Gallery** - Upload and manage photos of familiar faces
- **Memory Games** - Card Match and Sequence games for cognitive exercise
- **Location Sharing** - Real-time location with caretaker visibility

### Caretaker Portal
- **Dashboard** - Overview of all patients with stats
- **Patient Details** - View patient's medications, tasks, journal, and location
- **Alerts Management** - Geofence exits, low battery, missed medication alerts
- **Live Map** - All patient locations on one map with geofence circles

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- TailwindCSS + Shadcn/UI
- React Router
- Zustand (state management)
- React Leaflet (maps)

### Backend
- Node.js + Express + TypeScript
- Supabase (PostgreSQL + Auth)
- Zod (validation)

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Frontend Setup
```bash
cd alzassist-frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd alzassist-backend
npm install
cp .env.example .env
# Add your Supabase credentials to .env
npm run dev
```

## Environment Variables

### Backend (.env)
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEOFENCE_RADIUS_METERS=500
PORT=3000
```

## License

MIT
