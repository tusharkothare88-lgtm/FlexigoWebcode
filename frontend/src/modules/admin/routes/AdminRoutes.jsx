import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { useAdminAuthStore } from '../store/adminAuthStore';

// Permission Guard Component
function PermGuard({ pageId, children }) {
  const { can } = useAdminAuthStore();
  if (!can(pageId, 'read')) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2.5" className="w-8 h-8">
            <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <p className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest">Access Denied</p>
          <p className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mt-1">You don't have permission to view this module.</p>
          <p className="text-[8px] font-bold text-rose-500 uppercase tracking-wider mt-0.5">Contact your administrator to request access.</p>
        </div>
      </div>
    );
  }
  return children;
}

// Intelligence Group
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
const DeepAnalyticsPage = lazy(() => import('../pages/DeepAnalyticsPage'));
const RiderBehaviourPage = lazy(() => import('../pages/RiderBehaviourPage'));

// Operations Group
const HubManagementPage = lazy(() => import('../pages/HubManagementPage'));
const HubDetailsPage = lazy(() => import('../pages/HubDetailsPage'));
const FleetOversightPage = lazy(() => import('../pages/FleetOversightPage'));

const GeoFencingPage = lazy(() => import('../pages/GeoFencingPage'));
const AddVehiclePage = lazy(() => import('../pages/AddVehiclePage'));

// People Group
const SubscriberRegistryPage = lazy(() => import('../pages/SubscriberRegistryPage'));
const RiderReportPage = lazy(() => import('../pages/RiderReportPage'));
const RiderHistoryPage = lazy(() => import('../pages/RiderHistoryPage'));
const KycOnboardingPage = lazy(() => import('../pages/KycOnboardingPage'));
const HrManagementPage = lazy(() => import('../pages/HrManagementPage'));
const FranchiseKycQueue = lazy(() => import('../pages/FranchiseKycQueue'));

const FinancialCenterPage = lazy(() => import('../pages/FinancialCenterPage'));
const PaymentGatewayPage = lazy(() => import('../pages/PaymentGatewayPage'));
const InventoryBillingPage = lazy(() => import('../pages/InventoryBillingPage'));
const FranchiseOpsPage = lazy(() => import('../pages/FranchiseOpsPage'));
const SubscriptionPlansPage = lazy(() => import('../pages/SubscriptionPlansPage'));
const RiderRefundPage = lazy(() => import('../pages/RiderRefundPage'));
const WithdrawalRequestsPage = lazy(() => import('../pages/WithdrawalRequestsPage'));
const AdhocPaymentPage = lazy(() => import('../pages/AdhocPaymentPage'));

