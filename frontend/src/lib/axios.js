import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5100/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    // 1. Check current route pathname and URL to decide token priority
    const pathname = window.location.pathname || '';
    const url = config.url || '';
    
    // Priority 1: Admin Dashboard Context
    if (pathname.startsWith('/admin') || url.includes('/admin')) {
      const adminToken = localStorage.getItem('admin_token');
      if (adminToken && adminToken !== 'undefined' && adminToken !== 'null') {
        config.headers.Authorization = `Bearer ${adminToken}`;
        return config;
      }
    }

    // Priority 2: Rider Dashboard Context
    if (pathname.startsWith('/rider') || url.includes('/rider')) {
      const riderAuth = localStorage.getItem('rider-auth');
      if (riderAuth && riderAuth !== 'undefined') {
        try {
          const { state } = JSON.parse(riderAuth);
          if (state.token && state.token !== 'undefined' && state.token !== 'null') {
            config.headers.Authorization = `Bearer ${state.token}`;
            return config;
          }
        } catch (e) {}
      }
    }

    // Priority 3: Franchise Dashboard Context
    if (pathname.startsWith('/franchise') || url.includes('/franchise') || url.includes('/fleet') || url.includes('/staff') || url.includes('/maintenance')) {
      const franchiseAuth = localStorage.getItem('franchise-auth');
      if (franchiseAuth && franchiseAuth !== 'undefined') {
        try {
          const { state } = JSON.parse(franchiseAuth);
          if (state.token && state.token !== 'undefined' && state.token !== 'null') {
            config.headers.Authorization = `Bearer ${state.token}`;
            return config;
          }
        } catch (e) {}
      }
    }

    // Fallback: Try any available token if no specific context matches
    const adminToken = localStorage.getItem('admin_token');
    if (adminToken && adminToken !== 'undefined' && adminToken !== 'null') {
      config.headers.Authorization = `Bearer ${adminToken}`;
      return config;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
