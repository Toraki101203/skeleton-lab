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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/concept" element={<Concept />} />
          <Route path="/features" element={<Features />} />
          <Route path="/faq" element={<FAQ />} />

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
