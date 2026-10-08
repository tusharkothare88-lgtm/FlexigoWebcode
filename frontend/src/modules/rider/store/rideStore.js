import { create } from 'zustand';
import api from '../../../lib/axios';
import { getDatabase, ref, set } from "firebase/database";
import app from '../../../lib/firebase';

export const useRideStore = create((set, get) => ({
  rideStatus: 'idle', // idle | unlocking | active | ending | completed
  vehicle: {
    id: 'FLX-2024-001',
    model: 'Flexigo S1 Pro',
    battery: 87,
    range: 94,
    location: 'Detecting location...',
    plateNumber: 'KA 05 EV 1234',
  },
  currentAddress: 'Detecting location...',
  currentCoords: null,
  lastLocationUpdatedAt: 0,
  activeRide: null,
  rideHistory: [],
  hubs: [],
  hubLoading: true,

  setCurrentAddress: (address) => set({ currentAddress: address }),
  applyLiveLocation: ({ latitude, longitude, address, updatedAt = Date.now() }) =>
    set((state) => ({
      currentAddress: address || state.currentAddress,
      currentCoords:
        latitude !== undefined && longitude !== undefined
          ? { latitude, longitude }
          : state.currentCoords,
      lastLocationUpdatedAt: updatedAt,
      vehicle: {
        ...state.vehicle,
        location: address || state.vehicle.location,
      },
    })),
  syncProfileLocation: (location) => {
    if (!location?.address) return;

    const state = get();
    const profileUpdatedAt = location.updatedAt ? new Date(location.updatedAt).getTime() : 0;

    // Prefer the fresher live GPS location already captured on device.
    if (state.lastLocationUpdatedAt && state.lastLocationUpdatedAt >= profileUpdatedAt) {
      return;
    }

    set((currentState) => ({
      currentAddress: location.address,
      currentCoords:
        location.lat !== undefined && location.lng !== undefined
          ? { latitude: location.lat, longitude: location.lng }
          : currentState.currentCoords,
      lastLocationUpdatedAt: profileUpdatedAt || currentState.lastLocationUpdatedAt,
      vehicle: {
        ...currentState.vehicle,
        location: location.address,
      },
    }));
  },

  startRide: () => {
    const startTime = Date.now();
    set({
      rideStatus: 'active',
      activeRide: {
        startTime,
        distance: 0,
        startBattery: get().vehicle.battery,
      },
    });
  },

  updateRideStats: (distance, battery) =>
    set((state) => ({
      vehicle: { ...state.vehicle, battery, range: Math.round(battery * 1.08) },
      activeRide: state.activeRide ? { ...state.activeRide, distance } : null,
    })),

  endRide: async () => {
    const state = get();
    try {
      // 1. Notify Backend / Admin about handover intent
      await get().requestHandover();

      // 2. Update local state
      const completedRide = {
        ...state.activeRide,
        endTime: Date.now(),
        finalBattery: state.vehicle.battery,
        cost: Math.round(state.activeRide?.distance * 1.5) || 0,
      };
      set({
        rideStatus: 'completed',
        activeRide: completedRide,
        rideHistory: [completedRide, ...state.rideHistory],
      });
    } catch (err) {
      console.error("End ride notification failed:", err);
    }
  },

  resetRide: () => set({ rideStatus: 'idle', activeRide: null }),

  setUnlocking: () => set({ rideStatus: 'unlocking' }),
  isDiagnosticsOpen: false,
  setDiagnosticsOpen: (isOpen) => set({ isDiagnosticsOpen: isOpen }),
  
  fetchHubs: async (lat, lng) => {
    try {
      set({ hubLoading: true });
      const url = lat && lng ? `/rider/hubs?lat=${lat}&lng=${lng}` : '/rider/hubs';
      const res = await api.get(url);
      if (res.data.success) {
        set({ hubs: res.data.hubs, hubLoading: false });
      }
    } catch (err) {
      console.error("Failed to fetch hubs:", err);
      set({ hubLoading: false });
    }
  },

  fetchMyVehicle: async (phone) => {
    try {
      const res = await api.get(`/rider/my-vehicle/${phone}`);
      if (res.data.success) {
        set({ vehicle: res.data.vehicle });
      }
    } catch (err) {
      // If no active subscription, reset vehicle to default (no access)
      if (err.response?.data?.code === 'NO_ACTIVE_SUBSCRIPTION') {
        set({
          vehicle: {
            id: null,
            model: null,
            battery: 0,
            range: 0,
            location: 'Detecting location...',
            plateNumber: null,
          }
        });
      }
      console.error("Failed to fetch vehicle:", err);
    }
  },
  
  updateLocation: async (lat, lng, address) => {
    try {
      const riderAuth = localStorage.getItem('rider-auth');
      if (!riderAuth) {
        console.error('❌ No rider auth token found in localStorage');
        return;
      }
      
      console.log('📡 Sending location to backend:', { lat, lng, address });
      
      const requestTimestamp = Date.now();

      // ALWAYS update UI with fresh GPS location first.
      get().applyLiveLocation({
        latitude: lat,
        longitude: lng,
        address,
        updatedAt: requestTimestamp,
      });

      // Frontend directly pushes to Firebase is removed as per user request.
      // Backend will handle the Firebase RTDB push.
      
      const res = await api.patch('/rider/location', { latitude: lat, longitude: lng, address });
      console.log('✅ Location update response:', res.data);
      
      // Log detailed response data
      if (res.data.data) {
        console.log('📍 Location Data:', res.data.data.location);
        console.log('🚴 Total Distance:', res.data.data.totalDistance, 'km');
        console.log('⚡ Current Speed:', res.data.data.currentSpeed, 'km/h');
        
        // Update store with backend response data
        const latestState = get();
        const responseTimestamp = res.data.data.location.updatedAt
          ? new Date(res.data.data.location.updatedAt).getTime()
          : requestTimestamp;
        const latestCoords = latestState.currentCoords;
        const isSameCoordinateSample =
          latestCoords &&
          Math.abs(latestCoords.latitude - lat) < 0.0001 &&
          Math.abs(latestCoords.longitude - lng) < 0.0001;

        // Ignore delayed/stale backend echoes if a newer live GPS sample already exists.
        if (isSameCoordinateSample || latestState.lastLocationUpdatedAt <= responseTimestamp) {
          latestState.applyLiveLocation({
            latitude: lat,
            longitude: lng,
            address: res.data.data.location.address || address,
            updatedAt: responseTimestamp,
          });
        }
      }
      
      return res.data;
    } catch (err) {
      console.error("❌ Failed to update rider location:", err.message);
      console.error("Full error:", err.response?.data || err);
    }
  },
  
  requestHandover: async () => {
    try {
      const res = await api.post('/rider/handover/request');
      return res.data;
    } catch (err) {
      console.error("Handover request failed:", err);
      return { success: false, message: err.response?.data?.message || 'Handover request failed' };
    }
  }
}));
