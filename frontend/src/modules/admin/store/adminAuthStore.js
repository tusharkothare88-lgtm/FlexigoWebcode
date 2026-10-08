import { create } from 'zustand';
import api from '../../../lib/axios';

// Map sidebar item labels to Security Matrix module names
export const MODULE_MAP = {
  'dashboard':          'Overview',
  'hubs':               'Franchise Management',
  'fleet':              'Fleet Addition',
  'geofencing':         'Geo Fencing',
  'rider-reports':      'Rider Reports',
  'rider-history':      'Rider Reports',
  'kyc':                'KYC & Onboard',
  'hr':                 'HR Management',
  'franchise-kyc':      'Franchise Onboard',
  'financials':         'Financial Center',
  'payments':           'Payment Gateway',
  'inventory':          'Inventory & Billing',
  'franchise-ops':      'Franchise & 3PL',
  'subscription-plans': 'Subscription Plans',
  'compliance':         'Compliance',
  'engagement':         'Engagement & CRM',
  'security':           'Security & Audit',
  'notifications':      'Notifications',
  'website-plans':      'Plans Page',
  'website-contact':    'Contact Us',
  'website-about':      'About Us',
  'website-press':      'Press & Media',
};

export const useAdminAuthStore = create((set, get) => ({
  user: (localStorage.getItem('admin_user') && localStorage.getItem('admin_user') !== 'undefined') ? JSON.parse(localStorage.getItem('admin_user')) : null,
  isAuthenticated: !!localStorage.getItem('admin_token') && localStorage.getItem('admin_token') !== 'undefined' && localStorage.getItem('admin_token') !== 'null',
  token: (localStorage.getItem('admin_token') === 'undefined' || localStorage.getItem('admin_token') === 'null') ? null : localStorage.getItem('admin_token'),
  // permissions: null means SuperAdmin (all access), object means role-based
  permissions: localStorage.getItem('admin_permissions') ? JSON.parse(localStorage.getItem('admin_permissions')) : null,

  // Check if current user can perform action on a module
  // pageId = sidebar item id (e.g. 'fleet'), action = 'read'|'create'|'update'|'delete'
  can: (pageId, action = 'read') => {
    const { user, permissions } = get();
    // Real admin (SuperAdmin) → full access always
    if (!user || user.accountType !== 'staff') return true;
    // These pages are SuperAdmin only — staff can NEVER access
    const superAdminOnly = ['security', 'settings'];
    if (superAdminOnly.includes(pageId)) return false;
    // Staff with no permissions loaded → no access
    if (permissions === null || permissions === undefined) return false;
    const moduleName = MODULE_MAP[pageId];
    if (!moduleName) return true;
    return !!(permissions[moduleName] && permissions[moduleName][action]);
  },

  login: async (email, password) => {
    try {
      const res = await api.post('/admin/login', { email, password });
      if (res.data.success) {
        const { token, admin } = res.data;

        localStorage.setItem('admin_user', JSON.stringify(admin));
        localStorage.setItem('admin_token', token);

        // If staff, fetch their role permissions from Security Matrix
        let permissions = null;
        if (admin.accountType === 'staff' && admin.role) {
          try {
            const rolesRes = await api.get('/admin/roles');
            if (rolesRes.data.success) {
              // Match by role name (case-insensitive)
              const matchedRole = rolesRes.data.roles.find(
                r => r.name.toLowerCase() === admin.role.toLowerCase()
              );
              if (matchedRole) {
                permissions = matchedRole.permissions || {};
              } else {
                // No matching role found → zero access (empty object)
                permissions = {};
              }
            }
          } catch (e) {
            console.error('Failed to fetch role permissions:', e);
            permissions = {};
          }
        }

        localStorage.setItem('admin_permissions', JSON.stringify(permissions));
        set({ user: admin, isAuthenticated: true, token, permissions });
        return true;
      }
      return false;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      console.error("Login failed:", msg);
      return { success: false, message: msg };
    }
  },

  logout: () => {
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_permissions');
    set({ user: null, isAuthenticated: false, token: null, permissions: null });
  }
}));
