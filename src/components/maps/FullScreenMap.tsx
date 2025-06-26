
import React, { useEffect, useRef } from 'react';
import { googleMaps } from '@/config/environment';

declare global {
  interface Window {
    initMap: () => void;
  }
}

interface FullScreenMapProps {
  onMapReady?: (map: google.maps.Map) => void;
  children?: React.ReactNode;
}

const FullScreenMap: React.FC<FullScreenMapProps> = ({ onMapReady, children }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set up initMap callback before loading Google Maps
    window.initMap = () => {
      const centerKigali = { lat: -1.9536, lng: 30.0605 };

      const map = new google.maps.Map(document.getElementById("map"), {
        center: centerKigali,
        zoom: 14,
        disableDefaultUI: true,
        styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }]
      });

      /* show blue current-location dot */
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(({ coords }) => {
          new google.maps.Marker({
            map,
            position: { lat: coords.latitude, lng: coords.longitude },
            icon: {
              url: "https://i.imgur.com/1X6hHnB.png",
              scaledSize: new google.maps.Size(32,32)
            }
          });
          map.panTo({ lat: coords.latitude, lng: coords.longitude });
        });
      }

      if (onMapReady) {
        onMapReady(map);
      }
    };

    // Load the SDK after initMap exists
    if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMaps.apiKey}&callback=initMap`;
      document.head.appendChild(script);
    } else if (window.google?.maps) {
      window.initMap();
    }
  }, [onMapReady]);

  return (
    <>
      {/* Map container */}
      <div id="map" style={{ position: 'fixed', inset: 0 }} ref={mapRef} />
      {children}
    </>
  );
};

export default FullScreenMap;
