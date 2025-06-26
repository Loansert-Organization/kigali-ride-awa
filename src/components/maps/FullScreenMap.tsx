
/**
 * FullScreenMap – loads Google Maps once, fills the page,
 * then calls props.onMapReady(map) so parent can add markers.
 */
import React, { useEffect, useRef } from "react";
import { googleMaps } from "@/config/environment";

declare global {
  interface Window { _initKigaliRideMap?: () => void }
}

type Props = {
  onMapReady?: (map: google.maps.Map) => void;
  children?: React.ReactNode;
};

const FullScreenMap: React.FC<Props> = ({ onMapReady, children }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map>();

  useEffect(() => {
    /* If SDK already loaded just init */
    if (window.google?.maps) { init(); return; }

    /* Otherwise inject <script> only once */
    if (!window._initKigaliRideMap) {
      window._initKigaliRideMap = () => init();
      const s = document.createElement("script");
      s.src =
        `https://maps.googleapis.com/maps/api/js?key=${googleMaps.apiKey}&callback=_initKigaliRideMap`;
      s.async = true;
      document.body.appendChild(s);
    }
  }, []);

  /** create the map */
  function init() {
    if (!divRef.current || mapRef.current) return;

    const map = new google.maps.Map(divRef.current, {
      center: { lat: -1.9536, lng: 30.0605 }, // Kigali
      zoom: 14,
      disableDefaultUI: true,
      styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
    });
    mapRef.current = map;

    /* Blue dot – user location */
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        new google.maps.Marker({
          map,
          position: { lat: coords.latitude, lng: coords.longitude },
          icon: {
            url: "https://i.imgur.com/1X6hHnB.png",
            scaledSize: new google.maps.Size(32, 32),
          },
        });
        map.panTo({ lat: coords.latitude, lng: coords.longitude });
      });
    }

    onMapReady?.(map);
  }

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <div ref={divRef} style={{ position: "absolute", inset: 0 }} />
      {children}
    </div>
  );
};

export default FullScreenMap;
