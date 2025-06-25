
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { User, MapPin, Star, Gift } from 'lucide-react';

const PassengerHome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-orange-500 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <User className="w-16 h-16 mx-auto text-purple-600 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Passenger Dashboard</h1>
          <p className="text-gray-600 mb-6">Welcome to your ride booking dashboard!</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <MapPin className="w-8 h-8 mx-auto text-purple-600 mb-2" />
              <h3 className="font-semibold">Book Ride</h3>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <Star className="w-8 h-8 mx-auto text-orange-600 mb-2" />
              <h3 className="font-semibold">Favorites</h3>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <Gift className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <h3 className="font-semibold">Rewards</h3>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <User className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <h3 className="font-semibold">Profile</h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PassengerHome;
