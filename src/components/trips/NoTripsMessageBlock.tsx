
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car } from 'lucide-react';

interface NoTripsMessageBlockProps {
  onBookFirstTrip: () => void;
}

const NoTripsMessageBlock: React.FC<NoTripsMessageBlockProps> = ({
  onBookFirstTrip
}) => {
  return (
    <div className="p-4 pt-12">
      <Card className="text-center">
        <CardContent className="p-8">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Car className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No trips yet
            </h3>
            <p className="text-gray-600 mb-6">
              You haven't booked a ride yet. Start your journey with Kigali Ride!
            </p>
          </div>
          
          <Button
            onClick={onBookFirstTrip}
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white font-semibold"
          >
            🚖 Book your first trip
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NoTripsMessageBlock;
