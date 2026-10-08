import React, { useState, useEffect, useCallback } from 'react';
import {
   Map as MapIcon,
   Plus,
   MapPin,
   Bell,
   History,
   MoreVertical,
   Search,
   Filter,
   CheckCircle2,
   AlertTriangle,
   X,
   Target,
   Shield,
   Layers,
   ArrowRight,
   Activity,
   User,
   Navigation,
   Info,
   Edit
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleMap, useJsApiLoader, CircleF, MarkerF } from '@react-google-maps/api';
import AdminStatCard from '../components/AdminStatCard';
import OpsFilter from '../components/OpsFilter';
import { useAdminDataStore } from '../store/adminDataStore';
import logo from '../../../assets/logo.png';
import { getDatabase, ref, onValue } from "firebase/database";
import app from '../../../lib/firebase';

const containerStyle = {
   width: '100%',
   height: '100%'
};

const defaultCenter = null; // No hardcoded location — will be set from real GPS

const getDistance = (lat1, lng1, lat2, lng2) => {
   const R = 6371; // km
   const dLat = (lat2 - lat1) * Math.PI / 180;
   const dLng = (lng2 - lng1) * Math.PI / 180;
   const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
   return R * c;
};

const playBreachChime = () => {
   try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const playBeep = (delay, freq, duration) => {
         const osc = audioCtx.createOscillator();
         const gain = audioCtx.createGain();

         osc.type = 'sine';
         osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);

         gain.gain.setValueAtTime(0.15, audioCtx.currentTime + delay);
         gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + delay + duration);

         osc.connect(gain);
         gain.connect(audioCtx.destination);

         osc.start(audioCtx.currentTime + delay);
         osc.stop(audioCtx.currentTime + delay + duration);
      };

      playBeep(0, 880, 0.15); // High beep
      playBeep(0.2, 880, 0.15); // Follow-up beep
   } catch (e) {
      console.log('Audio chime error:', e);
   }
};

