import React, { useEffect, useRef } from 'react';

export default function LiveFleetMap({ vehicles = [], franchises = [] }) {
  const mapRef = useRef(null);
  const googleMap = useRef(null);
  const vehicleMarkers = useRef({});
  const franchiseMarkers = useRef({});

  useEffect(() => {
    if (window.google && mapRef.current && !googleMap.current) {
      const defaultPos = { lat: 22.7196, lng: 75.8577 }; // Indore Fallback
      
      googleMap.current = new window.google.maps.Map(mapRef.current, {
        center: defaultPos, 
        zoom: 12,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#cbd5e1' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
          { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#fbbf24' }] },
          { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
          { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#38bdf8' }] },
          { featureType: 'poi', elementType: 'labels.icon', stylers: [{ visibility: 'on' }, { color: '#38bdf8' }] },
          { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#064e3b' }] },
          { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#34d399' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
          { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0f172a' }] },
          { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
          { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#334155' }] },
          { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1e293b' }] },
          { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f1f5f9' }] },
          { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#334155' }] },
          { featureType: 'road.local', elementType: 'geometry', stylers: [{ color: '#475569' }] }, // High vis for alleys/gali
          { featureType: 'road.local', elementType: 'geometry.stroke', stylers: [{ color: '#1e293b' }] },
          { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#cbd5e1' }] },
          { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
          { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#fbbf24' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
          { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#38bdf8' }] }
        ],
        disableDefaultUI: true,
        zoomControl: true,
      });

      // Geolocation Sync
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
          googleMap.current.setCenter(pos);
        });
      }
    }
  }, []);

  // Update Markers
  useEffect(() => {
    if (!googleMap.current || !window.google) return;

    const bounds = new window.google.maps.LatLngBounds();
    let hasMarkers = false;

    // 1. Render Franchises (Blue Icons)
    franchises.forEach(f => {
       const id = f._id || f.id;
       const pos = (f.businessDetails?.latitude && f.businessDetails?.longitude) 
         ? { lat: f.businessDetails.latitude, lng: f.businessDetails.longitude }
         : null;

       if (pos) {
          if (!franchiseMarkers.current[id]) {
             franchiseMarkers.current[id] = new window.google.maps.Marker({
                position: pos,
                map: googleMap.current,
                icon: {
                   path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                   fillColor: '#3b82f6',
                   fillOpacity: 1,
                   strokeWeight: 2,
                   strokeColor: '#FFFFFF',
                   scale: 5,
                },
                title: f.businessDetails?.name || 'Franchise Hub'
             });
             
             const infoWindow = new window.google.maps.InfoWindow({
                content: `<div style="color:black; padding:5px;"><strong>${f.businessDetails?.name || 'Franchise Hub'}</strong><br/>${f.ownerName || ''}</div>`
             });
             
             franchiseMarkers.current[id].addListener('click', () => {
                infoWindow.open(googleMap.current, franchiseMarkers.current[id]);
             });
          }
          bounds.extend(pos);
          hasMarkers = true;
       }
    });

    // 2. Render Vehicles (Green Pulsing Icons)
    vehicles.forEach((v, index) => {
      const id = v._id || v.id || `v-${index}`;
      
      // Use real lastLocation from DB (now populated from assigned Rider)
      const pos = v.lastLocation ? { lat: v.lastLocation.lat, lng: v.lastLocation.lng } : null;
      
        if (pos) {
          if (!vehicleMarkers.current[id]) {
            vehicleMarkers.current[id] = new window.google.maps.Marker({
              position: pos,
              map: googleMap.current,
              title: v.plate || 'Vehicle',
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: '#10b981', // Green Icon as requested
                fillOpacity: 1,
                strokeWeight: 3,
                strokeColor: '#FFFFFF',
                scale: 8,
              },
            });

            const infoWindow = new window.google.maps.InfoWindow({
               content: `
                 <div style="color:black; padding:8px; font-family: 'Inter', sans-serif;">
                   <div style="font-size:10px; font-weight:900; color:#10b981; text-transform:uppercase; margin-bottom:4px;">Vehicle: ${v.plate || 'N/A'}</div>
                   <div style="font-size:12px; font-weight:800; text-transform:uppercase;">Rider: ${v.rider || 'Unassigned'}</div>
                   <div style="font-size:9px; font-weight:700; color:#666; margin-top:4px;">Speed: ${v.currentSpeed || 0} km/h</div>
                 </div>
               `
            });

            vehicleMarkers.current[id].addListener('click', () => {
               infoWindow.open(googleMap.current, vehicleMarkers.current[id]);
            });
          } else {
            vehicleMarkers.current[id].setPosition(pos);
          }
          
          bounds.extend(pos);
          hasMarkers = true;
        }
    });

    if (hasMarkers && (vehicles.length + franchises.length) > 0) {
      // Only fit bounds if we have markers far apart
      googleMap.current.fitBounds(bounds);
      if (googleMap.current.getZoom() > 15) googleMap.current.setZoom(13);
    }
  }, [vehicles, franchises]);

  return <div ref={mapRef} className="w-full h-full rounded-2xl" />;
}

