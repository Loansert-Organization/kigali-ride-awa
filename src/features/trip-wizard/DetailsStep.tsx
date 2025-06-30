import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TripDraft } from './TripWizard';
import { SmartTimePicker } from '@/components/ui/smart-time-picker';
import { Users, Car, Bike, Truck, Clock, DollarSign, Minus, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { countryDetectionService } from '@/services/CountryDetectionService';

interface DetailsStepProps {
  draft: TripDraft;
  onUpdate: (updates: Partial<TripDraft>) => void;
}

const vehicleTypes = [
  { value: 'moto', label: 'Motorcycle', icon: Bike, capacity: 1, description: 'Fast & economical' },
  { value: 'car', label: 'Car', icon: Car, capacity: 4, description: 'Comfortable ride' },
  { value: 'tuktuk', label: 'Tuk-tuk', icon: Truck, capacity: 3, description: 'Local transport' },
  { value: 'minibus', label: 'Minibus', icon: Truck, capacity: 14, description: 'Group travel' },
];

export const DetailsStep = ({ draft, onUpdate }: DetailsStepProps) => {
  const { toast } = useToast();
  const { user } = useCurrentUser();
  
  // Get user's country info for pricing
  const userCountry = user?.country || 'RW';
  const countryInfo = countryDetectionService.getCountryByCode(userCountry);
  const pricePerKm = countryDetectionService.getDefaultPricePerKm(userCountry);
  const currencySymbol = countryDetectionService.getCurrencySymbol(countryInfo?.currency || 'RWF');
  const currencyCode = countryInfo?.currency || 'RWF';
  
  // Initialize default departure time (now + 30 minutes)
  useEffect(() => {
    if (!draft.departureTime) {
      const defaultTime = new Date();
      defaultTime.setMinutes(defaultTime.getMinutes() + 30);
      onUpdate({ departureTime: defaultTime });
    }
  }, []);

  // Calculate price when details change
  useEffect(() => {
    if (draft.origin && draft.destination && draft.seats) {
      // Simple distance estimation (would use real API in production)
      const estimatedDistance = calculateDistance(
        draft.origin.lat, draft.origin.lng,
        draft.destination.lat, draft.destination.lng
      );
      const estimatedPrice = Math.round(estimatedDistance * pricePerKm * draft.seats);
      onUpdate({ estimatedPrice });
    }
  }, [draft.origin, draft.destination, draft.seats, pricePerKm]);

  // Simple distance calculation (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleSeatsChange = (increment: boolean) => {
    const currentSeats = draft.seats || 1;
    const maxSeats = draft.role === 'driver' && draft.vehicleType 
      ? vehicleTypes.find(v => v.value === draft.vehicleType)?.capacity || 4
      : 8;
    
    const newSeats = increment 
      ? Math.min(currentSeats + 1, maxSeats)
      : Math.max(currentSeats - 1, 1);
    
    onUpdate({ seats: newSeats });
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  };

  const handleVehicleSelect = (vehicleType: string) => {
    const vehicle = vehicleTypes.find(v => v.value === vehicleType);
    if (vehicle) {
      // Adjust seats if current selection exceeds vehicle capacity
      const maxSeats = vehicle.capacity;
      const adjustedSeats = Math.min(draft.seats || 1, maxSeats);
      
      onUpdate({ 
        vehicleType,
        seats: adjustedSeats
      });
      
      if (adjustedSeats !== draft.seats) {
        toast({
          title: "Seats Adjusted",
          description: `Maximum ${maxSeats} seats available for ${vehicle.label}`,
        });
      }
    }
  };

  const selectedVehicle = vehicleTypes.find(v => v.value === draft.vehicleType);

  return (
    <div className="space-y-6">
      {/* Country Info Banner */}
      {countryInfo && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{countryInfo.flag}</span>
              <div>
                <div className="font-medium">{countryInfo.name}</div>
                <div className="text-sm text-gray-600">
                  Pricing in {currencyCode} • Base rate: {currencySymbol}{pricePerKm}/km
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seats Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>
              {draft.role === 'driver' ? 'Seats Available' : 'Seats Needed'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleSeatsChange(false)}
              disabled={draft.seats <= 1}
            >
              <Minus className="w-4 h-4" />
            </Button>
            
            <div className="text-center">
              <div className="text-3xl font-bold">{draft.seats || 1}</div>
              <div className="text-sm text-gray-500">
                {draft.seats === 1 ? 'seat' : 'seats'}
              </div>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleSeatsChange(true)}
              disabled={
                draft.role === 'driver' && 
                selectedVehicle && 
                draft.seats >= selectedVehicle.capacity
              }
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {draft.role === 'driver' && selectedVehicle && (
            <div className="text-center mt-2 text-xs text-gray-500">
              Max {selectedVehicle.capacity} seats for {selectedVehicle.label}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vehicle Type (Drivers Only) */}
      {draft.role === 'driver' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Car className="w-5 h-5" />
              <span>Vehicle Type</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {vehicleTypes.map((vehicle) => {
                const Icon = vehicle.icon;
                const isSelected = draft.vehicleType === vehicle.value;
                
                return (
                  <Button
                    key={vehicle.value}
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => handleVehicleSelect(vehicle.value)}
                    className={`h-auto p-4 flex flex-col items-center space-y-2 ${
                      isSelected 
                        ? 'bg-gradient-to-r from-[#3D7DFF] to-[#8E42FF] text-white' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <div className="text-center">
                      <div className="font-medium text-sm">{vehicle.label}</div>
                      <div className="text-xs opacity-75">{vehicle.description}</div>
                      <Badge variant="secondary" className="mt-1">
                        {vehicle.capacity} seats
                      </Badge>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Date & Time Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Departure Time</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SmartTimePicker
            value={draft.departureTime || new Date()}
            onChange={(date) => onUpdate({ departureTime: date })}
            minDate={new Date()}
            maxDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)} // 7 days from now
          />
        </CardContent>
      </Card>

      {/* Price Estimation */}
      {draft.estimatedPrice && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Estimated Cost</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {currencySymbol}{draft.estimatedPrice.toLocaleString()} {currencyCode}
                </div>
                <div className="text-xs text-green-700">
                  {draft.role === 'driver' ? 'Total earnings' : 'Total cost'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder={
              draft.role === 'driver' 
                ? "Any special instructions for passengers? (e.g., meeting point, vehicle details)"
                : "Any special requests? (e.g., need child seat, extra luggage space)"
            }
            value={draft.notes || ''}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            rows={3}
            maxLength={200}
          />
          <div className="text-xs text-gray-500 mt-1">
            {(draft.notes?.length || 0)}/200 characters
          </div>
        </CardContent>
      </Card>

      {/* Validation Messages */}
      {draft.role === 'driver' && !draft.vehicleType && (
        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
          ⚠️ Please select your vehicle type to continue
        </div>
      )}
      
      {!draft.departureTime && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
          ⚠️ Please set your departure time
        </div>
      )}
    </div>
  );
}; 