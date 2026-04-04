/* Main App — React Router setup with auth-protected routes */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import AppLayout from '@/components/layout/AppLayout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import AnimalsPage from '@/pages/AnimalsPage';
import AnimalDetailPage from '@/pages/AnimalDetailPage';
import HealthRecordsPage from '@/pages/HealthRecordsPage';
import TreatmentsPage from '@/pages/TreatmentsPage';
import VaccinationsPage from '@/pages/VaccinationsPage';
import SupplyChainPage from '@/pages/SupplyChainPage';
import UsersPage from '@/pages/UsersPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/animals" element={<AnimalsPage />} />
            <Route path="/animals/:id" element={<AnimalDetailPage />} />
            <Route path="/health-records" element={<HealthRecordsPage />} />
            <Route path="/treatments" element={<TreatmentsPage />} />
            <Route path="/vaccinations" element={<VaccinationsPage />} />
            <Route path="/supply-chain" element={<SupplyChainPage />} />
            <Route path="/users" element={<UsersPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
