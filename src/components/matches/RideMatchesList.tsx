
import React from 'react';
import { useNavigate } from 'react-router-dom';
import DriverTripCardBlock from "@/components/matches/DriverTripCardBlock";
import NoMatchFallbackBlock from "@/components/matches/NoMatchFallbackBlock";

interface Trip {
  id: string;
  user_id: string;
  from_location: string;
  to_location: string;
  from_lat?: number;
  from_lng?: number;
  to_lat?: number;
  to_lng?: number;
  vehicle_type: string;
  scheduled_time: string;
  fare?: number;
  is_negotiable?: boolean;
  description?: string;
  role: string;
}

interface RideMatchesListProps {
  trips: Trip[];
  loading: boolean;
  onMatch: (trip: Trip) => void;
  onWhatsApp: (trip: Trip) => void;
}

const RideMatchesList: React.FC<RideMatchesListProps> = ({
  trips,
  loading,
  onMatch,
  onWhatsApp
}) => {
  const navigate = useNavigate();

  const handleWhatsAppLaunch = (driverTrip: Trip) => {
    const message = `Hi! I've booked your trip from ${driverTrip.from_location} to ${driverTrip.to_location} at ${new Date(driverTrip.scheduled_time).toLocaleTimeString()} via Kigali Ride. Looking forward to it!`;
    const encodedMessage = encodeURIComponent(message);
    
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    
    onWhatsApp(driverTrip);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (trips.length === 0) {
    return <NoMatchFallbackBlock onBackToBooking={() => navigate('/book-ride')} />;
  }

  return (
    <div className="space-y-4">
      {trips.map((trip) => (
        <DriverTripCardBlock
          key={trip.id}
          trip={trip}
          onMatch={() => onMatch(trip)}
          onWhatsApp={() => handleWhatsAppLaunch(trip)}
        />
      ))}
    </div>
  );
};

export default RideMatchesList;
