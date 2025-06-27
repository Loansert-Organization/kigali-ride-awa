
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from 'lucide-react';

interface SmartMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    lat: number;
    lng: number;
    title?: string;
    type?: 'driver' | 'passenger' | 'trip';
  }>;
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  className?: string;
}

const SmartMap: React.FC<SmartMapProps> = ({
  center = { lat: -1.9441, lng: 30.0619 }, // Kigali coordinates
  zoom = 13,
  markers = [],
  onLocationSelect,
  className
}) => {
  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (onLocationSelect) {
      // Simulate location selection
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      // Convert click position to approximate lat/lng
      const lat = center.lat + (0.5 - y / rect.height) * 0.01;
      const lng = center.lng + (x / rect.width - 0.5) * 0.01;
      
      onLocationSelect({ lat, lng });
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div 
          className="w-full h-64 bg-gradient-to-br from-green-100 to-blue-100 relative cursor-crosshair"
          onClick={handleMapClick}
        >
          {/* Map placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Interactive Map</p>
              <p className="text-xs text-gray-500">Click to select location</p>
            </div>
          </div>
          
          {/* Markers */}
          {markers.map((marker, index) => (
            <div
              key={index}
              className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${50 + (marker.lng - center.lng) * 1000}%`,
                top: `${50 - (marker.lat - center.lat) * 1000}%`
              }}
              title={marker.title}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export { SmartMap };
export default SmartMap;
