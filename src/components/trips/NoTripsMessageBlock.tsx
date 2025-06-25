
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Car, MapPin } from 'lucide-react';

interface NoTripsMessageBlockProps {
  role: 'passenger' | 'driver';
}

const NoTripsMessageBlock: React.FC<NoTripsMessageBlockProps> = ({ role }) => {
  const navigate = useNavigate();

  const handleAction = () => {
    if (role === 'passenger') {
      navigate('/book-ride');
    } else {
      navigate('/create-trip');
    }
  };

  return (
    <Card>
      <CardContent className="text-center py-12">
        <div className="mb-6">
          {role === 'passenger' ? (
            <MapPin className="w-16 h-16 mx-auto text-gray-400" />
          ) : (
            <Car className="w-16 h-16 mx-auto text-gray-400" />
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No trips yet
        </h3>
        <p className="text-gray-600 mb-6">
          {role === 'passenger' 
            ? "You haven't booked any rides yet. Start exploring Kigali!"
            : "You haven't created any trips yet. Start by posting where you're going!"
          }
        </p>
        <Button onClick={handleAction} className="bg-purple-600 hover:bg-purple-700">
          {role === 'passenger' ? '🚖 Book Your First Ride' : '📍 Create Your First Trip'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default NoTripsMessageBlock;
