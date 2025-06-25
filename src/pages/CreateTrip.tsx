
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, MapPin, Clock, Car, Users, DollarSign } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CreateTrip = () => {
  const navigate = useNavigate();
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [seatsAvailable, setSeatsAvailable] = useState('1');
  const [fare, setFare] = useState('');
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Please sign in",
          description: "You need to be signed in to create a trip",
          variant: "destructive"
        });
        return;
      }

      const { data: userRecord } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!userRecord) {
        toast({
          title: "Profile not found",
          description: "Please complete your profile setup",
          variant: "destructive"
        });
        return;
      }

      const tripData = {
        user_id: userRecord.id,
        role: 'driver',
        from_location: fromLocation,
        to_location: toLocation,
        vehicle_type: vehicleType,
        scheduled_time: new Date(scheduledTime).toISOString(),
        seats_available: parseInt(seatsAvailable),
        fare: fare ? parseFloat(fare) : null,
        is_negotiable: isNegotiable,
        description: description || null,
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('trips')
        .insert([tripData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Trip created!",
        description: "Your trip is now visible to passengers",
      });

      navigate('/home/driver');
    } catch (error) {
      console.error('Error creating trip:', error);
      toast({
        title: "Error",
        description: "Failed to create trip. Please try again.",
        variant: "destructive"
      });
    }
  };

  const canSubmit = fromLocation && toLocation && vehicleType && scheduledTime && seatsAvailable;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Create Trip</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Route */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold text-gray-800">Route Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Starting from
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-green-600" />
                <Input
                  placeholder="Where are you starting from?"
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Going to
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-red-600" />
                <Input
                  placeholder="Where are you going?"
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle & Schedule */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold text-gray-800">Trip Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle type
              </label>
              <Select value={vehicleType} onValueChange={setVehicleType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your vehicle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="moto">Moto</SelectItem>
                  <SelectItem value="car">Car</SelectItem>
                  <SelectItem value="tuktuk">Tuktuk</SelectItem>
                  <SelectItem value="minibus">Minibus</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Departure time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 w-5 h-5 text-blue-600" />
                <Input
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available seats
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-3 w-5 h-5 text-purple-600" />
                <Select value={seatsAvailable} onValueChange={setSeatsAvailable}>
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Number of seats" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 passenger</SelectItem>
                    <SelectItem value="2">2 passengers</SelectItem>
                    <SelectItem value="3">3 passengers</SelectItem>
                    <SelectItem value="4">4 passengers</SelectItem>
                    <SelectItem value="5">5+ passengers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold text-gray-800">Pricing</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fare per passenger (RWF)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 w-5 h-5 text-green-600" />
                <Input
                  type="number"
                  placeholder="Enter fare amount"
                  value={fare}
                  onChange={(e) => setFare(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Negotiable price</div>
                <div className="text-sm text-gray-500">Allow passengers to negotiate the fare</div>
              </div>
              <Switch
                checked={isNegotiable}
                onCheckedChange={setIsNegotiable}
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Details */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold text-gray-800">Additional Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <Textarea
                placeholder="Any additional information for passengers..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-20"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="pb-8">
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600"
          >
            Create Trip
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateTrip;
