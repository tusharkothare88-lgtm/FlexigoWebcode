import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WebHome from './modules/website/web-pages/WebHome';

// Scroll To Top Utility
import ScrollToTop from './modules/website/web-components/ScrollToTop';

// Lazy loaded secondary routes/pages for optimal bundle size
const AboutUsPage = lazy(() => import('./modules/website/web-pages/AboutUsPage'));
const CareersPage = lazy(() => import('./modules/website/web-pages/CareersPage'));
const PressMediaPage = lazy(() => import('./modules/website/web-pages/PressMediaPage'));
const SustainabilityPage = lazy(() => import('./modules/website/web-pages/SustainabilityPage'));
const ContactPage = lazy(() => import('./modules/website/web-pages/ContactPage'));
const VehicleCatalogPage = lazy(() => import('./modules/website/web-pages/VehicleCatalogPage'));
const PricingPlansPage = lazy(() => import('./modules/website/web-pages/PricingPlansPage'));
const PrivacyPolicyPage = lazy(() => import('./modules/website/web-pages/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./modules/website/web-pages/TermsOfServicePage'));
const RiderAppPage = lazy(() => import('./modules/website/web-pages/RiderAppPage'));
const FranchisePanelPage = lazy(() => import('./modules/website/web-pages/FranchisePanelPage'));
const AdminDashboardPage = lazy(() => import('./modules/website/web-pages/AdminDashboardPage'));

// Lazy load large feature routes/dashboards
const RiderRoutes = lazy(() => import('./modules/rider/routes/RiderRoutes'));
const FranchiseRoutes = lazy(() => import('./modules/franchise/routes/FranchiseRoutes'));
const AdminRoutes = lazy(() => import('./modules/admin/routes/AdminRoutes'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-white">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-flexigo-teal border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-slate-500 font-heading font-bold text-sm tracking-widest uppercase animate-pulse">
        Loading <span className="text-flexigo-teal">Flexigo</span>...
      </p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<WebHome />} />
          
          {/* Info Pages */}
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/press" element={<PressMediaPage />} />
          <Route path="/sustainability" element={<SustainabilityPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/vehicle-catalog" element={<VehicleCatalogPage />} />
          <Route path="/pricing-plans" element={<PricingPlansPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          
          {/* Informational Portals */}
          <Route path="/rider-app" element={<RiderAppPage />} />
          <Route path="/franchise-panel" element={<FranchisePanelPage />} />
          <Route path="/admin-dashboard" element={<AdminDashboardPage />} />

          {/* Dashboards & Panels */}
          <Route path="/rider/*" element={<RiderRoutes />} />
          <Route path="/franchise/*" element={<FranchiseRoutes />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
