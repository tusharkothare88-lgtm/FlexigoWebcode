import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import SplashScreen from '../pages/SplashScreen';
import AuthPhone from '../pages/AuthPhone';
import AuthOTP from '../pages/AuthOTP';

import OnboardingKYC from '../pages/OnboardingKYC';
import HomeDashboard from '../pages/HomeDashboard';
import BatteriesHubs from '../pages/BatteriesHubs';
import PaymentsScreen from '../pages/PaymentsScreen';
import LiveGarage from '../pages/LiveGarage';
import SubscriptionPlans from '../pages/SubscriptionPlans';
import RideFlow from '../pages/RideFlow';
import ProfileScreen from '../pages/ProfileScreen';
import SupportScreen from '../pages/SupportScreen';
import HubDetails from '../pages/HubDetails';
import WalletScreen from '../pages/WalletScreen';
import PickupHistoryScreen from '../pages/PickupHistoryScreen';
import RiderNotificationsScreen from '../pages/RiderNotificationsScreen';
import { RiderLayout } from '../components/RiderLayout';
import { useAuthStore } from '../store/authStore';

const checkRiderAuth = () => {
  try {
    const stored = localStorage.getItem('rider-auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.state?.isAuthenticated && parsed.state?.token;
    }
  } catch (e) {
    console.error('Error parsing rider auth:', e);
  }
  return false;
};

export default function RiderRoutes() {
  const { isAuthenticated, phone } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isRiderAuth = isAuthenticated || checkRiderAuth();

  // Basic route protection and auto-redirect for authenticated users
  useEffect(() => {
    if (!isRiderAuth) {
      if (pathname.includes('/rider') && !pathname.includes('/rider/auth') && pathname !== '/rider' && pathname !== '/rider/') {
        navigate('/rider/auth/phone');
      }
    } else {
      if (pathname === '/rider' || pathname === '/rider/' || pathname === '/rider/auth/phone') {
        navigate('/rider/home');
      }
    }
  }, [isRiderAuth, pathname, navigate]);

  return (
    <Routes>
      <Route path="/" element={<AuthPhone />} />
      <Route path="/auth/phone" element={<AuthPhone />} />
      <Route path="/auth/otp" element={<AuthOTP />} />
      
      {/* Protected Layout Routes */}
      <Route element={<RiderLayout />}>

        <Route path="/onboarding" element={<OnboardingKYC />} />
        <Route path="/home" element={<HomeDashboard />} />
        <Route path="/batteries-hubs" element={<BatteriesHubs />} />
        <Route path="/payments" element={<PaymentsScreen />} />
        <Route path="/garage" element={<LiveGarage />} />
        <Route path="/wallet" element={<WalletScreen />} />
        <Route path="/plans" element={<SubscriptionPlans />} />
        <Route path="/subscription" element={<SubscriptionPlans />} />
        <Route path="/hub/:id" element={<HubDetails />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/support" element={<SupportScreen />} />
        <Route path="/history" element={<PickupHistoryScreen />} />
        <Route path="/notifications" element={<RiderNotificationsScreen />} />
        
        {/* Catch-all for unmatched protected routes */}
        <Route path="*" element={<HomeDashboard />} />
      </Route>
      
      {/* Global Catch-all */}
      <Route path="*" element={<AuthPhone />} />
    </Routes>
  );
}
