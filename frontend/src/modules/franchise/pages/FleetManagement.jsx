import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
   Search,
   ChevronRight,
   Zap,
   ArrowRight,
   Navigation,
   X,
   Target,
   Activity,
   History,
   FileText,
   Settings,
   Battery,
   ShieldCheck,
   MapPin,
   Eye,
   Download as FileDown,
   Paperclip
} from 'lucide-react';
import { GoogleMap, useJsApiLoader, MarkerF, CircleF } from '@react-google-maps/api';
import { useRiderAssignmentStore } from '../store/riderAssignmentStore';
import { useFleetStore } from '../store/fleetStore';
import { useFranchiseAuthStore } from '../store/franchiseAuthStore';
import GlassTable from '../components/GlassTable';
import StatusBadge from '../components/StatusBadge';
import { getDatabase, ref, onValue } from "firebase/database";
import app from '../../../lib/firebase';

const containerStyle = {
   width: '100%',
   height: '100%'
};

const defaultCenter = {
   lat: 22.7196,
   lng: 75.8577
};

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

export default function FleetManagement() {
   const navigate = useNavigate();
   const { vehicles, filter, setFilter, fetchVehicles, isLoading } = useFleetStore();
   const { subscribers, fetchSubscribers } = useRiderAssignmentStore();
   const { user } = useFranchiseAuthStore();
   const [searchQuery, setSearchQuery] = useState('');
   const [selectedVehicle, setSelectedVehicle] = useState(null); // Controls Detail Drawer (now Rider)
   const [focusedVehicle, setFocusedVehicle] = useState(null);   // Controls Map Widget & Focus (now Rider)
   const [map, setMap] = useState(null);
   const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
   const [assignmentData, setAssignmentData] = useState({ riderName: '', riderPhone: '', vehiclePlate: '' });

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

   const [timeOffset, setTimeOffset] = useState(0);

   useEffect(() => {
      const moveInterval = setInterval(() => {
         setTimeOffset(prev => prev + 0.05);
      }, 3000);
      return () => clearInterval(moveInterval);
   }, []);

   const getVehicleLiveLocation = useCallback((v) => {
      const riderId = v?._id || v?.id;
      if (riderId && firebaseLocations[riderId]) {
         const fbLoc = firebaseLocations[riderId];
         return {
            lat: Number(fbLoc.lat),
            lng: Number(fbLoc.lng)
         };
      }

      const loc = v?.lastLocation || v?.location;
      if (loc) {
         const vLat = loc.lat !== undefined && loc.lat !== null ? loc.lat : loc.latitude;
         const vLng = loc.lng !== undefined && loc.lng !== null ? loc.lng : loc.longitude;
         if (vLat && vLng && Number(vLat) !== 0 && Number(vLng) !== 0) {
            const seed = parseInt((v._id || v.id || '0').slice(-6), 16) || 0;
            const driftLat = Math.sin(timeOffset * 0.4 + seed) * 0.00012;
            const driftLng = Math.cos(timeOffset * 0.4 + seed) * 0.00012;
            return {
               lat: Number(vLat) + driftLat,
               lng: Number(vLng) + driftLng
            };
         }
      }

      // Simulated GPS Fallback (mimics GeoFencing admin logic)
      const seed = parseInt((v?._id || v?.id || '0').slice(-6), 16) || 0;
      const driftLat = Math.sin(timeOffset + seed) * 0.00015;
      const driftLng = Math.cos(timeOffset + seed) * 0.00015;

      // Default base locations - Indore Base
      let baseLat = 22.7166;
      let baseLng = 75.8699;

      // Wide spread so they don't overlap
      const offsetLat = ((seed % 17) - 8) * 0.0025;
      const offsetLng = (((seed >> 3) % 17) - 8) * 0.0025;

      return {
         lat: baseLat + offsetLat + driftLat,
         lng: baseLng + offsetLng + driftLng
      };
   }, [timeOffset, firebaseLocations]);

   const { isLoaded } = useJsApiLoader({
      id: 'google-map-script',
      googleMapsApiKey: "AIzaSyBRHvhhxVDQyYkOryyo2IA19GuDFqsYD30"
   });

   const onLoad = useCallback(function callback(map) {
      setMap(map);
   }, []);

   const onUnmount = useCallback(function callback(map) {
      setMap(null);
   }, []);

   useEffect(() => {
      const fId = user?.id || user?._id;
      if (fId) {
         fetchVehicles(fId);
         fetchSubscribers();
         // Live polling every 5 seconds for "Exact Live Location"
         const interval = setInterval(() => {
            fetchVehicles(fId);
            fetchSubscribers();
         }, 5000);
         return () => clearInterval(interval);
      }
   }, [user, fetchSubscribers]);

   // Automatically follow focused vehicle and SYNC state when its location updates (live tracking)
   useEffect(() => {
      if (focusedVehicle) {
         const latest = subscribers.find(v => (v._id || v.id) === (focusedVehicle._id || focusedVehicle.id));
         if (latest) {
            // Sync the focusedVehicle state with the latest data from the store
            // This ensures the "Live Grid Monitor" header and "Last Location" boxes are always up-to-date
            setFocusedVehicle(latest);

            if (map) {
               const loc = getVehicleLiveLocation(latest);
               if (loc) {
                  map.panTo(loc);
               }
            }
         }
      }
   }, [vehicles, map, timeOffset, getVehicleLiveLocation, firebaseLocations]);

   useEffect(() => {
      const loc = focusedVehicle ? getVehicleLiveLocation(focusedVehicle) : null;
      if (loc && map) {
         map.panTo(loc);
         map.setZoom(19); // High precision zoom for "Exact Live Location"
      }
   }, [focusedVehicle?._id, focusedVehicle?.id, map]);

   const filteredVehicles = useMemo(() => {
      return subscribers.filter(v => {
         const matchesFilter = filter === 'all' || v.status === filter;
         const matchesSearch = (v.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (v.phone || '').toLowerCase().includes(searchQuery.toLowerCase());
         return matchesFilter && matchesSearch;
      });
   }, [subscribers, filter, searchQuery]);

   const handleRowClick = (vehicle) => {
      setFocusedVehicle(vehicle);
      setSelectedVehicle(vehicle);

      const loc = getVehicleLiveLocation(vehicle);
      if (loc && map) {
         map.panTo(loc);
         map.setZoom(19); // "Exact Live Location" focus
      }
   };

   const columns = [
      {
         header: 'Rider Profile',
         accessor: 'name',
         render: (row) => (
            <div className="flex flex-col gap-0.5">
               <span className="text-emerald-500 text-[9px] font-black italic tracking-[0.2em] uppercase leading-tight">{row.name || 'Unknown'}</span>
               <span className="text-[6.5px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.3em] italic opacity-60 leading-none">{row.phone}</span>
               {row.adminAssignedStartDate && (
                  <span className="text-[7.5px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Start: {new Date(row.adminAssignedStartDate).toLocaleDateString()}</span>
               )}
               {row.subscriptionPlan && (
                  <span className="text-[7.5px] font-bold text-blue-500 uppercase tracking-widest leading-none mt-0.5">Plan: {row.subscriptionPlan.name || row.subscriptionPlan.label || 'Active'}</span>
               )}
            </div>
         )
      },
      {
         header: 'Vehicle Assigned',
         accessor: 'vehicle',
         render: (row) => <span className="text-[7px] font-black text-[var(--text-tertiary)] font-mono tracking-[0.2em] italic uppercase opacity-60">{row.vehicleId?.plate || row.vehiclePlate || row.vehicleNo || 'NO VEHICLE'}</span>
      },
      {
         header: 'Verification Docs',
         accessor: 'attachment',
         render: (row) => (
            <div className="flex items-center gap-2">
               {row.aadhaarDocUrl ? (
                  <div className="flex items-center gap-1.5">
                     <a
                        href={row.aadhaarDocUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                        onClick={(e) => e.stopPropagation()}
                     >
                        <Eye size={12} strokeWidth={3} />
                     </a>
                  </div>
               ) : (
                  <span className="text-[7px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] italic opacity-60">PENDING</span>
               )}
            </div>
         )
      },
      {
         header: 'Hub Status',
         accessor: 'status',
         render: (row) => <StatusBadge status={row.status} />
      },
      {
         header: '',
         accessor: 'actions',
         render: (row) => (
            <div className="flex items-center gap-2">
               {!row.vehicleId && !row.vehiclePlate && !row.vehicleNo && (
                  <button
                     onClick={(e) => {
                        e.stopPropagation();
                        setAssignmentData({ riderName: row.name || row.fullName, riderPhone: row.phone, vehiclePlate: '' });
                        setIsAssignModalOpen(true);
                     }}
                     className="flex items-center gap-1 px-2 py-1 bg-emerald-600/10 text-emerald-500 rounded border border-emerald-500/20 text-[9px] font-black uppercase hover:bg-emerald-600 hover:text-white transition-colors"
                  >
                     <Zap size={10} /> Assign
                  </button>
               )}
               <button
                  onClick={(e) => {
                     e.stopPropagation();
                     setSelectedVehicle(row);
                     setFocusedVehicle(row);
                  }}
                  className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-all text-[var(--text-tertiary)] hover:text-emerald-500"
               >
                  <ChevronRight size={18} />
               </button>
            </div>
         )
      }
   ];

   const filterTabs = [
      { id: 'all', label: 'Whole Fleet' },
   ];

   return (
      <div className="space-y-6 pb-12">
         {/* Page Header Area */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-0.5">
               <div className="flex items-center gap-2">
                  <div className="w-1 h-3 bg-emerald-500 rounded-full" />
                  <h1 className="text-lg font-black tracking-tighter text-[var(--text-primary)] uppercase italic leading-none">
                     Fleet <span className="text-emerald-500">Inventory</span>
                  </h1>
               </div>
               <p className="text-[7px] font-black uppercase tracking-[0.3em] text-[var(--text-tertiary)] ml-3 italic opacity-40 leading-none">
                  FLEET_STATUS • DOCUMENT_COMPLIANCE
               </p>
            </div>
         </div>

         {/* Filters & Search Bar Area */}
         <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-1 rounded-xl shadow-inner">
               {filterTabs.map((tab) => (
                  <button
                     key={tab.id}
                     onClick={() => setFilter(tab.id)}
                     className={`px-3 py-1.5 rounded-lg text-[7px] font-black uppercase tracking-widest transition-all italic leading-none ${filter === tab.id
                           ? 'bg-emerald-600 text-white shadow-sm'
                           : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                        }`}
                  >
                     {tab.id.replace(/-/g, '_')}
                  </button>
               ))}
            </div>

            <div className="relative w-full lg:w-80 group">
               <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[var(--text-tertiary)] group-focus-within:text-emerald-500 transition-colors">
                  <Search size={12} strokeWidth={3} />
               </div>
               <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="SEARCH_PLATE_OR_VIN..."
                  className="w-full pl-8 pr-4 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl text-[9px] font-black text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all italic tracking-widest placeholder:text-[var(--text-tertiary)] placeholder:opacity-40 shadow-inner"
               />
            </div>
         </div>

         {/* Main Content: Split Layout (Table & Map) */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Table Registry */}
            <div className="lg:col-span-2">
               <GlassTable
                  columns={columns}
                  data={filteredVehicles}
                  onRowClick={handleRowClick}
                  selectedId={focusedVehicle?._id || focusedVehicle?.id}
                  emptyMessage={`No assets registered`}
               />
            </div>

            {/* Map Visualization */}
            <div className="space-y-4">
               <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-4 space-y-4 shadow-sm h-full flex flex-col min-h-[500px]">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <Target size={14} className="text-emerald-500" />
                        <h4 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest italic">Live Grid Monitor</h4>
                     </div>
                     {focusedVehicle && (
                        <div className="flex items-center gap-1">
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                           <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest">{focusedVehicle.plate}</span>
                        </div>
                     )}
                  </div>

                  <div className="flex-1 min-h-[350px] bg-[var(--bg-tertiary)] rounded-xl relative overflow-hidden group shadow-inner border border-[var(--border-subtle)]">
                     {isLoaded ? (
                        <GoogleMap
                           mapContainerStyle={containerStyle}
                           center={focusedVehicle ? (getVehicleLiveLocation(focusedVehicle) || defaultCenter) : defaultCenter}
                           zoom={focusedVehicle ? 19 : 12}
                           onLoad={onLoad}
                           onUnmount={onUnmount}
                           options={{
                              styles: mapStyles,
                              disableDefaultUI: true,
                              zoomControl: true,
                              mapTypeControl: false,
                              streetViewControl: false,
                              fullscreenControl: true,
                              clickableIcons: false
                           }}
                        >
                           {filteredVehicles.map(v => {
                              const liveLoc = getVehicleLiveLocation(v);
                              if (!liveLoc) return null;

                              const elements = [];
                              if (v.status === 'assigned') {
                                 elements.push(
                                    <CircleF
                                       key={`pulse-${v._id || v.id}`}
                                       center={liveLoc}
                                       radius={focusedVehicle?._id === v._id ? 60 : 30}
                                       options={{
                                          fillColor: '#10b981',
                                          fillOpacity: focusedVehicle?._id === v._id ? 0.3 : 0.1,
                                          strokeColor: '#10b981',
                                          strokeWeight: 1,
                                          strokeOpacity: 0.4,
                                          clickable: false
                                       }}
                                    />
                                 );
                              }

                              elements.push(
                                 <MarkerF
                                    key={`marker-${v._id || v.id}`}
                                    position={liveLoc}
                                    onClick={() => handleRowClick(v)}
                                    icon={{
                                       url: v.status === 'assigned'
                                          ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
                                          : 'https://maps.google.com/mapfiles/ms/icons/purple-dot.png',
                                       scaledSize: v.status === 'assigned'
                                          ? new window.google.maps.Size(35, 35)
                                          : new window.google.maps.Size(30, 30)
                                    }}
                                    animation={focusedVehicle?._id === v._id || focusedVehicle?.id === v.id ? window.google.maps.Animation.BOUNCE : null}
                                    label={{
                                       text: v.rider ? v.rider.toUpperCase() : v.plate,
                                       color: '#10b981', // Emerald Green matching GeoFencing
                                       fontSize: '10px',
                                       fontWeight: '900',
                                       className: 'mt-14 uppercase tracking-[0.15em] italic drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                                    }}
                                 />
                              );

                              return elements;
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
                           {focusedVehicle ? (() => {
                              const liveLoc = getVehicleLiveLocation(focusedVehicle);
                              if (!liveLoc) return 'Searching...';
                              
                              const riderId = focusedVehicle?.riderId?._id || focusedVehicle?.riderId?.id || focusedVehicle?.riderId;
                              let address = focusedVehicle.lastLocation?.address || focusedVehicle.location?.address || focusedVehicle.address || '';
                              if (riderId && firebaseLocations[riderId] && firebaseLocations[riderId].address) {
                                  address = firebaseLocations[riderId].address;
                              }

                              return (
                                 <span className="flex flex-col gap-0.5">
                                    <span className="truncate max-w-[200px] block" title={address || `${Number(liveLoc.lat).toFixed(4)}° N, ${Number(liveLoc.lng).toFixed(4)}° E`}>
                                       {address || `${Number(liveLoc.lat).toFixed(4)}° N, ${Number(liveLoc.lng).toFixed(4)}° E`}
                                    </span>
                                    {address && (
                                       <span className="text-[7px] font-bold text-[var(--text-tertiary)] block mt-0.5">
                                          {Number(liveLoc.lat).toFixed(4)}° N, {Number(liveLoc.lng).toFixed(4)}° E
                                       </span>
                                    )}
                                 </span>
                              );
                           })() : 'Searching...'}
                        </p>
                     </div>
                     <div className="p-3 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-subtle)]">
                        <p className="text-[7px] font-black text-[var(--text-tertiary)] uppercase tracking-widest mb-1 italic">Energy State</p>
                        <p className="text-[9px] font-black text-emerald-500">
                           {focusedVehicle?.battery !== undefined ? `${focusedVehicle.battery}%` : '--'}
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Details Modal / Drawer (Optional but kept for functionality) */}
         <AnimatePresence>
            {selectedVehicle && (
               <>
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onClick={() => setSelectedVehicle(null)}
                     className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-[60]"
                  />
                  <motion.div
                     initial={{ x: '100%' }}
                     animate={{ x: 0 }}
                     exit={{ x: '100%' }}
                     transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                     className="fixed top-0 right-0 h-full w-full max-w-xl bg-[var(--bg-secondary)] border-l border-[var(--border-subtle)] z-[70] shadow-2xl flex flex-col"
                  >
                     {/* Drawer Header */}
                     <div className="flex items-center justify-between px-6 h-12 border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/10 shadow-inner">
                        <div className="flex items-center gap-3">
                           <button
                              onClick={() => setSelectedVehicle(null)}
                              className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shadow-inner transition-all group"
                           >
                              <X size={14} className="group-hover:rotate-90 transition-transform" />
                           </button>
                           <div className="h-4 w-px bg-[var(--border-subtle)]" />
                           <button
                              onClick={() => navigate(`/franchise/riders`)}
                              className="text-[7.5px] font-black uppercase tracking-[0.2em] italic text-emerald-500 hover:text-emerald-400 group flex items-center gap-1"
                           >
                              RIDER_REGISTRY <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                           </button>
                        </div>
                        <div className="flex items-center gap-3 scale-90">
                           <StatusBadge status={selectedVehicle.status} />
                        </div>
                     </div>

                     <div className="flex-1 overflow-y-auto no-scrollbar p-6">
                        {/* Rider Identity */}
                        <div className="flex items-start gap-4 mb-8">
                           <div className="w-14 h-14 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shadow-inner flex items-center justify-center text-emerald-500">
                              <Zap size={24} strokeWidth={1.5} />
                           </div>
                           <div className="flex-1 min-w-0 pt-1">
                              <h2 className="text-xl font-black tracking-tighter italic text-[var(--text-primary)] leading-none">
                                 {selectedVehicle.name || 'Unknown Rider'}
                              </h2>
                              <div className="flex items-center gap-2 mt-2">
                                 <span className="text-[7.5px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase tracking-[0.2em] italic leading-none">
                                    {selectedVehicle.phone}
                                 </span>
                                 <span className="text-[7.5px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] italic leading-none opacity-60">
                                    VEHICLE: {selectedVehicle.vehicleId?.plate || selectedVehicle.vehiclePlate || selectedVehicle.vehicleNo || 'NONE'}
                                 </span>
                              </div>
                           </div>
                        </div>

                        {/* Operational Summary */}
                        <div className="grid grid-cols-3 gap-3 mb-8">
                           <div className="p-3 rounded-xl bg-black border border-[var(--border-subtle)] space-y-1.5 shadow-inner relative overflow-hidden">
                              <div className="text-emerald-500 flex items-center gap-1.5 mb-2 relative z-10">
                                 <Battery size={10} strokeWidth={3} />
                                 <span className="text-[6.5px] font-black uppercase tracking-[0.2em] opacity-60 text-emerald-500 italic leading-none">PLAN STATUS</span>
                              </div>
                              <p className="text-lg font-black italic text-white leading-none relative z-10">{selectedVehicle.subscriptionPlan ? 'ACTIVE' : 'NO PLAN'}</p>
                           </div>
                           <div className="p-3 rounded-xl bg-black border border-[var(--border-subtle)] space-y-1.5 shadow-inner relative overflow-hidden">
                              <div className="text-blue-500 flex items-center gap-1.5 mb-2 relative z-10">
                                 <Navigation size={10} strokeWidth={3} />
                                 <span className="text-[6.5px] font-black uppercase tracking-[0.2em] opacity-60 text-blue-500 italic leading-none">DEPOSIT</span>
                              </div>
                              <p className="text-lg font-black italic text-white leading-none relative z-10">{selectedVehicle.depositPaid ? 'PAID' : 'PENDING'}</p>
                           </div>
                           <div className="p-3 rounded-xl bg-black border border-[var(--border-subtle)] space-y-1.5 shadow-inner relative overflow-hidden">
                              <div className="text-amber-500 flex items-center gap-1.5 mb-2 relative z-10">
                                 <ShieldCheck size={10} strokeWidth={3} />
                                 <span className="text-[6.5px] font-black uppercase tracking-[0.2em] opacity-60 text-amber-500 italic leading-none">VERIFICATION</span>
                              </div>
                              <p className="text-lg font-black italic text-white leading-none relative z-10 uppercase tracking-tighter">{selectedVehicle.aadhaarDocUrl ? 'VERIFIED' : 'PENDING'}</p>
                           </div>
                        </div>

                        {/* Location History Section */}
                        <div className="space-y-4">
                           <div className="flex items-center gap-6 border-b border-[var(--border-subtle)]">
                              <button className="px-1 py-2 text-[7.5px] font-black uppercase tracking-[0.2em] italic text-emerald-500 border-b-2 border-emerald-500 flex gap-2"><MapPin size={10} /> LIVE TRACKING</button>
                           </div>

                           <div className="space-y-2">
                                 <div className="py-8 border border-dashed border-[var(--border-subtle)] rounded-xl flex flex-col items-center justify-center gap-2 text-center bg-[var(--bg-secondary)] shadow-inner">
                                    <MapPin size={18} className="text-[var(--text-tertiary)] opacity-30" />
                                    <div className="space-y-1">
                                       <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] italic">LOCATION STREAM ACTIVE</p>
                                       <p className="text-[6.5px] font-black text-[var(--text-tertiary)] opacity-40 uppercase tracking-[0.3em] italic">SYNCING FROM RIDER DEVICE</p>
                                    </div>
                                 </div>
                           </div>
                        </div>
                     </div>

                     {/* Drawer Footer */}
                     <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] grid grid-cols-2 gap-3 shadow-inner">
                        <button className="py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[7.5px] font-black uppercase tracking-[0.2em] italic text-[var(--text-primary)] hover:border-emerald-500/20 transition-all flex items-center justify-center gap-2 shadow-inner">
                           <FileText size={10} strokeWidth={3} /> COMPLIANCE_AUDIT
                        </button>
                        <button className="py-2.5 rounded-xl bg-emerald-600 text-white text-[7.5px] font-black uppercase tracking-[0.2em] italic hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 active:scale-95">
                           <Settings size={10} strokeWidth={3} /> SERVICE_CONSOLE
                        </button>
                     </div>
                  </motion.div>
               </>
            )}
         </AnimatePresence>
         <AnimatePresence>
            {isAssignModalOpen && (
               <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className="w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-8 shadow-2xl space-y-6"
                  >
                     <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                           <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tighter italic leading-none">Vehicle <span className="text-emerald-500">Assignment</span></h2>
                           <p className="text-[8px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">PROVISION_DISPATCH_PROTOCOL</p>
                        </div>
                        <button onClick={() => setIsAssignModalOpen(false)} className="p-1.5 hover:bg-rose-600/10 hover:text-rose-500 transition-all rounded-lg">
                           <X size={16} />
                        </button>
                     </div>

                     <form
                        onSubmit={async (e) => {
                           e.preventDefault();
                           try {
                              const api = (await import('../../../lib/axios')).default;
                              const res = await api.post('/fleet/assignments', {
                                 vehiclePlate: assignmentData.vehiclePlate,
                                 riderPhone: assignmentData.riderPhone,
                                 type: 'Manual',
                                 hubName: user?.name || user?.hubName || 'Hub'
                              });
                              if (res.data.success) {
                                 setIsAssignModalOpen(false);
                                 alert("Vehicle Assigned Successfully!");
                                 fetchSubscribers();
                                 fetchVehicles(user?.id || user?._id);
                              } else {
                                 alert(res.data.message || "Assignment Failed");
                              }
                           } catch (err) {
                              alert(err.response?.data?.message || "Assignment Failed");
                           }
                        }}
                        className="space-y-6"
                     >
                        <div className="space-y-4">
                           <div className="space-y-1.5">
                              <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Rider Name</label>
                              <input
                                 value={assignmentData.riderName}
                                 onChange={(e) => setAssignmentData({ ...assignmentData, riderName: e.target.value })}
                                 placeholder="Rider Name"
                                 className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold uppercase tracking-wider focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all"
                              />
                           </div>

                           <div className="space-y-1.5">
                              <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Mobile Number</label>
                              <input
                                 value={assignmentData.riderPhone}
                                 onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    if (val.length <= 10) {
                                       setAssignmentData({ ...assignmentData, riderPhone: val });
                                    }
                                 }}
                                 placeholder="Mobile Number"
                                 className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold uppercase tracking-wider focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all"
                              />
                           </div>

                           <div className="space-y-1.5">
                              <label className="text-[8px] font-black text-[var(--text-tertiary)] uppercase tracking-widest ml-1">Vehicle Plate Number</label>
                              <select
                                 required
                                 value={assignmentData.vehiclePlate}
                                 onChange={(e) => setAssignmentData({ ...assignmentData, vehiclePlate: e.target.value })}
                                 className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold uppercase tracking-wider focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all text-[var(--text-primary)]"
                              >
                                 <option value="">Select Vehicle Plate</option>
                                 {vehicles.filter(v => v.status !== 'assigned').map(v => (
                                    <option key={v._id || v.id} value={v.plate}>
                                       {v.plate} — {v.model || 'Vehicle'}
                                    </option>
                                 ))}
                              </select>
                           </div>
                        </div>

                        <button
                           type="submit"
                           className="w-full py-3 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-950/20 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                           <Zap size={14} fill="white" /> Save & Assign Vehicle
                        </button>
                     </form>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </div>
   );
}
