import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';

import Login from '@/pages/Auth/Login';
import Signup from '@/pages/Auth/Signup';

import PatientDashboard from '@/pages/Patient/Dashboard';
import Journal from '@/pages/Patient/Journal';
import Medications from '@/pages/Patient/Medications';
import Tasks from '@/pages/Patient/Tasks';
import Emergency from '@/pages/Patient/Emergency';
import LocationPage from '@/pages/Patient/Location';
import Gallery from '@/pages/Patient/Gallery';
import Games from '@/pages/Patient/Games';
import CaretakerDashboard from '@/pages/Caretaker/Dashboard';
import PatientDetail from '@/pages/Caretaker/PatientDetail';
import AlertsPage from '@/pages/Caretaker/Alerts';
import LocationsPage from '@/pages/Caretaker/Locations';
import Profile from '@/pages/Profile';

const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode, allowedRole?: 'PATIENT' | 'CARETAKER' }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate to={user?.role === 'PATIENT' ? '/patient/dashboard' : '/caretaker/dashboard'} replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Patient Routes */}
        <Route path="/patient/*" element={
          <ProtectedRoute allowedRole="PATIENT">
            <Routes>
              <Route path="dashboard" element={<PatientDashboard />} />
              <Route path="journal" element={<Journal />} />
              <Route path="medications" element={<Medications />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="emergency" element={<Emergency />} />
              <Route path="location" element={<LocationPage />} />
              <Route path="gallery" element={<Gallery />} />
              <Route path="games" element={<Games />} />
            </Routes>
          </ProtectedRoute>
        } />

        <Route path="/caretaker/*" element={
          <ProtectedRoute allowedRole="CARETAKER">
            <Routes>
              <Route path="dashboard" element={<CaretakerDashboard />} />
              <Route path="patient/:id" element={<PatientDetail />} />
              <Route path="alerts" element={<AlertsPage />} />
              <Route path="locations" element={<LocationsPage />} />
            </Routes>
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
