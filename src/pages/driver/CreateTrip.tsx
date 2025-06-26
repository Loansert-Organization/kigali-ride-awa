
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Car, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WhatsAppLoginModal } from '@/components/auth/WhatsAppLoginModal';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface TripData {
  fromLocation: string;
  toLocation: string;
  scheduledTime: string;
  vehicleType: string;
  description: string;
  fare: string;
  seatsAvailable: string;
}

const CreateTrip = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userProfile, isGuest } = useAuth();
  const { requireAuth, showLoginModal, setShowLoginModal, handleLoginSuccess } = useAuthGuard();
  const [isLoading, setIsLoading] = useState(false);
  
  const [tripData, setTripData] = useState<TripData>({
    fromLocation: '',
    toLocation: '',
    scheduledTime: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
    vehicleType: 'car',
    description: '',
    fare: '',
    seatsAvailable: '3'
  });

  const proceedWithTripCreation = async () => {
    if (!tripData.fromLocation || !tripData.toLocation) {
      toast({
        title: "Missing information",
        description: "Please enter both departure and destination locations",
        variant: "destructive"
      });
      return;
    }

    if (!userProfile) {
      toast({
        title: "Authentication required",
        description: "Please verify your WhatsApp number to post trips",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('trips')
        .insert({
          user_id: userProfile.id,
          from_location: tripData.fromLocation,
          to_location: tripData.toLocation,
          scheduled_time: tripData.scheduledTime,
          vehicle_type: tripData.vehicleType,
          description: tripData.description,
          fare: tripData.fare ? parseFloat(tripData.fare) : null,
          seats_available: parseInt(tripData.seatsAvailable),
          role: 'driver',
          status: 'pending',
          is_negotiable: !tripData.fare
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "🚗 Trip posted successfully!",
        description: "Passengers can now see and book your trip",
      });

      navigate('/home/driver');
    } catch (error) {
      console.error('Trip creation error:', error);
      toast({
        title: "Failed to post trip",
        description: "Please try again or contact support",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTrip = () => {
    requireAuth(proceedWithTripCreation);
  };

  const canCreateTrip = tripData.fromLocation && tripData.toLocation;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center max-w-md mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mr-3"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-bold">Post a Trip</h1>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-4">
        {/* Auth Status Banner */}
        {isGuest && (
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <p className="text-sm text-green-800">
              🚗 Fill in your trip details. You'll verify your WhatsApp when posting.
            </p>
          </div>
        )}

        {/* Route Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Trip Route
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="from">From (Starting Point)</Label>
              <Input
                id="from"
                placeholder="Where are you starting from?"
                value={tripData.fromLocation}
                onChange={(e) => setTripData(prev => ({ ...prev, fromLocation: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="to">To (Destination)</Label>
              <Input
                id="to"
                placeholder="Where are you going?"
                value={tripData.toLocation}
                onChange={(e) => setTripData(prev => ({ ...prev, toLocation: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Trip Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Trip Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="time">Departure Time</Label>
              <Input
                id="time"
                type="datetime-local"
                value={tripData.scheduledTime}
                onChange={(e) => setTripData(prev => ({ ...prev, scheduledTime: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="vehicle">Vehicle Type</Label>
              <Select
                value={tripData.vehicleType}
                onValueChange={(value) => setTripData(prev => ({ ...prev, vehicleType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="moto">🏍️ Moto</SelectItem>
                  <SelectItem value="car">🚗 Car</SelectItem>
                  <SelectItem value="tuktuk">🛺 Tuktuk</SelectItem>
                  <SelectItem value="minibus">🚐 Minibus</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="seats">Available Seats</Label>
                <Select
                  value={tripData.seatsAvailable}
                  onValueChange={(value) => setTripData(prev => ({ ...prev, seatsAvailable: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 seat</SelectItem>
                    <SelectItem value="2">2 seats</SelectItem>
                    <SelectItem value="3">3 seats</SelectItem>
                    <SelectItem value="4">4 seats</SelectItem>
                    <SelectItem value="5">5+ seats</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="fare">Fare per person (RWF)</Label>
                <Input
                  id="fare"
                  type="number"
                  placeholder="Optional"
                  value={tripData.fare}
                  onChange={(e) => setTripData(prev => ({ ...prev, fare: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Trip Description</Label>
              <Textarea
                id="notes"
                placeholder="Any details passengers should know? (meetup point, stops, etc.)"
                value={tripData.description}
                onChange={(e) => setTripData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Post Trip Button */}
        <Button
          onClick={handleCreateTrip}
          disabled={!canCreateTrip || isLoading}
          className="w-full bg-green-600 hover:bg-green-700"
          size="lg"
        >
          <Car className="w-5 h-5 mr-2" />
          {isLoading ? 'Posting Trip...' : isGuest ? '📱 Verify WhatsApp & Post Trip' : '🚗 Post Trip Now'}
        </Button>

        {!canCreateTrip && (
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">
              Please complete the following:
            </p>
            <div className="text-xs text-gray-400 space-y-1">
              {!tripData.fromLocation && <p>• Enter starting location</p>}
              {!tripData.toLocation && <p>• Enter destination</p>}
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            💡 Tip: Be specific about pickup points and mention if fare is negotiable
          </p>
        </div>
      </div>

      <WhatsAppLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => handleLoginSuccess(proceedWithTripCreation)}
        title="Post Your Trip"
        description="Verify your WhatsApp number to post trips and connect with passengers"
      />
    </div>
  );
};

export default CreateTrip;
