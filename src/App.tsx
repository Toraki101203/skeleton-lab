import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Concept from './pages/Concept';
import Features from './pages/Features';
import FAQ from './pages/FAQ';
import DiagnosisWizard from './pages/user/DiagnosisWizard';
import ClinicDashboard from './pages/clinic/Dashboard';
import ProfileEditor from './pages/clinic/ProfileEditor';
import UserManagement from './pages/admin/UserManagement';
import Dashboard from './pages/admin/Dashboard';
import ClinicManagement from './pages/admin/ClinicManagement';
import AdminClinicDetail from './pages/admin/ClinicDetail';
import BookingOverview from './pages/admin/BookingOverview';
import AuditLogs from './pages/admin/AuditLogs';
import AdminLayout from './components/admin/AdminLayout';
import ClinicSearch from './pages/user/ClinicSearch';
import ClinicDetail from './pages/user/ClinicDetail';
import StaffManagement from './pages/clinic/StaffManagement';
import MenuManagement from './pages/clinic/MenuManagement';
import ShiftManagement from './pages/clinic/ShiftManagement';
import AttendanceManagement from './pages/clinic/AttendanceManagement';
import ReservationManagement from './pages/clinic/ReservationManagement';
import BookingWizard from './pages/booking/BookingWizard';
import DiagnosisResult from './pages/user/DiagnosisResult';

import Register from './pages/Register';

function App() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full border border-red-200">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
          <p className="text-gray-700 mb-4">
            Supabase environment variables are missing.
          </p>
          <div className="bg-gray-100 p-4 rounded text-sm font-mono text-gray-600 mb-4">
            <p>VITE_SUPABASE_URL: {supabaseUrl ? 'Set' : 'MISSING'}</p>
            <p>VITE_SUPABASE_ANON_KEY: {supabaseKey ? 'Set' : 'MISSING'}</p>
          </div>
          <p className="text-sm text-gray-500">
            Please check your Vercel project settings and ensure these environment variables are defined, then redeploy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/concept" element={<Concept />} />
          <Route path="/features" element={<Features />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/register" element={<Register />} />
          <Route path="/clinic/:id" element={<ClinicDetail />} />
          <Route path="/booking" element={<BookingWizard />} />

          {/* Public Diagnosis Routes */}
          <Route path="/diagnosis" element={<DiagnosisWizard />} />
          <Route path="/diagnosis/result" element={<DiagnosisResult />} />

          {/* User Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['user', 'super_admin']} />}>
            {/* Add user specific protected routes here if any */}
          </Route>

          <Route path="/search" element={<ClinicSearch />} />

          {/* Clinic Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['clinic_admin', 'super_admin']} />}>
            <Route path="/clinic/dashboard" element={<ClinicDashboard />} />
            <Route path="/clinic/profile" element={<ProfileEditor />} />
            <Route path="/clinic/staff" element={<StaffManagement />} />
            <Route path="/clinic/menu" element={<MenuManagement />} />
            <Route path="/clinic/shifts" element={<ShiftManagement />} />
            <Route path="/clinic/attendance" element={<AttendanceManagement />} />
            <Route path="/clinic/reservations" element={<ReservationManagement />} />
          </Route>

          {/* Super Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="bookings" element={<BookingOverview />} />
              <Route path="audit-logs" element={<AuditLogs />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="clinics" element={<ClinicManagement />} />
              <Route path="clinics/:id" element={<AdminClinicDetail />} />
              {/* Fallback or other routes */}
              <Route path="call-center" element={<UserManagement />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
