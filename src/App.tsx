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
import CallCenter from './pages/admin/CallCenter';
import ClinicSearch from './pages/user/ClinicSearch';
import ClinicDetail from './pages/user/ClinicDetail';
import StaffPage from './pages/clinic/StaffPage';
import SolutionBuilder from './pages/clinic/SolutionBuilder';
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

          {/* User Routes */}
          <Route element={<ProtectedRoute allowedRoles={['user', 'super_admin']} />}>
            <Route path="/diagnosis" element={<DiagnosisWizard />} />
            <Route path="/diagnosis/result" element={<DiagnosisResult />} />
            <Route path="/search" element={<ClinicSearch />} />
            <Route path="/clinic/:id" element={<ClinicDetail />} />
          </Route>

          {/* Clinic Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['clinic_admin', 'super_admin']} />}>
            <Route path="/clinic/dashboard" element={<ClinicDashboard />} />
            <Route path="/clinic/profile" element={<ProfileEditor />} />
            <Route path="/clinic/staff" element={<StaffPage />} />
            <Route path="/clinic/solutions" element={<SolutionBuilder />} />
          </Route>

          {/* Super Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
            <Route path="/admin/call-center" element={<CallCenter />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
