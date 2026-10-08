import { create } from 'zustand';
import api from '../../../lib/axios';

export const useAdminDataStore = create((set, get) => ({
  networkStats: {
    totalHubs: 0,
    activeFleet: 0,
    totalSubscribers: 0,
    grossRevenue: 0,
    maintenanceAlerts: 0,
    hubUtilization: "0%",
    avgUptime: "0%",
    churnRate: "0%",
    growthTier: "0%",
    yieldProjection: "₹0L",
    churnDelta: "0%",
    nodeLoad: "0%",
    riskScoring: "0/100",
    regionalYield: []
  },
  hubs: [],
  revenueData: [
    { name: 'Week 1', value: 0 },
    { name: 'Week 2', value: 0 },
    { name: 'Week 3', value: 0 },
    { name: 'Week 4', value: 0 },
  ],
  fleetDistribution: [],
  vehicles: [],
  plans: [],
  kycRecords: [],
  subscribers: [],
  roles: [],
  campaigns: [],
  notifications: [],
  riderReport: [],
  websitePlans: [],
  websiteInquiries: [],
  websiteAbout: null,
  websiteContactInfo: null,
  websitePressReleases: [],
  isLoading: false,

  fetchNotifications: async () => {
    try {
      const res = await api.get('/admin/notifications-feed');
      if (res.data.success) {
        set({ notifications: res.data.notifications });
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  },

  fetchDashboardStats: async (filters = {}) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams();
      if (filters.range) params.append('range', typeof filters.range === 'object' ? JSON.stringify(filters.range) : filters.range);

      const res = await api.get(`/admin/dashboard-stats?${params.toString()}`);
      if (res.data.success) {
        set({
          networkStats: { ...get().networkStats, ...res.data.stats },
          revenueData: res.data.stats.revenueData || get().revenueData
        });
      }
    } catch (err) {
      console.error("Failed to fetch admin stats:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchHubs: async (filters = {}) => {
    try {
      // Get browser geolocation if available, then fetch hubs sorted by proximity
      const getCoords = () =>
        new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => resolve({ lat: null, lng: null }),
            { timeout: 3000 }
          );
        });

      const { lat, lng } = await getCoords();
      const params = new URLSearchParams();
      if (lat) params.append('lat', lat);
      if (lng) params.append('lng', lng);
      if (filters.range) params.append('range', typeof filters.range === 'object' ? JSON.stringify(filters.range) : filters.range);

      const res = await api.get(`/admin/hubs?${params.toString()}`);
      if (res.data.success) {
        set({ 
          hubs: res.data.hubs,
          networkStats: {
            ...get().networkStats,
            ...res.data.stats
          }
        });
      }
    } catch (err) {
      console.error("Failed to fetch hubs:", err);
    }
  },

  addHub: async (hubData) => {
    try {
      const res = await api.post('/admin/hubs', hubData);
      if (res.data.success) {
        set(state => ({ hubs: [res.data.hub, ...state.hubs] }));
        return res.data;
      }
    } catch (err) {
      console.error("Failed to add hub:", err);
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },

  fetchHubById: async (id) => {
    try {
      const res = await api.get(`/admin/hubs/${id}`);
      if (res.data.success) {
        set(state => {
          const exists = state.hubs.some(h => (h.id || h._id)?.toString() === id);
          if (exists) {
            return { hubs: state.hubs.map(h => (h.id || h._id)?.toString() === id ? res.data.hub : h) };
          }
          return { hubs: [res.data.hub, ...state.hubs] };
        });
        return res.data.hub;
      }
    } catch (err) {
      console.error("Failed to fetch hub:", err);
      return null;
    }
  },

  updateHub: async (id, hubData) => {
    try {
      const res = await api.put(`/admin/hubs/${id}`, hubData);
      if (res.data.success) {
        set(state => ({
          hubs: state.hubs.map(h => (h.id || h._id)?.toString() === id ? { ...h, ...res.data.hub } : h)
        }));
        return res.data;
      }
    } catch (err) {
      console.error("Failed to update hub:", err);
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },

  removeHub: async (id) => {
    try {
      const res = await api.delete(`/admin/hubs/${id}`);
      if (res.data.success) {
        set(state => ({
          hubs: state.hubs.filter(h => (h.id || h._id)?.toString() !== id)
        }));
        return res.data;
      }
    } catch (err) {
      console.error("Failed to delete hub:", err);
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },

  fetchDistribution: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.range) params.append('range', typeof filters.range === 'object' ? JSON.stringify(filters.range) : filters.range);

      const res = await api.get(`/admin/distribution?${params.toString()}`);
      if (res.data.success) {
        set({ fleetDistribution: res.data.distribution });
      }
    } catch (err) {
      console.error("Failed to fetch distribution:", err);
    }
  },

  fetchPlans: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.range) params.append('range', typeof filters.range === 'object' ? JSON.stringify(filters.range) : filters.range);

      const res = await api.get(`/admin/plans?${params.toString()}`);
      if (res.data.success) {
        set({ plans: res.data.plans });
      }
    } catch (err) {
      console.error("Failed to fetch plans:", err);
    }
  },

  kycStats: { markets: 0, gstSync: '0%', integrity: '0%' },
  fetchKycRecords: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.range) params.append('range', typeof filters.range === 'object' ? JSON.stringify(filters.range) : filters.range);

      const res = await api.get(`/admin/kyc?${params.toString()}`);
      if (res.data.success) {
        set({
          kycRecords: res.data.records,
          kycStats: res.data.stats || get().kycStats
        });
      }
    } catch (err) {
      console.error("Failed to fetch KYC records:", err);
    }
  },

  updateKycStatus: async (id, statusData) => {
    try {
      const payload = typeof statusData === 'object' ? statusData : { status: statusData };
      const res = await api.patch(`/admin/kyc/${id}`, payload);
      if (res.data.success) {
        set(state => ({
          kycRecords: state.kycRecords.map(r => {
            const rId = r.id || r._id;
            return (rId && id && rId.toString() === id.toString())
              ? { 
                  ...r, 
                  status: payload.status,
                  details: res.data.kycDetails || { ...r.details, ...payload }
                }
              : r;
          })
        }));
        // Re-fetch to ensure all modules are in sync
        get().fetchKycRecords();
      }
    } catch (err) {
      console.error("Failed to update KYC status:", err);
    }
  },

  toggleBlockKycRecord: async (id) => {
    try {
      const res = await api.patch(`/admin/kyc/${id}/toggle-block`);
      if (res.data.success) {
        set(state => ({
          kycRecords: state.kycRecords.map(r => {
            const rId = r.id || r._id;
            return (rId && id && rId.toString() === id.toString())
              ? { ...r, isBlocked: res.data.isBlocked }
              : r;
          })
        }));
        // Re-fetch to ensure all modules are in sync
        get().fetchKycRecords();
        return { success: true, isBlocked: res.data.isBlocked };
      }
      return { success: false, message: "Toggle failed" };
    } catch (err) {
      console.error("Failed to toggle block status:", err);
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },

  updateKycReferences: async (id, data) => {
    try {
      const res = await api.patch(`/admin/kyc/${id}/references`, data);
      if (res.data.success) {
        set(state => ({
          kycRecords: state.kycRecords.map(r => {
            const rId = r.id || r._id;
            return (rId && id && rId.toString() === id.toString())
              ? { ...r, details: res.data.kycDetails || { ...r.details, ...data } }
              : r;
          })
        }));
        return res.data;
      }
    } catch (err) {
      console.error("Failed to update references:", err);
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },

  uploadKycCertificate: async (id, certificateBase64) => {
    try {
      const res = await api.post(`/admin/kyc/${id}/certificate`, { certificate: certificateBase64 });
      if (res.data.success) {
        set(state => ({
          kycRecords: state.kycRecords.map(r => r.id === id ? { ...r, details: { ...r.details, certificate: res.data.certificateUrl } } : r)
        }));
        return res.data;
      }
    } catch (err) {
      console.error("Failed to upload KYC certificate:", err);
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },


  fetchSubscribers: async () => {
    try {
      const res = await api.get('/admin/subscribers');
      if (res.data.success) {
        set({ subscribers: res.data.subscribers });
      }
    } catch (err) {
      console.error("Failed to fetch subscribers:", err);
    }
  },

  fetchAllVehicles: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.range) params.append('range', typeof filters.range === 'object' ? JSON.stringify(filters.range) : filters.range);
      
      const res = await api.get(`/fleet?${params.toString()}`); // no franchiseId param = all
      if (res.data.success) {
        set({ vehicles: res.data.vehicles });
      }
    } catch (err) {
      console.error("Failed to fetch all vehicles:", err);
    }
  },
  
  addVehicle: async (vehicleData) => {
    try {
      const res = await api.post('/admin/fleet/add', vehicleData);
      if (res.data.success) {
        set(state => ({ vehicles: [res.data.vehicle, ...state.vehicles] }));
        return res.data;
      }
    } catch (err) {
      console.error("Failed to add vehicle:", err);
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },

  bulkAddVehicles: async (vehicles) => {
    try {
      const res = await api.post('/admin/fleet/bulk-add', { vehicles });
      if (res.data.success) {
        set(state => ({ vehicles: [...res.data.vehicles, ...state.vehicles] }));
        return res.data;
      }
    } catch (err) {
      console.error("Failed to bulk add vehicles:", err);
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },
  
  updateVehicleAttachment: async (id, attachmentBase64) => {
    try {
      const res = await api.patch(`/admin/fleet/${id}/attachment`, { attachmentBase64 });
      if (res.data.success) {
        set(state => ({
          vehicles: state.vehicles.map(v => (v._id === id || v.id === id) ? { ...v, attachmentUrl: res.data.attachmentUrl } : v)
        }));
        return res.data;
      }
    } catch (err) {
      console.error("Failed to update vehicle attachment:", err);
      throw err;
    }
  },

  updateVehicleStatus: async (id, status) => {
    try {
      const res = await api.patch(`/admin/fleet/${id}/status`, { status });
      if (res.data.success) {
        set(state => ({
          vehicles: state.vehicles.map(v => (v._id === id || v.id === id) ? { ...v, status: res.data.vehicle.status } : v)
        }));
        return res.data;
      }
    } catch (err) {
      console.error("Failed to update vehicle status:", err);
      throw err;
    }
  },

  fetchHubVehicles: async (hubId) => {
    try {
      const res = await api.get(`/admin/hubs/${hubId}/vehicles`);
      if (res.data.success) {
        return res.data.vehicles;
      }
      return [];
    } catch (err) {
      console.error("Failed to fetch hub vehicles:", err);
      return [];
    }
  },

  addPlan: async (planData) => {
    try {
      const res = await api.post('/admin/plans', planData);
      if (res.data.success) {
        set(state => ({ plans: [res.data.plan, ...state.plans] }));
        return res.data;
      }
    } catch (err) {
      console.error("Failed to add plan:", err);
      return { success: false, message: err.message };
    }
  },

  updatePlan: async (id, planData) => {
    try {
      const res = await api.patch(`/admin/plans/${id}`, planData);
      if (res.data.success) {
        set(state => ({
          plans: state.plans.map(p => p._id === id ? res.data.plan : p)
        }));
        return res.data;
      }
    } catch (err) {
      console.error("Failed to update plan:", err);
      return { success: false, message: err.message };
    }
  },

  deletePlan: async (id) => {
    try {
      const res = await api.delete(`/admin/plans/${id}`);
      if (res.data.success) {
        set(state => ({
          plans: state.plans.filter(p => p._id !== id && p.id !== id)
        }));
        return res.data;
      }
    } catch (err) {
      console.error("Failed to delete plan:", err);
      return { success: false, message: err.message };
    }
  },

  geofences: [],
  allRiders: [],
  fetchGeofences: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.range) params.append('range', typeof filters.range === 'object' ? JSON.stringify(filters.range) : filters.range);
      params.append('_t', Date.now().toString()); // Bypass browser/proxy cache for live telemetry

      const res = await api.get(`/admin/geofencing?${params.toString()}`);
      if (res.data.success) {
        set({ 
          geofences: res.data.geofences,
          allRiders: res.data.allRiders || [],
          networkStats: {
            ...get().networkStats,
            geofenceStats: res.data.stats
          }
        });
      }
    } catch (err) {
      console.error("Failed to fetch geofences:", err);
    }
  },

  createGeofence: async (data) => {
    try {
      const res = await api.post('/admin/geofencing', data);
      if (res.data.success) {
        set(state => ({ geofences: [res.data.geofence, ...state.geofences] }));
        return res.data;
      }
    } catch (err) {
      console.error("Failed to create geofence:", err);
      return { success: false, message: err.message };
    }
  },

  removeGeofence: async (id) => {
    try {
      const res = await api.delete(`/admin/geofencing/${id}`);
      if (res.data.success) {
        set(state => ({
          geofences: state.geofences.filter(g => g._id !== id && g.id !== id)
        }));
        return res.data;
      }
    } catch (err) {
      console.error("Failed to remove geofence:", err);
      return { success: false, message: err.message };
    }
  },

  updateGeofence: async (id, data) => {
    try {
      const res = await api.patch(`/admin/geofencing/${id}`, data);
      if (res.data.success) {
        set(state => ({
          geofences: state.geofences.map(g => (g._id === id || g.id === id) ? res.data.geofence : g)
        }));
        return res.data;
      }
    } catch (err) {
      console.error("Failed to update geofence:", err);
      return { success: false, message: err.message };
    }
  },

  assignments: [],
  fetchAssignments: async () => {
    try {
      const res = await api.get('/fleet/assignments');
      if (res.data.success) {
        set({ assignments: res.data.assignments });
      }
    } catch (err) {
      console.error("Failed to fetch assignments:", err);
    }
  },

  assignVehicle: async (data) => {
    try {
      const res = await api.post('/fleet/assignments', data);
      if (res.data.success) {
        set(state => ({ 
          assignments: [res.data.assignment, ...state.assignments],
          kycRecords: state.kycRecords.map(r => r.phone === data.riderPhone ? { ...r, vehicleId: res.data.assignment.vehicle } : r)
        }));
        return res.data;
      }
    } catch (err) {
      console.error("Failed to create assignment:", err);
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },

  financeStats: { settled: '0L', liability: '0L', unitYield: '0k' },
  financeTransactions: [],
  fetchFinanceData: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.range) params.append('range', typeof filters.range === 'object' ? JSON.stringify(filters.range) : filters.range);

      const res = await api.get(`/admin/finance?${params.toString()}`);
      if (res.data.success) {
        set({
          financeTransactions: res.data.transactions,
          financeStats: res.data.stats || get().financeStats
        });
      }
    } catch (err) {
      console.error("Failed to fetch finance data:", err);
    }
  },

  inventory: [],
  billing: [],
  billingPagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  parts: [],
  inventoryStats: { totalItems: 0, restockCount: '0', stockValue: '₹0L', unpaidAmount: '₹0L' },
  lastInventoryFilters: { page: 1, limit: 10, range: 'Last 7 Days' },
  fetchInventoryData: async (filters) => {
    try {
      const currentFilters = filters ? { ...get().lastInventoryFilters, ...filters } : get().lastInventoryFilters;
      set({ lastInventoryFilters: currentFilters });

      const params = new URLSearchParams();
      if (currentFilters.range) params.append('range', typeof currentFilters.range === 'object' ? JSON.stringify(currentFilters.range) : currentFilters.range);
      if (currentFilters.page) params.append('page', currentFilters.page);
      if (currentFilters.limit) params.append('limit', currentFilters.limit);

      const res = await api.get(`/admin/inventory?${params.toString()}`);
      if (res.data.success) {
        set({
          inventory: res.data.inventory,
          billing: res.data.billing,
          billingPagination: res.data.billingPagination || get().billingPagination,
          inventoryStats: res.data.stats || get().inventoryStats
        });
      }
    } catch (err) {
      console.error("Failed to fetch inventory data:", err);
    }
  },

  exportFullInventoryData: async () => {
    try {
      const currentFilters = get().lastInventoryFilters;
      const params = new URLSearchParams();
      if (currentFilters.range) params.append('range', typeof currentFilters.range === 'object' ? JSON.stringify(currentFilters.range) : currentFilters.range);

      const res = await api.get(`/admin/inventory/export?${params.toString()}`);
      if (res.data.success) {
        return res.data;
      }
      return null;
    } catch (err) {
      console.error("Failed to export inventory data:", err);
      return null;
    }
  },
  
  addBill: async (billData) => {
    try {
      const res = await api.post('/admin/billing', billData);
      if (res.data.success) {
        get().fetchInventoryData();
        return res.data;
      }
    } catch (err) {
      console.error("Failed to add bill:", err);
      return { success: false, message: err.message };
    }
  },

  updateBill: async (id, billData) => {
    const previousBilling = get().billing;
    set({
      billing: previousBilling.map(bill =>
        bill._id === id ? { ...bill, ...billData } : bill
      )
    });
    
    try {
      const res = await api.put(`/admin/billing/${id}`, billData);
      if (res.data.success) {
        get().fetchInventoryData();
        return res.data;
      }
    } catch (err) {
      console.error("Failed to update bill:", err);
      set({ billing: previousBilling });
      return { success: false, message: err.message };
    }
  },

  removeBill: async (id) => {
    try {
      const res = await api.delete(`/admin/billing/${id}`);
      if (res.data.success) {
        get().fetchInventoryData();
        return res.data;
      }
    } catch (err) {
      console.error("Failed to remove bill:", err);
      return { success: false, message: err.message };
    }
  },

  fetchParts: async () => {
    try {
      const res = await api.get('/admin/parts');
      if (res.data.success) {
        set({ parts: res.data.parts });
      }
    } catch (err) {
      console.error("Failed to fetch parts:", err);
    }
  },

  addPart: async (partData) => {
    try {
      const res = await api.post('/admin/parts', partData);
      if (res.data.success) {
        get().fetchParts();
        return res.data;
      }
    } catch (err) {
      console.error("Failed to add part:", err);
      return { success: false, message: err.message };
    }
  },

  updatePart: async (id, partData) => {
    try {
      const res = await api.put(`/admin/parts/${id}`, partData);
      if (res.data.success) {
        get().fetchParts();
        return res.data;
      }
    } catch (err) {
      console.error("Failed to update part:", err);
      return { success: false, message: err.message };
    }
  },

  removePart: async (id) => {
    try {
      const res = await api.delete(`/admin/parts/${id}`);
      if (res.data.success) {
        // Optimistically or directly update state to be super snappy!
        set(state => ({ parts: state.parts.filter(p => p._id !== id) }));
        return res.data;
      }
    } catch (err) {
      console.error("Failed to remove part:", err);
      return { success: false, message: err.message };
    }
  },

  franchiseOps: [],
  franchiseOpsStats: { totalPartners: 0, activeNodes: 0, grossPayout: '₹0L', growth: '+0%' },
  fetchFranchiseOpsData: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.range) params.append('range', typeof filters.range === 'object' ? JSON.stringify(filters.range) : filters.range);

      const res = await api.get(`/admin/franchise-ops?${params.toString()}`);
      if (res.data.success) {
        set({
          franchiseOps: res.data.franchises,
          franchiseOpsStats: res.data.stats || get().franchiseOpsStats
        });
      }
    } catch (err) {
      console.error("Failed to fetch franchise ops data:", err);
    }
  },

  complianceRecords: [],
  complianceStats: { activeFines: '0', autoSettled: '₹0K', complianceRate: '0%', apiStatus: 'Offline' },
  fetchComplianceData: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.range) params.append('range', typeof filters.range === 'object' ? JSON.stringify(filters.range) : filters.range);

      const res = await api.get(`/admin/compliance?${params.toString()}`);
      if (res.data.success) {
        set({
          complianceRecords: res.data.challans,
          complianceStats: res.data.stats || get().complianceStats
        });
      }
    } catch (err) {
      console.error("Failed to fetch compliance data:", err);
    }
  },

  tickets: [],
  promos: [],
  engagementStats: { openTickets: 0, livePromos: '0', csatScore: '0%', slaReady: '0m' },
  fetchEngagementData: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.range) params.append('range', typeof filters.range === 'object' ? JSON.stringify(filters.range) : filters.range);

      const res = await api.get(`/admin/engagement?${params.toString()}`);
      if (res.data.success) {
        set({
          tickets: res.data.tickets,
          promos: res.data.promos || [],
          engagementStats: res.data.stats || get().engagementStats
        });
      }
    } catch (err) {
      console.error("Failed to fetch engagement data:", err);
    }
  },

  auditLogs: [],
  securityStats: { activeSessions: 0, authFailures: 0, integrity: 'N/A', globalNodes: '0' },
  fetchSecurityData: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.range) params.append('range', typeof filters.range === 'object' ? JSON.stringify(filters.range) : filters.range);

      const res = await api.get(`/admin/security?${params.toString()}`);
      if (res.data.success) {
        set({
          auditLogs: res.data.logs,
          securityStats: res.data.stats || get().securityStats
        });
      }
    } catch (err) {
      console.error("Failed to fetch security data:", err);
    }
  },

  removeSecurityLog: async (id) => {
    try {
      const res = await api.delete(`/admin/security/${id}`);
      if (res.data.success) {
        set(state => ({
          auditLogs: state.auditLogs.filter(log => (log.id || log._id) !== id),
          notifications: state.notifications.filter(n => (n.id || n._id) !== id)
        }));
        return res.data;
      }
    } catch (err) {
      console.error("Failed to delete security log:", err);
      return { success: false, message: err.message };
    }
  },

  subscribers: [],
  subscriberStats: { totalUsers: '0', dailyRiders: '0', kycVerified: '0%', flagged: '0' },
  fetchSubscriberData: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.range) params.append('range', typeof filters.range === 'object' ? JSON.stringify(filters.range) : filters.range);

      const res = await api.get(`/admin/subscribers?${params.toString()}`);
      if (res.data.success) {
        set({
          subscribers: res.data.subscribers,
          subscriberStats: res.data.stats || get().subscriberStats
        });
      }
    } catch (err) {
      console.error("Failed to fetch subscriber data:", err);
    }
  },

  staff: [],
  staffStats: { totalStaff: 0, onDuty: 0, performance: '0%', leaves: '0' },
  fetchStaff: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.range) params.append('range', typeof filters.range === 'object' ? JSON.stringify(filters.range) : filters.range);

      const res = await api.get(`/admin/staff?${params.toString()}`);
      if (res.data.success) {
        set({
          staff: res.data.staff,
          staffStats: res.data.stats || get().staffStats
        });
      }
    } catch (err) {
      console.error("Failed to fetch staff:", err);
    }
  },

  addStaff: async (data) => {
    try {
      const res = await api.post('/admin/staff', data);
      if (res.data.success) {
        await get().fetchStaff(); // Re-fetch to guarantee sync and sorting
        return res.data;
      }
    } catch (err) {
      console.error("Failed to add staff:", err);
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },

  updateStaff: async (id, data) => {
    try {
      const res = await api.put(`/admin/staff/${id}`, data);
      if (res.data.success) {
        await get().fetchStaff();
        return res.data;
      }
    } catch (err) {
      console.error("Failed to update staff:", err);
      return { success: false, message: err.message };
    }
  },

  removeStaff: async (id) => {
    try {
      const res = await api.delete(`/admin/staff/${id}`);
      if (res.data.success) {
        set(state => ({ staff: state.staff.filter(s => s._id !== id) }));
        return res.data;
      }
    } catch (err) {
      console.error("Failed to delete staff:", err);
      return { success: false, message: err.message };
    }
  },
  
  fetchWeeklyAttendance: async (staffId, weekKey) => {
    try {
      const res = await api.get(`/admin/staff/${staffId}/attendance?weekKey=${weekKey}`);
      if (res.data.success) {
        return res.data.attendance;
      }
    } catch (err) {
      console.error("Failed to fetch weekly attendance:", err);
      return null;
    }
  },

  updateWeeklyAttendance: async (staffId, weekKey, days) => {
    try {
      const res = await api.post(`/admin/staff/${staffId}/attendance`, { weekKey, days });
      if (res.data.success) {
        return res.data.attendance;
      }
    } catch (err) {
      console.error("Failed to update weekly attendance:", err);
      return null;
    }
  },

  fetchMonthlyAttendanceReport: async (month) => {
    try {
      const res = await api.get(`/admin/staff/attendance/report?month=${month}`);
      if (res.data.success) {
        return res.data;
      }
    } catch (err) {
      console.error("Failed to fetch monthly attendance report:", err);
      return null;
    }
  },

  leaves: [],
  fetchLeaves: async (month, year) => {
    try {
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      if (year) params.append('year', year);
      const res = await api.get(`/admin/staff-leaves?${params.toString()}`);
      if (res.data.success) {
        set({ leaves: res.data.leaves });
      }
    } catch (err) {
      console.error("Failed to fetch leaves:", err);
    }
  },

  addLeave: async (data) => {
    try {
      const res = await api.post('/admin/staff-leaves', data);
      if (res.data.success) {
        set(state => ({ leaves: [res.data.leave, ...state.leaves] }));
        return res.data;
      }
    } catch (err) {
      console.error("Failed to add leave:", err);
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },

  updateLeaveStatus: async (id, status) => {
    try {
      const res = await api.put(`/admin/staff-leaves/${id}`, { status });
      if (res.data.success) {
        set(state => ({
          leaves: state.leaves.map(l => l._id === id ? res.data.leave : l)
        }));
        return res.data;
      }
    } catch (err) {
      console.error("Failed to update leave:", err);
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },

  vehicleStats: {
    fleetHealth: '0%',
    bmsTags: '0',
    thermals: '00',
    gridEfficiency: '0%',
    perfSeries: [],
    assetRegistry: []
  },
  fetchVehicleStats: async () => {
    try {
      const res = await api.get('/admin/vehicle-stats');
      if (res.data.success) {
        set({ vehicleStats: res.data.stats });
      }
    } catch (err) {
      console.error("Failed to fetch vehicle stats:", err);
    }
  },

  riderBehaviour: {
    activeAlerts: '0',
    lowBalance: '0',
    docExpiry: '0',
    cleanup: '0%',
    behaviourAlerts: []
  },
  fetchRiderBehaviour: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.range) params.append('range', typeof filters.range === 'object' ? JSON.stringify(filters.range) : filters.range);

      const res = await api.get(`/admin/rider-behaviour?${params.toString()}`);
      if (res.data.success) {
        set({ riderBehaviour: res.data.stats });
      }
    } catch (err) {
      console.error("Failed to fetch rider behaviour:", err);
    }
  },

  fetchRoles: async () => {
    try {
      const res = await api.get('/admin/roles');
      if (res.data.success) {
        set({ roles: res.data.roles });
      }
    } catch (err) {
      console.error("Failed to fetch roles:", err);
    }
  },

  addRole: async (roleData) => {
    try {
      const res = await api.post('/admin/roles', roleData);
      if (res.data.success) {
        set(state => ({ roles: [res.data.role, ...state.roles] }));
        return res.data;
      }
    } catch (err) {
      console.error("Failed to add role:", err);
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },

  fetchCampaigns: async () => {
    try {
      const res = await api.get('/admin/campaigns');
      if (res.data.success) {
        set({ campaigns: res.data.campaigns });
      }
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
    }
  },

  addCampaign: async (campaignData) => {
    try {
      const res = await api.post('/admin/campaigns', campaignData);
      if (res.data.success) {
        set(state => ({ campaigns: [res.data.campaign, ...state.campaigns] }));
        return res.data;
      }
    } catch (err) {
      console.error("Failed to add campaign:", err);
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },

  // --- RIDER MANAGEMENT ---
  riders: [],
  fetchRiders: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.range) params.append('range', typeof filters.range === 'object' ? JSON.stringify(filters.range) : filters.range);

      const res = await api.get(`/admin/riders?${params.toString()}`);
      if (res.data.success) {
        set({ 
          riders: res.data.riders,
          riderBehaviour: res.data.stats || get().riderBehaviour
        });
      }
    } catch (err) {
      console.error("Failed to fetch riders:", err);
    }
  },
  addRider: async (riderData) => {
    try {
      const res = await api.post('/admin/riders', riderData);
      if (res.data.success) {
        set(state => ({ riders: [res.data.rider, ...state.riders] }));
        return res.data;
      }
    } catch (err) {
      console.error("Failed to add rider:", err);
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },
  updateRider: async (id, riderData) => {
    try {
      const res = await api.put(`/admin/riders/${id}`, riderData);
      if (res.data.success) {
        set(state => ({
          riders: state.riders.map(r => r._id === id ? res.data.rider : r)
        }));
        return res.data;
      }
    } catch (err) {
      console.error("Failed to update rider:", err);
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },
  removeRider: async (id) => {
    try {
      const res = await api.delete(`/admin/riders/${id}`);
      if (res.data.success) {
        set(state => ({
          riders: state.riders.filter(r => r._id !== id)
        }));
        return res.data;
      }
    } catch (err) {
      console.error("Failed to delete rider:", err);
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },

  fetchRiderReport: async (filters = {}) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams();
      if (filters.range) params.append('range', typeof filters.range === 'object' ? JSON.stringify(filters.range) : filters.range);

      const res = await api.get(`/admin/rider-report?${params.toString()}`);
      if (res.data.success) {
        set({ riderReport: res.data.report });
      }
    } catch (err) {
      console.error("Failed to fetch rider report:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  updateRole: async (id, roleData) => {
    const originalRoles = get().roles;
    const stringId = String(id);
    set(state => ({
      roles: state.roles.map(r => (String(r._id) === stringId || String(r.id) === stringId) ? { ...r, ...roleData } : r)
    }));
    try {
      const res = await api.put(`/admin/roles/${id}`, roleData);
      if (!res.data.success) set({ roles: originalRoles });
    } catch (err) {
      set({ roles: originalRoles });
      console.error("Update Role Failed:", err);
    }
  },

  togglePermission: async (roleId, module, action) => {
    const stringId = String(roleId);
    const originalRoles = get().roles;
    
    // 1. Find the role and toggle locally first
    let newPermissions = {};
    
    set(state => ({
      roles: state.roles.map(r => {
        if (String(r._id) === stringId || String(r.id) === stringId) {
          // Create a fresh clone of permissions
          const currentPerms = r.permissions || {};
          const modPerms = currentPerms[module] || { read: false, create: false, update: false, delete: false };
          
          // Toggle the specific action and spread everything to ensure React sees the change
          newPermissions = {
            ...currentPerms,
            [module]: {
              ...modPerms,
              [action]: !modPerms[action]
            }
          };
          
          return { ...r, permissions: newPermissions };
        }
        return r;
      })
    }));

    // 2. Sync with server
    try {
      const res = await api.put(`/admin/roles/${roleId}`, { permissions: newPermissions });
      if (!res.data.success) {
        set({ roles: originalRoles });
      }
    } catch (err) {
      console.error("Permission sync failed:", err);
      set({ roles: originalRoles });
    }
  },

  // --- Website Plans ---
  fetchWebsitePlans: async () => {
    try {
      const res = await api.get('/admin/web/plans');
      if (res.data.success) set({ websitePlans: res.data.plans });
    } catch (err) {
      console.error("Failed to fetch website plans:", err);
    }
  },
  addWebsitePlan: async (data) => {
    try {
      const res = await api.post('/admin/web/plans', data);
      if (res.data.success) {
        set(state => ({ websitePlans: [...state.websitePlans, res.data.plan].sort((a, b) => a.order - b.order) }));
        return res.data;
      }
    } catch (err) {
      console.error("Failed to add website plan:", err);
      return { success: false, message: err.message };
    }
  },
  updateWebsitePlan: async (id, data) => {
    try {
      const res = await api.patch(`/admin/web/plans/${id}`, data);
      if (res.data.success) {
        set(state => ({
          websitePlans: state.websitePlans.map(p => p._id === id ? res.data.plan : p).sort((a, b) => a.order - b.order)
        }));
        return res.data;
      }
    } catch (err) {
      console.error("Failed to update website plan:", err);
      return { success: false, message: err.message };
    }
  },
  deleteWebsitePlan: async (id) => {
    try {
      const res = await api.delete(`/admin/web/plans/${id}`);
      if (res.data.success) {
        set(state => ({ websitePlans: state.websitePlans.filter(p => p._id !== id) }));
        return res.data;
      }
    } catch (err) {
      console.error("Failed to delete website plan:", err);
      return { success: false, message: err.message };
    }
  },

  // --- Website Inquiries ---
  fetchWebsiteInquiries: async () => {
    try {
      const res = await api.get('/admin/web/contact');
      if (res.data.success) set({ websiteInquiries: res.data.inquiries });
    } catch (err) {
      console.error("Failed to fetch website inquiries:", err);
    }
  },
  updateInquiryStatus: async (id, status) => {
    try {
      const res = await api.patch(`/admin/web/contact/${id}`, { status });
      if (res.data.success) {
        set(state => ({
          websiteInquiries: state.websiteInquiries.map(i => i._id === id ? res.data.inquiry : i)
        }));
        return res.data;
      }
    } catch (err) {
      console.error("Failed to update inquiry status:", err);
      return { success: false, message: err.message };
    }
  },
  deleteInquiry: async (id) => {
    try {
      const res = await api.delete(`/admin/web/contact/${id}`);
      if (res.data.success) {
        set(state => ({ websiteInquiries: state.websiteInquiries.filter(i => i._id !== id) }));
        return res.data;
      }
    } catch (err) {
      console.error("Failed to delete inquiry:", err);
      return { success: false, message: err.message };
    }
  },

  // --- Website Contact Info ---
  fetchWebsiteContactInfo: async () => {
    try {
      const res = await api.get('/admin/web/contact-info');
      if (res.data.success) set({ websiteContactInfo: res.data.info });
    } catch (err) {
      console.error("Failed to fetch website contact info:", err);
    }
  },
  updateWebsiteContactInfo: async (data) => {
    try {
      const res = await api.put('/admin/web/contact-info', data);
      if (res.data.success) {
        set({ websiteContactInfo: res.data.info });
        return res.data;
      }
    } catch (err) {
      console.error("Failed to update website contact info:", err);
      return { success: false, message: err.message };
    }
  },

  // --- Website About ---
  fetchWebsiteAbout: async () => {
    try {
      const res = await api.get('/admin/web/about');
      if (res.data.success) set({ websiteAbout: res.data.about });
    } catch (err) {
      console.error("Failed to fetch website about:", err);
    }
  },
  updateWebsiteAbout: async (data) => {
    try {
      const res = await api.put('/admin/web/about', data);
      if (res.data.success) {
        set({ websiteAbout: res.data.about });
        return res.data;
      }
    } catch (err) {
      console.error("Failed to update website about:", err);
      return { success: false, message: err.message };
    }
  },

  // --- Website Press Releases ---
  fetchWebsitePressReleases: async () => {
    try {
      const res = await api.get('/admin/web/press');
      if (res.data.success) set({ websitePressReleases: res.data.releases });
    } catch (err) {
      console.error("Failed to fetch website press releases:", err);
    }
  },
  addPressRelease: async (data) => {
    try {
      const res = await api.post('/admin/web/press', data);
      if (res.data.success) {
        set(state => ({ websitePressReleases: [...state.websitePressReleases, res.data.release].sort((a, b) => a.order - b.order) }));
        return res.data;
      }
    } catch (err) {
      console.error("Failed to add press release:", err);
      return { success: false, message: err.message };
    }
  },
  updatePressRelease: async (id, data) => {
    try {
      const res = await api.patch(`/admin/web/press/${id}`, data);
      if (res.data.success) {
        set(state => ({
          websitePressReleases: state.websitePressReleases.map(r => r._id === id ? res.data.release : r).sort((a, b) => a.order - b.order)
        }));
        return res.data;
      }
    } catch (err) {
      console.error("Failed to update press release:", err);
      return { success: false, message: err.message };
    }
  },
  deletePressRelease: async (id) => {
    try {
      const res = await api.delete(`/admin/web/press/${id}`);
      if (res.data.success) {
        set(state => ({ websitePressReleases: state.websitePressReleases.filter(r => r._id !== id) }));
        return res.data;
      }
    } catch (err) {
      console.error("Failed to delete press release:", err);
      return { success: false, message: err.message };
    }
  },
}));
