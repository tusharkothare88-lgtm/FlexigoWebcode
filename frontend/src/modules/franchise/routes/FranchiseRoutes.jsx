import { Routes, Route, Navigate } from 'react-router-dom';
import { useFranchiseAuthStore } from '../store/franchiseAuthStore';
import FranchiseLayout from '../components/FranchiseLayout';
import FranchiseLogin from '../pages/FranchiseLogin';
import HubDashboard from '../pages/HubDashboard';
import FleetManagement from '../pages/FleetManagement';
import HandoverModule from '../pages/HandoverModule';
import RiderTracking from '../pages/RiderTracking';
import WalletFinancials from '../pages/WalletFinancials';
import StaffManagement from '../pages/StaffManagement';
import NotificationsPage from '../pages/NotificationsPage';
import VehicleDetail from '../pages/VehicleDetail';
import FranchiseOnboarding from '../pages/FranchiseOnboarding';
import MaintenanceScheduler from '../pages/MaintenanceScheduler';
import AddRiderPage from '../pages/AddRiderPage';
import AddVehiclePage from '../pages/AddVehiclePage';

const checkFranchiseAuth = () => {
  try {
    const stored = localStorage.getItem('franchise-auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.state?.isAuthenticated && parsed.state?.token;
    }
  } catch (e) {
    console.error('Error parsing franchise auth:', e);
  }
  return false;
};

export default function FranchiseRoutes() {
  const { isAuthenticated } = useFranchiseAuthStore();
  const isFranchiseAuth = isAuthenticated || checkFranchiseAuth();

  return (
    <Routes>
      <Route path="/" element={isFranchiseAuth ? <Navigate to="/franchise/dashboard" replace /> : <FranchiseLogin />} />
      <Route path="/onboarding" element={<FranchiseOnboarding />} />
      
      {/* Protected Layout Routes */}
      <Route element={isFranchiseAuth ? <FranchiseLayout /> : <Navigate to="/franchise" replace />}>
        <Route path="/dashboard" element={<HubDashboard />} />
        <Route path="/fleet" element={<FleetManagement />} />
        <Route path="/fleet/add" element={<AddVehiclePage />} />
        <Route path="/maintenance" element={<MaintenanceScheduler />} />
        <Route path="/fleet/:vehicleId" element={<VehicleDetail />} />
        <Route path="/handover" element={<HandoverModule />} />
        <Route path="/tracking" element={<RiderTracking />} />
        <Route path="/subscribers/add" element={<AddRiderPage />} />
        <Route path="/wallet" element={<WalletFinancials />} />
        <Route path="/staff" element={<StaffManagement />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>
    </Routes>
  );
}