// Custom Map Styles (Dark/Emerald)
const mapStyles = [
   { "elementType": "geometry", "stylers": [{ "color": "#0f172a" }] },
   { "elementType": "labels.text.fill", "stylers": [{ "color": "#cbd5e1" }] },
   { "elementType": "labels.text.stroke", "stylers": [{ "color": "#0f172a" }] },
   { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#fbbf24" }] },
   { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#1e293b" }] },
   { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#38bdf8" }] },
   { "featureType": "poi", "elementType": "labels.icon", "stylers": [{ "visibility": "on" }, { "color": "#38bdf8" }] },
   { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#064e3b" }] },
   { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#34d399" }] },
   { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#1e293b" }] },
   { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#0f172a" }] },
   { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#94a3b8" }] },
   { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#334155" }] },
   { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#1e293b" }] },
   { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#f1f5f9" }] },
   { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#334155" }] },
   { "featureType": "road.local", "elementType": "geometry", "stylers": [{ "color": "#475569" }] }, // High vis for local roads/alleys (gali)
   { "featureType": "road.local", "elementType": "geometry.stroke", "stylers": [{ "color": "#1e293b" }] },
   { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#cbd5e1" }] },
   { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#1e293b" }] },
   { "featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [{ "color": "#fbbf24" }] },
   { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0f172a" }] },
   { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#38bdf8" }] }
];

export default function GeoFencingPage() {
   const {
      geofences,
      allRiders,
      subscribers,
      networkStats,
      fetchGeofences,
      fetchSubscriberData,
      createGeofence,
      removeGeofence
   } = useAdminDataStore();

   const { isLoaded } = useJsApiLoader({
      id: 'google-map-script',
      googleMapsApiKey: "AIzaSyBRHvhhxVDQyYkOryyo2IA19GuDFqsYD30"
   });

   const [activeFilters, setActiveFilters] = React.useState({ range: 'Last 7 Days' });
   const [selectedZone, setSelectedZone] = useState(null);
   const [lastSelectedZoneId, setLastSelectedZoneId] = useState(null);
   const [notifications, setNotifications] = useState([]);
   const [breachedRiders, setBreachedRiders] = useState({});
   const [toast, setToast] = useState(null);
   const [map, setMap] = useState(null);

   const onLoad = useCallback(function callback(map) {
      setMap(map);
   }, []);

   const onUnmount = useCallback(function callback(map) {
      setMap(null);
   }, []);

   const [userLocation, setUserLocation] = useState(null);
   const [mapCenter, setMapCenter] = useState(null);
   const [firebaseLocations, setFirebaseLocations] = useState({});

   useEffect(() => {
      const db = getDatabase(app);
      const locationsRef = ref(db, 'locations');
      const unsubscribe = onValue(locationsRef, (snapshot) => {
         if (snapshot.exists()) {
            setFirebaseLocations(snapshot.val());
         }
      });
      return () => unsubscribe();
   }, []);

   const getRiderLiveLocation = useCallback((rider, gf) => {
      const riderId = rider?._id || rider?.id;
      if (riderId && firebaseLocations[riderId]) {
         const fbLoc = firebaseLocations[riderId];
         return {
            lat: Number(fbLoc.lat),
            lng: Number(fbLoc.lng)
         };
      }

      if (rider?.lastLocation) {
         const rLat = rider.lastLocation.lat !== undefined && rider.lastLocation.lat !== null ? rider.lastLocation.lat : rider.lastLocation.latitude;
         const rLng = rider.lastLocation.lng !== undefined && rider.lastLocation.lng !== null ? rider.lastLocation.lng : rider.lastLocation.longitude;
         if (rLat && rLng && Number(rLat) !== 0 && Number(rLng) !== 0) {
            return {
               lat: Number(rLat),
               lng: Number(rLng)
            };
         }
      }

      let baseLat = gf?.center?.lat || 18.5815;
      let baseLng = gf?.center?.lng || 73.7671;

      if (Math.abs(baseLat - 28.6139) < 0.001 && Math.abs(baseLng - 77.2090) < 0.001) {
         baseLat = 18.5815;
         baseLng = 73.7671;
      }

      return {
         lat: baseLat,
         lng: baseLng
      };
   }, [firebaseLocations]);

   useEffect(() => {
      fetchGeofences(activeFilters);
      fetchSubscriberData();

      const pollInterval = setInterval(() => {
         fetchGeofences(activeFilters);
      }, 5000);

      if (navigator.geolocation) {
         navigator.geolocation.getCurrentPosition(
            (pos) => {
               const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
               setUserLocation(loc);
               setMapCenter(loc);
               if (!selectedZone && map) map.panTo(loc);
            },
            (err) => {
               console.warn('GeoFencing: GPS error, using first geofence center as fallback:', err.message);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }  // maximumAge:0 = always fresh, no cache
         );
      }

      if (Notification.permission === "default") {
         Notification.requestPermission();
      }

      return () => clearInterval(pollInterval);
   }, [map, activeFilters]);

   // Keep the selectedZone state in sync with real-time updates from background polling
   useEffect(() => {
      if (selectedZone) {
         const selectedRiderIdStr = (selectedZone.riderId?._id || selectedZone.riderId?.id || selectedZone.riderId || '').toString();

         // If it's a real geofence in our list, find and update it
         const updatedZone = geofences.find(g => (g._id || g.id || '').toString() === (selectedZone._id || selectedZone.id || '').toString());
         if (updatedZone) {
            if (JSON.stringify(updatedZone) !== JSON.stringify(selectedZone)) {
               setSelectedZone(updatedZone);
            }
         } else if (selectedZone._id?.startsWith('temp-')) {
            // If it's a synthetic geofence, update the rider info from the fresh allRiders list
            const freshRider = allRiders.find(r => (r._id || r.id || '').toString() === selectedRiderIdStr);
            if (freshRider) {
               const freshSynthetic = {
                  ...selectedZone,
                  center: freshRider.lastLocation || selectedZone.center,
                  riderId: freshRider
               };
               if (JSON.stringify(freshSynthetic) !== JSON.stringify(selectedZone)) {
                  setSelectedZone(freshSynthetic);
               }
            }
         }
      }
   }, [geofences, allRiders]);

   useEffect(() => {
      if (geofences.length === 0) return;

      geofences.forEach(gf => {
         if (!gf.center || !gf.riderId || !gf.radius) return;

         const riderId = gf.riderId?._id || gf.riderId?.id || gf.riderId;
         const matchedRider = allRiders.find(r => (r._id || r.id || '').toString() === (riderId || '').toString());
         if (!matchedRider) return;

         // Only check breach for riders with REAL GPS data — skip simulated/fake positions
         const hasRealGPS = matchedRider?.lastLocation &&
            ((matchedRider.lastLocation.lat !== undefined && matchedRider.lastLocation.lat !== null && Number(matchedRider.lastLocation.lat) !== 0) ||
               (matchedRider.lastLocation.latitude !== undefined && matchedRider.lastLocation.latitude !== null && Number(matchedRider.lastLocation.latitude) !== 0));
         if (!hasRealGPS) return;

         const loc = getRiderLiveLocation(matchedRider, gf);
         const dist = getDistance(loc.lat, loc.lng, gf.center.lat, gf.center.lng);
         const radius = parseFloat(gf.radius);

         if (dist > radius) {
            const riderKey = matchedRider._id || matchedRider.id;
            if (!breachedRiders[riderKey]) {
               setBreachedRiders(prev => ({ ...prev, [riderKey]: true }));
               addNotification(matchedRider.name || 'Rider');
            }
         } else {
            const riderKey = matchedRider._id || matchedRider.id;
            if (breachedRiders[riderKey]) {
               setBreachedRiders(prev => ({ ...prev, [riderKey]: false }));
            }
         }
      });
   }, [firebaseLocations, geofences, allRiders, getRiderLiveLocation, breachedRiders]);

   useEffect(() => {
      if (selectedZone && map) {
         const currentId = (selectedZone._id || selectedZone.id || '').toString();
         const riderId = selectedZone.riderId?._id || selectedZone.riderId?.id || selectedZone.riderId;
         const matchedRider = allRiders.find(r => (r._id || r.id || '').toString() === (riderId || '').toString());
         const targetLoc = getRiderLiveLocation(matchedRider || selectedZone.riderId, selectedZone) || selectedZone.center || userLocation;

         const isNewDelhi = Math.abs(targetLoc.lat - 28.6139) < 0.1 && Math.abs(targetLoc.lng - 77.2090) < 0.1;
         const finalLoc = (isNewDelhi && userLocation) ? userLocation : targetLoc;

         if (currentId !== lastSelectedZoneId) {
            setMapCenter(finalLoc);
            map.panTo(finalLoc);
            map.setZoom(16);
            setLastSelectedZoneId(currentId);
         } else {
            // Auto-pan on live location update
            setMapCenter(finalLoc);
            map.panTo(finalLoc);
         }
      }
   }, [selectedZone, map, lastSelectedZoneId, allRiders, getRiderLiveLocation, userLocation, firebaseLocations]);

   const addNotification = (riderName) => {
      const newNotif = {
         id: Date.now(),
         message: `Rider ${riderName} is outside the assigned radius!`,
         time: new Date().toLocaleTimeString(),
         type: 'breach'
      };
      setNotifications(prev => [newNotif, ...prev].slice(0, 5));

      setToast({
         id: Date.now(),
         message: `${riderName} has breached the assigned radius!`,
         riderName
      });

      playBreachChime();

      setTimeout(() => {
         setToast(null);
      }, 4000);

      if (Notification.permission === "granted") {
         new Notification("Geo-Fencing Alert", {
            body: `${riderName} has breached the zone!`,
            icon: logo
         });
      }
   };

   const requestNotificationPermission = () => {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
         Notification.requestPermission();
      }
   };

   const handleFilterChange = (newFilters) => {
      setActiveFilters(newFilters);
      fetchGeofences(newFilters);
      console.log('Geo Fencing Sync:', newFilters);
   };

   const [activeTab, setActiveTab] = useState('registry');
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [modalMode, setModalMode] = useState('create');
   const [editingGeofenceId, setEditingGeofenceId] = useState(null);
   const [newZoneName, setNewZoneName] = useState('');
   const [newZoneType, setNewZoneType] = useState('inclusion');
   const [selectedRider, setSelectedRider] = useState('');
   const [draftCenter, setDraftCenter] = useState(null);
   const [draftRadius, setDraftRadius] = useState(1000);

   const handleMapClick = (e) => {
      if (isModalOpen) {
         setDraftCenter({ lat: e.latLng.lat(), lng: e.latLng.lng() });
      }
   };

   const openCreateModal = (riderObj = null) => {
      setModalMode('create');
      setNewZoneName('');
      setNewZoneType('inclusion');

      let baseCenter = userLocation;
      if (riderObj) {
         setSelectedRider(riderObj._id || riderObj.id || '');
         const riderLoc = riderObj.lastLocation;
         if (riderLoc) {
            const rLat = riderLoc.lat !== undefined && riderLoc.lat !== null ? riderLoc.lat : riderLoc.latitude;
            const rLng = riderLoc.lng !== undefined && riderLoc.lng !== null ? riderLoc.lng : riderLoc.longitude;
            if (rLat && rLng && Number(rLat) !== 0 && Number(rLng) !== 0) {
               baseCenter = { lat: Number(rLat), lng: Number(rLng) };
            }
         }
      } else {
         setSelectedRider('');
      }

      // Use real GPS if available, else use first geofence center as a fallback
      const fallbackCenter = geofences.find(gf => gf.center)?.center || null;
      setDraftCenter(baseCenter || fallbackCenter);
      setDraftRadius(1000);
      setIsModalOpen(true);
   };

   const openEditModal = (gf) => {
      setModalMode('edit');
      setEditingGeofenceId(gf._id || gf.id);
      setNewZoneName(gf.name);
      setNewZoneType(gf.type);

      const rId = gf.riderId?._id || gf.riderId?.id || gf.riderId || '';
      setSelectedRider(rId);

      // Auto-sync draft center with the rider's exact current location if available, otherwise fallback to saved center
      const matchedRider = allRiders.find(r => (r._id || r.id || '').toString() === rId.toString());
      const riderLoc = matchedRider?.lastLocation;
      const hasRealGPS = riderLoc &&
         ((riderLoc.lat !== undefined && riderLoc.lat !== null && Number(riderLoc.lat) !== 0) ||
            (riderLoc.latitude !== undefined && riderLoc.latitude !== null && Number(riderLoc.latitude) !== 0));

      if (hasRealGPS) {
         const rLat = riderLoc.lat !== undefined && riderLoc.lat !== null ? riderLoc.lat : riderLoc.latitude;
         const rLng = riderLoc.lng !== undefined && riderLoc.lng !== null ? riderLoc.lng : riderLoc.longitude;
         setDraftCenter({ lat: Number(rLat), lng: Number(rLng) });
      } else {
         setDraftCenter(gf.center);
      }

      const rMatch = gf.radius?.match(/([\d.]+)/);
      const rVal = rMatch ? parseFloat(rMatch[1]) : 1;
      setDraftRadius(rVal * 1000);

      setIsModalOpen(true);
   };

   const handleSaveZone = async (e) => {
      e.preventDefault();
      if (!newZoneName || !selectedRider || !draftCenter) return;

      const radiusStr = `${(draftRadius / 1000).toFixed(1)}km`;
      const payload = {
         name: newZoneName,
         type: newZoneType,
         radius: radiusStr,
         riderId: selectedRider,
         center: draftCenter
      };

      if (modalMode === 'create') {
         await createGeofence(payload);
      } else {
         await useAdminDataStore.getState().updateGeofence(editingGeofenceId, payload);
      }

      setNewZoneName('');
      setSelectedRider('');
      setIsModalOpen(false);
      fetchGeofences();
   };

   const deleteZone = (id) => {
      removeGeofence(id);
   };

   return (
      <div className="space-y-4 md:space-y-6 pb-12">
         <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between">
            <div className="space-y-0.5">
               <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-emerald-600 rounded-full" />
                  <h1 className="text-xl font-black tracking-tighter text-[var(--text-primary)] uppercase italic">
                     Geo <span className="text-emerald-500">Fencing</span>
                  </h1>
               </div>
               <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] ml-3">
                  Perimeter Security & Grid Protocols
               </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
               <div className="flex bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-1 rounded-xl">
                  {['registry', 'alerts'].map((tab) => (
                     <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab
                           ? 'bg-emerald-600 text-white shadow-md'
                           : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                           }`}
                     >
                        {tab}
                     </button>
                  ))}
               </div>
               <OpsFilter onFilterChange={handleFilterChange} />
               <button
                  onClick={openCreateModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md active:scale-95"
               >
                  <Plus size={12} strokeWidth={3} /> Create Zone
               </button>
            </div>
         </div>

         <AnimatePresence>
            {notifications.length > 0 && (
               <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 space-y-3"
               >
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2 text-rose-500">
                        <Bell size={14} className="animate-bounce" />
                        <span className="text-[10px] font-black uppercase tracking-widest italic">Live Breach Protocol</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <button onClick={() => setActiveTab('alerts')} className="text-[8px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-all">View All Logs</button>
                        <button onClick={() => setNotifications([])} className="text-[8px] font-black uppercase tracking-widest text-rose-500/50 hover:text-rose-500 transition-all">Clear All</button>
                     </div>
                  </div>
                  <div className="space-y-2">
                     {notifications.map(n => (
                        <motion.div
                           key={n.id}
                           initial={{ opacity: 0, x: -10 }}
                           animate={{ opacity: 1, x: 0 }}
                           className="flex items-center justify-between bg-[var(--bg-secondary)] border border-rose-500/20 p-3 rounded-xl shadow-sm"
                        >
                           <div className="flex items-center gap-3">
                              <img src={logo} className="w-6 h-6 object-contain grayscale-0" alt="Logo" />
                              <div className="space-y-0.5">
                                 <p className="text-[9px] font-black text-rose-500 uppercase italic tracking-tighter">{n.message}</p>
                                 <p className="text-[7px] font-bold text-[var(--text-tertiary)] uppercase">{n.time} • Radius Breach</p>
                              </div>
                           </div>
                           <AlertTriangle size={14} className="text-rose-500" />
                        </motion.div>
                     ))}
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AdminStatCard
               title="Total Fleet"
               value={networkStats.geofenceStats?.totalRiders || allRiders.length}
               icon={User}
               color="blue"
               subtitle="Active Riders"
            />
            <AdminStatCard
               title="Active Zones"
               value={networkStats.geofenceStats?.activeZones || geofences.filter(gf => gf.riderId).length}
               icon={MapIcon}
               color="emerald"
               subtitle={geofences.length > 0 ? [...new Set(geofences.filter(gf => gf.riderId && gf.name).map(gf => gf.name.toUpperCase()))].join(', ') : "Monitored Nodes"}
            />
            <AdminStatCard
               title="Breaches"
               value={notifications.length > 0 ? (notifications.length < 10 ? `0${notifications.length}` : notifications.length) : (networkStats.geofenceStats?.breaches || "00")}
               icon={AlertTriangle}
               color="rose"
               subtitle="Live Alerts"
            />
         </div>

         <AnimatePresence mode="wait">
            {activeTab === 'registry' ? (
               <motion.div
                  key="registry"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6"
               >
                  <div className="lg:col-span-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm flex flex-col max-h-[400px] md:max-h-[580px]">
                     <div className="px-6 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-tertiary)]/10">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-inner">
                              <Layers size={16} />
                           </div>
                           <h3 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-wider leading-none italic">Zone Protocol Registry</h3>
                        </div>
                     </div>
                     <div className="overflow-auto no-scrollbar flex-1">
                        <table className="w-full">
                           <thead>
                              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/5">
                                 {['Rider Identity', 'Type', 'Radius', 'Status', 'Alerts', 'Actions'].map((header) => (
                                    <th key={header} className="text-left py-3 px-2 text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap">{header}</th>
                                 ))}
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-[var(--border-subtle)]">
                              <AnimatePresence mode='popLayout'>
                                 {allRiders.map((rider) => {
                                    const gf = geofences.find(g => (g.riderId?._id || g.riderId || '').toString() === (rider._id || rider.id || '').toString());
                                    const syntheticGfId = `temp-${rider._id || rider.id}`;
                                    const isSelected = selectedZone && (selectedZone._id || selectedZone.id || '').toString() === (gf?._id || gf?.id || syntheticGfId).toString();

                                    return (
                                       <motion.tr
                                          layout
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          key={rider._id || rider.id}
                                          onClick={() => {
                                             requestNotificationPermission();
                                             const targetZone = gf || {
                                                _id: syntheticGfId,
                                                name: 'No Zone',
                                                type: 'inclusion',
                                                radius: '--',
                                                status: 'inactive',
                                                alerts: 0,
                                                center: rider.lastLocation || { lat: 18.5815, lng: 73.7671 },
                                                riderId: rider
                                             };
                                             setSelectedZone(targetZone);

                                             const riderLoc = getRiderLiveLocation(rider, gf);
                                             if (riderLoc && map) {
                                                setMapCenter(riderLoc);
                                                map.panTo(riderLoc);
                                                map.setZoom(16);
                                                setLastSelectedZoneId(syntheticGfId);
                                             }
                                          }}
                                          className={`group/row hover:bg-emerald-500/5 transition-all cursor-pointer ${isSelected ? 'bg-emerald-500/5' : ''}`}
                                       >
                                          <td className="py-2 px-2 whitespace-nowrap">
                                             <div className="flex flex-col">
                                                {gf && (
                                                   <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter mb-0.5 italic">
                                                      {gf.name}
                                                   </span>
                                                )}
                                                <span className="font-medium text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors">{rider.name || 'Unnamed Rider'}</span>
                                                <span className="font-medium text-[var(--text-tertiary)] mt-1">{rider.phone}</span>
                                             </div>
                                          </td>
                                          <td className="py-2 px-2">
                                             <span className={`font-medium px-2 py-0.5 rounded border ${gf ? (gf.type === 'exclusion' ? 'bg-rose-500/10 text-rose-500 border-rose-500/10' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10') : 'bg-slate-500/10 text-slate-500 border-slate-500/10'
                                                }`}>
                                                {gf ? gf.type : 'No Zone'}
                                             </span>
                                          </td>
                                          <td className="py-2 px-2 font-medium text-[var(--text-primary)]">{gf ? gf.radius : '--'}</td>
                                          <td className="py-2 px-2">
                                             <div className={`inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded font-medium border ${gf?.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' : 'bg-slate-500/10 text-slate-500 border-slate-500/10'
                                                }`}>
                                                <div className={`w-1 h-1 rounded-full ${gf?.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                                                {gf ? gf.status : 'inactive'}
                                             </div>
                                          </td>
                                          <td className="py-2 px-2">
                                             <span className={`font-medium ${gf?.alerts > 0 ? 'text-rose-500' : 'text-[var(--text-tertiary)]'}`}>{gf ? gf.alerts : 0} FLUX</span>
                                          </td>
                                          <td className="py-2 px-2">
                                             <div className="flex items-center gap-2">
                                                {gf ? (
                                                   <>
                                                      <button
                                                         onClick={(e) => { e.stopPropagation(); openEditModal(gf); }}
                                                         className="p-1.5 text-[var(--text-tertiary)] hover:text-emerald-500 hover:bg-emerald-500/5 rounded-lg transition-all"
                                                      >
                                                         <Edit size={14} />
                                                      </button>
                                                      <button
                                                         onClick={(e) => { e.stopPropagation(); deleteZone(gf._id || gf.id); }}
                                                         className="p-1.5 text-[var(--text-tertiary)] hover:text-rose-500 hover:bg-rose-600/5 rounded-lg transition-all"
                                                         title="Delete Zone"
                                                      >
                                                         <X size={14} />
                                                      </button>
                                                   </>
                                                ) : (
                                                   <>
                                                      <button
                                                         onClick={(e) => { e.stopPropagation(); openCreateModal(rider); }}
                                                         className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"
                                                         title="Create Zone"
                                                      >
                                                         <Plus size={14} strokeWidth={3} />
                                                      </button>
                                                   </>
                                                )}
                                             </div>
                                          </td>
                                       </motion.tr>
                                    );
                                 })}
                              </AnimatePresence>
                           </tbody>
                        </table>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-4 space-y-4 shadow-sm flex flex-col min-h-[300px] md:min-h-[500px] h-full">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <Target size={14} className="text-emerald-500" />
                              <h4 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest italic">Live Grid Monitor</h4>
                           </div>
                           {selectedZone && (
                              <div className="flex items-center gap-1">
                                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                 <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest">Tracking: {selectedZone.riderId?.name || 'NODE'}</span>
                              </div>
                           )}
                        </div>

                        <div className="flex-1 min-h-[250px] md:min-h-[350px] bg-[var(--bg-tertiary)] rounded-xl relative overflow-hidden group shadow-inner border border-[var(--border-subtle)]">
                           {isLoaded && (isModalOpen ? draftCenter : mapCenter) ? (
                              <GoogleMap
                                 mapContainerStyle={containerStyle}
                                 center={isModalOpen ? draftCenter : mapCenter}
                                 zoom={isModalOpen || selectedZone ? 15 : 12}
                                 onLoad={onLoad}
                                 onUnmount={onUnmount}
                                 onClick={handleMapClick}
                                 options={{
                                    styles: mapStyles,
                                    disableDefaultUI: true,
                                    zoomControl: true,
                                    mapTypeControl: true,
                                    streetViewControl: false,
                                    fullscreenControl: true,
                                    clickableIcons: false
                                 }}
                              >
                                 {isModalOpen && draftCenter && (
                                    <>
                                       <CircleF
                                          center={draftCenter}
                                          radius={draftRadius}
                                          options={{
                                             strokeColor: newZoneType === 'exclusion' ? '#f43f5e' : '#10b981',
                                             strokeOpacity: 0.8,
                                             strokeWeight: 2,
                                             fillColor: newZoneType === 'exclusion' ? '#f43f5e' : '#10b981',
                                             fillOpacity: 0.0,
                                             editable: true,
                                             draggable: true
                                          }}
                                       />
                                       <MarkerF
                                          position={draftCenter}
                                          label={{
                                             text: "DRAG PIN TO SET CENTER",
                                             color: 'white',
                                             fontSize: '8px',
                                             fontWeight: '900',
                                             className: 'uppercase tracking-tighter mt-12'
                                          }}
                                          draggable={true}
                                          onDragEnd={(e) => setDraftCenter({ lat: e.latLng.lat(), lng: e.latLng.lng() })}
                                       />
                                    </>
                                 )}

                                 {!isModalOpen && selectedZone && (() => {
                                    const riderId = selectedZone.riderId?._id || selectedZone.riderId?.id || selectedZone.riderId;
                                    const matchedRider = allRiders.find(r => (r._id || r.id || '').toString() === (riderId || '').toString());
                                    const targetLoc = getRiderLiveLocation(matchedRider || selectedZone.riderId, selectedZone) || selectedZone.center || userLocation;
                                    const isNewDelhi = Math.abs(targetLoc.lat - 28.6139) < 0.1 && Math.abs(targetLoc.lng - 77.2090) < 0.1;
                                    const finalLoc = (isNewDelhi && userLocation) ? userLocation : targetLoc;

                                    const rMatch = selectedZone.radius?.match(/([\d.]+)/);
                                    const rMeters = selectedZone.radius === '--' ? 0 : (rMatch ? parseFloat(rMatch[1]) * 1000 : 1000);

                                    let circleCenter = selectedZone.center || finalLoc;
                                    if (circleCenter && Math.abs(circleCenter.lat - 28.6139) < 0.001 && Math.abs(circleCenter.lng - 77.2090) < 0.001) {
                                       const isSagar = matchedRider?.name?.toLowerCase().includes('sagar') || matchedRider?.phone === '9993911855' || matchedRider?.phone === '4315256688';
                                       const isIndoreZone = selectedZone?.name?.toUpperCase().includes('INDORE') || selectedZone?.name?.toUpperCase().includes('ANKIT') || selectedZone?.name?.toUpperCase().includes('TEST ZONE');
                                       const isPuneZone = selectedZone?.name?.toUpperCase().includes('PUNE') || matchedRider?.name?.toLowerCase().includes('tushar') || matchedRider?.name?.toLowerCase().includes('ashish') || matchedRider?.phone === '9922968093' || matchedRider?.phone === '9049396061';

                                       if (isSagar || isIndoreZone) {
                                          circleCenter = { lat: 22.7166, lng: 75.8699 };
                                       } else if (isPuneZone) {
                                          circleCenter = { lat: 18.5815, lng: 73.7671 };
                                       } else {
                                          circleCenter = { lat: 18.5815, lng: 73.7671 };
                                       }
                                    }

                                    return (
                                       <>
                                          {rMeters > 0 && (
                                             <CircleF
                                                center={circleCenter}
                                                radius={rMeters}
                                                options={{
                                                   strokeColor: selectedZone.type === 'exclusion' ? '#f43f5e' : '#10b981',
                                                   strokeOpacity: 0.8,
                                                   strokeWeight: 2,
                                                   fillColor: selectedZone.type === 'exclusion' ? '#f43f5e' : '#10b981',
                                                   fillOpacity: 0.0,
                                                }}
                                             />
                                          )}
                                          <MarkerF
                                             position={finalLoc}
                                             onClick={() => {
                                                window.open(`https://www.google.com/maps?q=${finalLoc.lat},${finalLoc.lng}&z=18`, '_blank');
                                             }}
                                             icon={{
                                                url: 'https://maps.google.com/mapfiles/ms/icons/motorcycling.png'
                                             }}
                                             label={{
                                                text: matchedRider?.name || selectedZone.riderId?.name || 'Rider',
                                                color: '#10b981',
                                                fontSize: '10px',
                                                fontWeight: '900',
                                                className: 'uppercase tracking-tighter mt-10'
                                             }}
                                          />
                                       </>
                                    );
                                 })()}

                                 {!isModalOpen && geofences.map(gf => {
                                    if (!gf.center) return null;
                                    let circleCenter = gf.center;
                                    if (Math.abs(circleCenter.lat - 28.6139) < 0.001 && Math.abs(circleCenter.lng - 77.2090) < 0.001) {
                                       const riderId = gf.riderId?._id || gf.riderId?.id || gf.riderId;
                                       const matchedRider = allRiders.find(r => (r._id || r.id || '').toString() === (riderId || '').toString());
                                       const isSagar = matchedRider?.name?.toLowerCase().includes('sagar') || matchedRider?.phone === '9993911855' || matchedRider?.phone === '4315256688';
                                       const isIndoreZone = gf?.name?.toUpperCase().includes('INDORE') || gf?.name?.toUpperCase().includes('ANKIT') || gf?.name?.toUpperCase().includes('TEST ZONE');
                                       const isPuneZone = gf?.name?.toUpperCase().includes('PUNE') || matchedRider?.name?.toLowerCase().includes('tushar') || matchedRider?.name?.toLowerCase().includes('ashish') || matchedRider?.phone === '9922968093' || matchedRider?.phone === '9049396061';

                                       if (isSagar || isIndoreZone) {
                                          circleCenter = { lat: 22.7166, lng: 75.8699 };
                                       } else if (isPuneZone) {
                                          circleCenter = { lat: 18.5815, lng: 73.7671 };
                                       } else {
                                          circleCenter = { lat: 18.5815, lng: 73.7671 };
                                       }
                                    }
                                    return (
                                       <CircleF
                                          key={gf._id || gf.id}
                                          center={circleCenter}
                                          radius={parseFloat(gf.radius) * 1000}
                                          options={{
                                             strokeColor: gf.type === 'exclusion' ? '#f43f5e' : '#10b981',
                                             strokeOpacity: 0.4,
                                             strokeWeight: 1,
                                             fillColor: gf.type === 'exclusion' ? '#f43f5e' : '#10b981',
                                             fillOpacity: 0.0,
                                          }}
                                       />
                                    );
                                 })}

                                 {!isModalOpen && !selectedZone && allRiders.map(rider => {
                                    const gf = geofences.find(g => (g.riderId?._id || g.riderId || '').toString() === (rider._id || rider.id || '').toString());
                                    const hasRealLocation = rider?.lastLocation &&
                                       ((rider.lastLocation.lat !== undefined && rider.lastLocation.lat !== null && rider.lastLocation.lat !== 0) ||
                                          (rider.lastLocation.latitude !== undefined && rider.lastLocation.latitude !== null && rider.lastLocation.latitude !== 0));

                                    if (!hasRealLocation && !gf) return null;

                                    const riderLoc = getRiderLiveLocation(rider, gf);
                                    if (!riderLoc) return null;
                                    const syntheticGfId = `temp-${rider._id || rider.id}`;
                                    return (
                                       <MarkerF
                                          key={rider._id || rider.id}
                                          position={riderLoc}
                                          onClick={() => {
                                             if (gf) {
                                                setSelectedZone(gf);
                                             } else {
                                                const targetZone = {
                                                   _id: syntheticGfId,
                                                   name: 'No Zone',
                                                   type: 'inclusion',
                                                   radius: '--',
                                                   status: 'inactive',
                                                   alerts: 0,
                                                   center: rider.lastLocation || { lat: 18.5815, lng: 73.7671 },
                                                   riderId: rider
                                                };
                                                setSelectedZone(targetZone);
                                                setMapCenter(riderLoc);
                                                if (map) {
                                                   map.panTo(riderLoc);
                                                   map.setZoom(16);
                                                }
                                                setLastSelectedZoneId(syntheticGfId);
                                             }
                                          }}
                                          icon={{
                                             url: 'https://maps.google.com/mapfiles/ms/icons/motorcycling.png',
                                             scaledSize: new window.google.maps.Size(30, 30)
                                          }}
                                          label={{
                                             text: rider.name || 'Rider',
                                             color: '#10b981',
                                             fontSize: '9px',
                                             fontWeight: '900',
                                             className: 'uppercase tracking-tighter mt-10'
                                          }}
                                       />
                                    );
                                 })}
                              </GoogleMap>
                           ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 space-y-4">
                                 <Activity size={24} className="text-emerald-500 animate-spin" />
                                 <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">Initializing Satellite Sync...</p>
                              </div>
                           )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                           <div className="p-3 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-subtle)]">
                              <p className="text-[7px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-1 italic">Current Location</p>
                              <p className="text-[9px] font-black text-[var(--text-primary)]">
                                 {selectedZone ? (() => {
                                    const riderId = selectedZone.riderId?._id || selectedZone.riderId?.id || selectedZone.riderId;
                                    const matchedRider = allRiders.find(r => (r._id || r.id || '').toString() === (riderId || '').toString());
                                    const loc = getRiderLiveLocation(matchedRider || selectedZone.riderId, selectedZone) || selectedZone.center || userLocation;
                                    const isNewDelhi = loc.lat === 28.6139 && loc.lng === 77.2090;
                                    const finalLoc = (isNewDelhi && userLocation) ? userLocation : loc;
                                    
                                    let address = matchedRider?.lastLocation?.address || selectedZone.center?.address || matchedRider?.address || '';
                                    if (riderId && firebaseLocations[riderId] && firebaseLocations[riderId].address) {
                                        address = firebaseLocations[riderId].address;
                                    }

                                    return (
                                       <span className="flex flex-col gap-0.5">
                                          <span className="truncate max-w-[200px] block" title={address || `${finalLoc.lat.toFixed(4)}° N, ${finalLoc.lng.toFixed(4)}° E`}>
                                             {address || `${finalLoc.lat.toFixed(4)}° N, ${finalLoc.lng.toFixed(4)}° E`}
                                          </span>
                                          {address && (
                                             <span className="text-[7px] font-bold text-[var(--text-tertiary)] block mt-0.5">
                                                {finalLoc.lat.toFixed(4)}° N, {finalLoc.lng.toFixed(4)}° E
                                             </span>
                                          )}
                                       </span>
                                    );
                                 })() : 'India Node'}
                              </p>
                           </div>
                           <div className="p-3 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-subtle)]">
                              <p className="text-[7px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-1 italic">Current Speed</p>
                              <p className="text-[9px] font-black text-emerald-500">
                                 {selectedZone ? (() => {
                                    const riderId = selectedZone.riderId?._id || selectedZone.riderId?.id || selectedZone.riderId;
                                    const matchedRider = allRiders.find(r => (r._id || r.id || '').toString() === (riderId || '').toString());
                                    
                                    let speed = matchedRider?.currentSpeed !== undefined ? matchedRider.currentSpeed : (selectedZone.riderId?.currentSpeed !== undefined ? selectedZone.riderId.currentSpeed : 0);
                                    if (riderId && firebaseLocations[riderId] && firebaseLocations[riderId].speed !== undefined) {
                                        speed = firebaseLocations[riderId].speed;
                                    }

                                    return `${speed} km/h`;
                                 })() : '0.0 km/h'}
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>
               </motion.div>
            ) : (
               <motion.div
                  key="alerts"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm min-h-[500px]"
               >
                  <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-rose-500/5">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-inner">
                           <Bell size={16} />
                        </div>
                        <div className="space-y-0.5">
                           <h3 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-wider leading-none italic">Anomalous Perimeter Breach Logs</h3>
                           <p className="text-[7px] font-bold text-rose-500/70 uppercase tracking-widest">Real-time Security Telemetry</p>
                        </div>
                     </div>
                     <button
                        onClick={() => setNotifications([])}
                        className="px-3 py-1.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-rose-500/20 transition-all"
                     >
                        Purge Logs
                     </button>
                  </div>

                  <div className="p-6">
                     {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                           <div className="w-16 h-16 bg-emerald-500/5 rounded-full flex items-center justify-center border border-emerald-500/10">
                              <Shield size={24} className="text-emerald-500/50" />
                           </div>
                           <div className="space-y-1">
                              <p className="text-[10px] font-black text-[var(--text-primary)] uppercase italic tracking-widest">Perimeter Secure</p>
                              <p className="text-[8px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider">No breaches detected in the current session.</p>
                           </div>
                        </div>
                     ) : (
                        <div className="space-y-3">
                           {notifications.map((n, idx) => (
                              <motion.div
                                 key={n.id}
                                 initial={{ opacity: 0, x: -10 }}
                                 animate={{ opacity: 1, x: 0 }}
                                 transition={{ delay: idx * 0.05 }}
                                 className="flex items-center justify-between bg-[var(--bg-tertiary)]/30 border border-rose-500/10 p-4 rounded-xl hover:border-rose-500/30 transition-all group"
                              >
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                                       <AlertTriangle size={18} />
                                    </div>
                                    <div className="space-y-1">
                                       <p className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tighter italic leading-none group-hover:text-rose-500 transition-colors">
                                          {n.message}
                                       </p>
                                       <div className="flex items-center gap-2">
                                          <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest">{n.type} Detected</span>
                                          <span className="w-1 h-1 bg-[var(--border-subtle)] rounded-full" />
                                          <span className="text-[8px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">{n.time}</span>
                                       </div>
                                    </div>
                                 </div>
                                 <button
                                    onClick={() => {
                                       const rider = allRiders.find(r => n.message.includes(r.name));
                                       if (rider?.lastLocation) {
                                          setActiveTab('registry');
                                          map.panTo(rider.lastLocation);
                                          map.setZoom(16);
                                       }
                                    }}
                                    className="p-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-tertiary)] hover:text-emerald-500 transition-all"
                                 >
                                    <Navigation size={14} />
                                 </button>
                              </motion.div>
                           ))}
                        </div>
                     )}
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

         {/* Create Zone Modal */}
         <AnimatePresence>
            {isModalOpen && (
               <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-sm">
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: 10 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: 10 }}
                     className="w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-t-[2rem] sm:rounded-[2rem] p-6 sm:p-8 shadow-2xl space-y-6 overflow-y-auto max-h-[90vh] relative"
                  >
                     <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
                        <MapIcon size={100} />
                     </div>

                     <div className="flex items-center justify-between relative z-10 border-b border-[var(--border-subtle)] pb-4">
                        <div className="space-y-0.5">
                           <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tighter italic leading-none">{modalMode === 'create' ? 'Create' : 'Edit'} <span className="text-emerald-500">Security Zone</span></h2>
                           <p className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest leading-none mt-1">{modalMode === 'create' ? 'Protocol Generation Module' : 'Configuration Override Module'}</p>
                        </div>
                        <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-rose-600/10 hover:text-rose-500 transition-all rounded-lg">
                           <X size={18} />
                        </button>
                     </div>

                     <form onSubmit={handleSaveZone} className="space-y-6 relative z-10">
                        <div className="space-y-4">
                           <div className="space-y-2">
                              <label className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1 italic leading-none">Zone Identity Name</label>
                              <input
                                 list="zone-names"
                                 autoFocus
                                 value={newZoneName}
                                 onChange={(e) => setNewZoneName(e.target.value.toUpperCase())}
                                 placeholder="e.g. PUNE, INDORE"
                                 className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-black tracking-widest focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500/40 outline-none transition-all placeholder:text-[var(--text-tertiary)]/50 italic text-[var(--text-primary)]"
                              />
                              <datalist id="zone-names">
                                 {[...new Set(geofences.map(gf => gf.name).filter(Boolean).map(n => n.toUpperCase()))].map(name => (
                                    <option key={name} value={name} />
                                 ))}
                              </datalist>
                           </div>

                           <div className="space-y-2">
                              <label className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1 italic leading-none">Select Target Rider</label>
                              <select
                                 value={selectedRider}
                                 onChange={(e) => {
                                    const rIdVal = e.target.value;
                                    setSelectedRider(rIdVal);
                                    if (rIdVal) {
                                       const matchedRider = allRiders.find(r => (r._id || r.id || '').toString() === rIdVal.toString());
                                       const riderLoc = matchedRider?.lastLocation;
                                       if (riderLoc) {
                                          const rLat = riderLoc.lat !== undefined && riderLoc.lat !== null ? riderLoc.lat : riderLoc.latitude;
                                          const rLng = riderLoc.lng !== undefined && riderLoc.lng !== null ? riderLoc.lng : riderLoc.longitude;
                                          if (rLat && rLng && Number(rLat) !== 0 && Number(rLng) !== 0) {
                                             setDraftCenter({ lat: Number(rLat), lng: Number(rLng) });
                                          }
                                       }
                                    }
                                 }}
                                 className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-black tracking-widest focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500/40 outline-none transition-all italic text-[var(--text-primary)]"
                              >
                                 <option value="">Choose Rider Node...</option>
                                 {subscribers.filter(s => s.persona?.toLowerCase() === 'rider').map(r => (
                                    <option key={r.id} value={r.id}>{r.name || r.phone}</option>
                                 ))}
                              </select>
                           </div>

                           <div className="space-y-2">
                              <div className="flex justify-between items-center ml-1">
                                 <label className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-widest italic leading-none">Perimeter Radius</label>
                                 <span className="text-[9px] font-black text-emerald-500 uppercase italic tracking-widest">{(draftRadius / 1000).toFixed(1)}KM</span>
                              </div>
                              <input
                                 type="range"
                                 min="100"
                                 max="50000"
                                 step="100"
                                 value={draftRadius}
                                 onChange={(e) => setDraftRadius(parseInt(e.target.value))}
                                 className="w-full accent-emerald-600 h-1.5 bg-[var(--bg-tertiary)] rounded-full appearance-none cursor-pointer border border-[var(--border-subtle)]"
                              />
                              <div className="flex justify-between text-[6px] font-black text-[var(--text-tertiary)] uppercase tracking-widest opacity-50 px-1">
                                 <span>0.1KM</span>
                                 <span>50KM</span>
                              </div>
                           </div>

                           <div className="space-y-2">
                              <label className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1 italic leading-none">Zone Protocol</label>
                              <div className="grid grid-cols-3 gap-2">
                                 {['inclusion', 'exclusion', 'speed-cap'].map((type) => (
                                    <button
                                       key={type}
                                       type="button"
                                       onClick={() => setNewZoneType(type)}
                                       className={`py-2 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all italic leading-none ${newZoneType === type
                                          ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                                          : 'bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-tertiary)] hover:border-emerald-500/30'
                                          }`}
                                    >
                                       {type}
                                    </button>
                                 ))}
                              </div>
                           </div>
                        </div>

                        <button
                           type="submit"
                           className="w-full py-4 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-950/20 hover:bg-emerald-700 transition-all active:scale-95 italic"
                        >
                           {modalMode === 'create' ? 'Initialize Perimeter Protocol' : 'Apply Configuration Patch'}
                        </button>
                     </form>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

         {/* Premium Floating Dynamic Toast Alert */}
         <AnimatePresence>
            {toast && (
               <motion.div
                  initial={{ opacity: 0, y: -50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  className="fixed top-6 right-6 z-[9999] max-w-sm bg-slate-950/90 border border-rose-500/30 rounded-2xl p-4 shadow-[0_0_30px_rgba(244,63,94,0.25)] backdrop-blur-xl flex items-center gap-4 cursor-pointer"
                  onClick={() => setToast(null)}
               >
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 animate-pulse">
                     <AlertTriangle size={20} className="text-rose-500 animate-bounce" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                     <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest leading-none italic">Radius Breach Protocol</p>
                     <p className="text-[10px] font-bold text-white leading-tight uppercase tracking-tighter">{toast.message}</p>
                  </div>
                  <button className="text-white/40 hover:text-white transition-all text-sm font-black px-1">&times;</button>
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   );
}
