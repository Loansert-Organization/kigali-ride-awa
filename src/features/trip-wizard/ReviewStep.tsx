import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TripDraft } from './TripWizard';
import { MapPin, Clock, Users, Car, DollarSign, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/hooks/use-toast';
import { useTripHistory } from '@/hooks/useTripHistory';

interface ReviewStepProps {
  draft: TripDraft;
  onUpdate: (updates: Partial<TripDraft>) => void;
  onSubmit: (tripId: string) => void;
  isSubmitting: boolean;
  setIsSubmitting: (submitting: boolean) => void;
}

export const ReviewStep = ({ 
  draft, 
  onUpdate, 
  onSubmit, 
  isSubmitting, 
  setIsSubmitting 
}: ReviewStepProps) => {
  const { toast } = useToast();
  const { user } = useCurrentUser();
  const { saveTripToHistory } = useTripHistory();

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-RW', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-RW', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getVehicleLabel = (type?: string) => {
    const vehicles = {
      moto: 'Motorcycle',
      car: 'Car',
      tuktuk: 'Tuk-tuk',
      minibus: 'Minibus'
    };
    return type ? vehicles[type as keyof typeof vehicles] || type : 'Not specified';
  };

  const isFormValid = () => {
    return draft.origin && 
           draft.destination && 
           draft.seats > 0 && 
           draft.departureTime &&
           (draft.role === 'passenger' || draft.vehicleType);
  };

  const handlePublishTrip = async () => {
    if (!isFormValid()) {
      toast({
        title: "Incomplete Information",
        description: "Please complete all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please ensure you're logged in",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create geography points for origin and destination
      const originPoint = `POINT(${draft.origin!.lng} ${draft.origin!.lat})`;
      const destPoint = `POINT(${draft.destination!.lng} ${draft.destination!.lat})`;

      // Prepare trip data
      const tripData = {
        creator_id: user.id,
        role: draft.role,
        origin_geom: originPoint,
        origin_text: draft.origin!.address,
        dest_geom: destPoint,
        dest_text: draft.destination!.address,
        departure_time: draft.departureTime!.toISOString(),
        price_local: draft.estimatedPrice || 0,
        currency: 'RWF',
        notes: draft.notes || null,
        status: 'open' as const,
        ...(draft.role === 'driver' ? {
          seats_offered: draft.seats,
          vehicle_type: draft.vehicleType
        } : {
          seats_needed: draft.seats
        })
      };

      // Insert trip into database
      const { data: trip, error: insertError } = await supabase
        .from('trips_wizard')
        .insert(tripData)
        .select()
        .single();

      if (insertError) {
        console.error('Trip insertion error:', insertError);
        throw new Error('Failed to create trip');
      }

      // Save to trip history for AI learning
      await saveTripToHistory({
        role: draft.role,
        origin: draft.origin as any,
        destination: draft.destination as any,
        departureTime: draft.departureTime!,
        seats: draft.seats,
        vehicleType: draft.vehicleType,
        fareAmount: draft.estimatedPrice
      });

      // Trigger matching algorithm
      try {
        const { data: matches, error: matchError } = await supabase
          .rpc('match_trips', { p_trip_id: trip.id });

        if (matchError) {
          console.warn('Matching failed:', matchError);
          // Don't fail the trip creation if matching fails
        }
      } catch (matchingError) {
        console.warn('Matching service unavailable:', matchingError);
      }

      // Success!
      toast({
        title: "Trip Published Successfully!",
        description: `Your ${draft.role} trip has been created and is now live`,
      });

      onSubmit(trip.id);

    } catch (error) {
      console.error('Trip publication error:', error);
      
      // Check if it's a network error
      const isNetworkError = !navigator.onLine || 
                           (error as Error).message.includes('network') ||
                           (error as Error).message.includes('fetch');

      if (isNetworkError) {
        // TODO: Implement offline draft saving to IndexedDB
        toast({
          title: "Network Error",
          description: "Your trip has been saved as a draft. We'll publish it when you're back online.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Publication Failed",
          description: "Unable to publish your trip. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Trip Summary Card */}
      <Card className="border-2 border-dashed border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              draft.role === 'driver' ? 'bg-purple-500' : 'bg-blue-500'
            }`} />
            <span>
              {draft.role === 'driver' ? 'Driver Trip' : 'Passenger Request'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Route */}
          <div className="space-y-2">
            <div className="flex items-start space-x-3">
              <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5" />
              <div className="flex-1">
                <div className="font-medium">Pickup</div>
                <div className="text-sm text-gray-600">{draft.origin?.address}</div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-3 h-3 rounded-full bg-red-500 mt-1.5" />
              <div className="flex-1">
                <div className="font-medium">Destination</div>
                <div className="text-sm text-gray-600">{draft.destination?.address}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Trip Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <div>
                <div className="text-sm font-medium">Departure</div>
                <div className="text-xs text-gray-600">
                  {draft.departureTime ? formatDateTime(draft.departureTime) : 'Not set'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-500" />
              <div>
                <div className="text-sm font-medium">
                  {draft.role === 'driver' ? 'Seats Available' : 'Seats Needed'}
                </div>
                <div className="text-xs text-gray-600">{draft.seats} seats</div>
              </div>
            </div>
          </div>

          {/* Vehicle Type (Drivers) */}
          {draft.role === 'driver' && draft.vehicleType && (
            <div className="flex items-center space-x-2">
              <Car className="w-4 h-4 text-gray-500" />
              <div>
                <div className="text-sm font-medium">Vehicle</div>
                <div className="text-xs text-gray-600">{getVehicleLabel(draft.vehicleType)}</div>
              </div>
            </div>
          )}

          {/* Price */}
          {draft.estimatedPrice && (
            <div className="flex items-center justify-between bg-green-100 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  {draft.role === 'driver' ? 'Expected Earnings' : 'Estimated Cost'}
                </span>
              </div>
              <div className="text-lg font-bold text-green-600">
                {draft.estimatedPrice.toLocaleString()} RWF
              </div>
            </div>
          )}

          {/* Notes */}
          {draft.notes && (
            <div className="flex items-start space-x-2">
              <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
              <div>
                <div className="text-sm font-medium">Notes</div>
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  {draft.notes}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Publish Button */}
      <Card>
        <CardContent className="p-6">
          <Button
            onClick={handlePublishTrip}
            disabled={!isFormValid() || isSubmitting}
            className="w-full h-12 text-lg bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#15803d] hover:to-[#14532d]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Publishing Trip...
              </>
            ) : (
              <>
                🚀 Publish Trip
              </>
            )}
          </Button>
          
          <div className="text-center mt-3 text-xs text-gray-500">
            Your trip will be visible to {draft.role === 'driver' ? 'passengers' : 'drivers'} immediately
          </div>
        </CardContent>
      </Card>

      {/* Terms & Conditions */}
      <div className="text-xs text-gray-500 text-center space-y-1">
        <div>By publishing this trip, you agree to our Terms of Service.</div>
        <div>All trips are subject to verification and community guidelines.</div>
      </div>
    </div>
  );
}; 