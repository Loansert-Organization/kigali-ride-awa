
import React, { useEffect, useState, useCallback } from "react";
import { GoogleMap, LoadScript, MarkerF } from "@react-google-maps/api";
import { supabase } from "@/integrations/supabase/client";

type SmartMapProps = {
  center: google.maps.LatLngLiteral;
  zoom?: number;
  height?: string;
  width?: string;
  markers?: google.maps.LatLngLiteral[];
  onMapClick?: (event: google.maps.MapMouseEvent) => void;
  children?: React.ReactNode;
};

export const SmartMap: React.FC<SmartMapProps> = ({
  center,
  zoom = 14,
  height = "100%",
  width = "100%",
  markers = [],
  onMapClick,
  children,
}) => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /** Fetch the one-time key from our Edge Function */
  const fetchKey = useCallback(async () => {
    try {
      console.log('🔄 Fetching secure Google Maps API key...');
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('maps-sig');
      
      if (error) {
        console.error('❌ Error fetching maps key:', error);
        throw error;
      }
      
      if (data?.key) {
        console.log('✅ Received secure API key with TTL:', data.ttl);
        setApiKey(data.key);
        setError(null);
      } else {
        throw new Error('No API key received from server');
      }
    } catch (e) {
      console.error('❌ Failed to fetch Google Maps key:', e);
      setError("Could not fetch Google Maps key. Please check your internet connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKey();
  }, [fetchKey]);

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100 rounded-lg border">
        <div className="text-center p-6">
          <div className="text-red-600 mb-2">🗺️ Map Error</div>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchKey}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !apiKey) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100 rounded-lg border">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading secure map...</p>
        </div>
      </div>
    );
  }

  /** Graceful error handler for map */
  const onError = () => {
    console.error('❌ Google Maps failed to load');
    setError(
      "Google Maps failed to load. Check billing, domain restrictions, and console logs."
    );
  };

  const mapOptions = {
    disableDefaultUI: false,
    mapTypeControl: false,
    fullscreenControl: false,
    streetViewControl: false,
    zoomControl: true,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'on' }]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#f5f5f5' }]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#e6f3ff' }]
      }
    ]
  };

  return (
    <LoadScript 
      googleMapsApiKey={apiKey} 
      onError={onError}
      libraries={['places', 'geometry']}
    >
      <GoogleMap
        mapContainerStyle={{ height, width }}
        center={center}
        zoom={zoom}
        options={mapOptions}
        onClick={onMapClick}
      >
        {markers.map((marker, index) => (
          <MarkerF 
            key={index} 
            position={marker}
            animation={window.google?.maps?.Animation?.DROP}
          />
        ))}
        {children}
      </GoogleMap>
    </LoadScript>
  );
};
