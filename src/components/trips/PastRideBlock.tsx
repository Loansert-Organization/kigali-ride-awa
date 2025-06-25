
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, DollarSign } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PastRideBlockProps {
  trip: any;
  onBookAgain?: () => void;
  onSaveAsFavorite?: () => void;
}

const PastRideBlock: React.FC<PastRideBlockProps> = ({ 
  trip, 
  onBookAgain = () => {}, 
  onSaveAsFavorite = () => {} 
}) => {
  const handleBookAgain = () => {
    toast({
      title: "Booking again",
      description: "Creating new ride with same details...",
    });
    onBookAgain();
  };

  const handleSaveAsFavorite = () => {
    toast({
      title: "Saved as favorite",
      description: "This route has been added to your favorites.",
    });
    onSaveAsFavorite();
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <MapPin className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-sm font-medium">{trip.from_location}</span>
            </div>
            <div className="flex items-center mb-2">
              <MapPin className="w-4 h-4 text-red-600 mr-2" />
              <span className="text-sm font-medium">{trip.to_location}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-1" />
              <span>{new Date(trip.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center text-sm font-semibold text-green-600">
              <DollarSign className="w-4 h-4 mr-1" />
              {trip.fare ? `${trip.fare} RWF` : 'Negotiable'}
            </div>
            <span className="text-xs text-gray-500 capitalize">{trip.vehicle_type}</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBookAgain}
            className="flex-1 text-xs"
          >
            🔄 Book Again
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveAsFavorite}
            className="flex-1 text-xs"
          >
            ⭐ Save as Favorite
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PastRideBlock;