// Legal & Support Group
const CompliancePage = lazy(() => import('../pages/CompliancePage'));
const CustomerEngagementPage = lazy(() => import('../pages/CustomerEngagementPage'));
const SecurityAuditsPage = lazy(() => import('../pages/SecurityAuditsPage'));
const AlertCenterPage = lazy(() => import('../pages/AlertCenterPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));

// Website Management Group
const WebsitePlansPage = lazy(() => import('../pages/WebsitePlansPage'));
const WebsiteContactUsPage = lazy(() => import('../pages/WebsiteContactUsPage'));
const WebsiteAboutUsPage = lazy(() => import('../pages/WebsiteAboutUsPage'));
const WebsitePressMediaPage = lazy(() => import('../pages/WebsitePressMediaPage'));

const AdminLogin = lazy(() => import('../pages/AdminLogin'));

export default function AdminRoutes() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center bg-[var(--bg-primary)]">
         <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.5em] animate-pulse">Initializing Root</span>
         </div>
      </div>
    }>
      <Routes>
        <Route path="login" element={<AdminLogin />} />
        
        <Route element={<AdminLayout />}>
          <Route path="dashboard" element={<PermGuard pageId="dashboard"><AdminDashboard /></PermGuard>} />
          
          {/* Operations Group */}
          <Route path="hubs" element={<PermGuard pageId="hubs"><HubManagementPage /></PermGuard>} />
          <Route path="hubs/:hubId" element={<PermGuard pageId="hubs"><HubDetailsPage /></PermGuard>} />
          <Route path="fleet" element={<PermGuard pageId="fleet"><FleetOversightPage /></PermGuard>} />
          <Route path="fleet/add" element={<PermGuard pageId="fleet"><AddVehiclePage /></PermGuard>} />
          <Route path="geofencing" element={<PermGuard pageId="geofencing"><GeoFencingPage /></PermGuard>} />
          
          {/* People Group */}
          <Route path="subscribers" element={<PermGuard pageId="subscribers"><SubscriberRegistryPage /></PermGuard>} />
          <Route path="rider-reports" element={<PermGuard pageId="rider-reports"><RiderReportPage /></PermGuard>} />
          <Route path="rider-history" element={<PermGuard pageId="rider-history"><RiderHistoryPage /></PermGuard>} />
          <Route path="kyc" element={<PermGuard pageId="kyc"><KycOnboardingPage /></PermGuard>} />
          <Route path="hr" element={<PermGuard pageId="hr"><HrManagementPage /></PermGuard>} />
          <Route path="franchise-kyc" element={<PermGuard pageId="franchise-kyc"><FranchiseKycQueue /></PermGuard>} />
          
          {/* Finance Group */}
          <Route path="financials" element={<PermGuard pageId="financials"><FinancialCenterPage /></PermGuard>} />
          <Route path="payments" element={<PermGuard pageId="payments"><PaymentGatewayPage /></PermGuard>} />
          <Route path="inventory" element={<PermGuard pageId="inventory"><InventoryBillingPage /></PermGuard>} />
          <Route path="franchise-ops" element={<PermGuard pageId="franchise-ops"><FranchiseOpsPage /></PermGuard>} />
          <Route path="subscription-plans" element={<PermGuard pageId="subscription-plans"><SubscriptionPlansPage /></PermGuard>} />
          <Route path="rider-refund" element={<PermGuard pageId="rider-refund"><RiderRefundPage /></PermGuard>} />
          <Route path="withdrawals" element={<PermGuard pageId="rider-refund"><WithdrawalRequestsPage /></PermGuard>} />
          <Route path="adhoc-payment" element={<PermGuard pageId="rider-refund"><AdhocPaymentPage /></PermGuard>} />
          
          {/* Intelligence Group */}
          <Route path="analytics" element={<PermGuard pageId="analytics"><DeepAnalyticsPage /></PermGuard>} />
          <Route path="rider-behaviour" element={<PermGuard pageId="rider-behaviour"><RiderBehaviourPage /></PermGuard>} />
          
          {/* Legal & Support Group */}
          <Route path="compliance" element={<PermGuard pageId="compliance"><CompliancePage /></PermGuard>} />
          <Route path="engagement" element={<PermGuard pageId="engagement"><CustomerEngagementPage /></PermGuard>} />
          <Route path="security" element={<PermGuard pageId="security"><SecurityAuditsPage /></PermGuard>} />
          <Route path="notifications" element={<PermGuard pageId="notifications"><AlertCenterPage /></PermGuard>} />
          <Route path="settings" element={<SettingsPage />} />
          
          {/* Website Management Group */}
          <Route path="website-plans" element={<PermGuard pageId="website-plans"><WebsitePlansPage /></PermGuard>} />
          <Route path="website-contact" element={<PermGuard pageId="website-contact"><WebsiteContactUsPage /></PermGuard>} />
          <Route path="website-about" element={<PermGuard pageId="website-about"><WebsiteAboutUsPage /></PermGuard>} />
          <Route path="website-press" element={<PermGuard pageId="website-press"><WebsitePressMediaPage /></PermGuard>} />
          
          <Route path="" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
