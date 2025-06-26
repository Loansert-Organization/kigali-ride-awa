
import React, { useEffect, useRef } from 'react';
import { googleMapsLoader } from '@/utils/googleMapsLoader';

interface FullScreenMapProps {
  onMapReady?: (map: google.maps.Map) => void;
  children?: React.ReactNode;
}

const FullScreenMap: React.FC<FullScreenMapProps> = ({ onMapReady, children }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    const initializeMap = async () => {
      try {
        console.log('🗺️ Initializing full-screen map...');
        
        // Load Google Maps
        await googleMapsLoader.loadGoogleMaps();
        
        if (!mapRef.current) {
          console.error('❌ Map container not found');
          return;
        }

        const centerKigali = { lat: -1.9536, lng: 30.0605 }; // Kigali city centre

        /* 1️⃣ make the map */
        const map = new google.maps.Map(mapRef.current, {
          center: centerKigali,
          zoom: 14,
          disableDefaultUI: true,
          styles: [
            /* dark-mode friendly grey style */
            {
              "featureType": "poi", 
              "stylers": [{ "visibility": "off" }]
            },
            {
              "featureType": "road",
              "elementType": "geometry",
              "stylers": [{ "color": "#f5f5f5" }]
            },
            {
              "featureType": "water",
              "elementType": "geometry",
              "stylers": [{ "color": "#e6f3ff" }]
            }
          ]
        });

        mapInstanceRef.current = map;
        console.log('✅ Map created successfully');

        /* 2️⃣ show *your* current dot */
        if (navigator.geolocation) {
          console.log('📍 Getting current location...');
          navigator.geolocation.getCurrentPosition(({ coords }) => {
            console.log('✅ Location obtained:', coords.latitude, coords.longitude);
            
            new google.maps.Marker({
              map,
              position: { lat: coords.latitude, lng: coords.longitude },
              icon: {
                url: "https://i.imgur.com/1X6hHnB.png", // tiny blue dot icon
                scaledSize: new google.maps.Size(32, 32)
              },
              title: "Your Location"
            });
            
            map.panTo({ lat: coords.latitude, lng: coords.longitude });
            console.log('✅ User location marker added and map centered');
          }, (error) => {
            console.warn('⚠️ Geolocation error:', error);
          });
        }

        // Notify parent component that map is ready
        if (onMapReady) {
          onMapReady(map);
        }

      } catch (error) {
        console.error('❌ Error initializing map:', error);
      }
    };

    initializeMap();
  }, [onMapReady]);

  return (
    <>
      {/* Map div fills the whole page */}
      <div 
        ref={mapRef}
        id="map" 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0 
        }}
      />
      {children}
    </>
  );
};

export default FullScreenMap;
