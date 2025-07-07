import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PickupInput } from './components/PickupInput';
import { DropoffInput } from './components/DropoffInput';
import { TravelTimeSelector } from './components/TravelTimeSelector';
import { ScheduledDateTime } from './components/ScheduledDateTime';
import { VehicleTypeSelector } from './components/VehicleTypeSelector';
import { TripSummaryCard } from './components/TripSummaryCard';
import { MapLocation } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface TripCreationWizardProps {
  onClose?: () => void;
}

interface TripData {
  pickup?: MapLocation | null;
  dropoff?: MapLocation | null;
  travelTime: 'now' | 'schedule';
  scheduledTime?: Date;
  vehicleType?: string;
}

export const TripCreationWizard = ({ onClose }: TripCreationWizardProps) => {
  const { toast } = useToast();
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  
  const [tripData, setTripData] = useState<TripData>({
    travelTime: 'now'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load draft from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('trip_creation_wizard_draft');
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        setTripData({
          ...draft,
          scheduledTime: draft.scheduledTime ? new Date(draft.scheduledTime) : undefined
        });
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, []);

  // Save draft to localStorage on change
  useEffect(() => {
    localStorage.setItem('trip_creation_wizard_draft', JSON.stringify(tripData));
  }, [tripData]);

  const updateTripData = (updates: Partial<TripData>) => {
    setTripData(prev => ({ ...prev, ...updates }));
  };

  const submitTrip = async () => {
    if (!user) {
      toast({
        title: t('authentication_required'),
        description: t('login_required'),
        variant: "destructive"
      });
      return;
    }

    if (!tripData.pickup || !tripData.dropoff || !tripData.vehicleType) {
      toast({
        title: t('incomplete_trip'),
        description: t('fill_required_fields'),
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const scheduledTime = tripData.travelTime === 'schedule' && tripData.scheduledTime 
        ? tripData.scheduledTime.toISOString()
        : new Date().toISOString();

      const { data, error } = await supabase
        .from('trips_wizard')
        .insert({
          user_id: user.id,
          role: 'passenger',
          origin_text: tripData.pickup.address,
          origin_location: `POINT(${tripData.pickup.lng} ${tripData.pickup.lat})`,
          destination_text: tripData.dropoff.address,
          destination_location: `POINT(${tripData.dropoff.lng} ${tripData.dropoff.lat})`,
          departure_time: scheduledTime,
          vehicle_type: tripData.vehicleType,
          seats: 1,
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Clear the draft
      localStorage.removeItem('trip_creation_wizard_draft');

      toast({
        title: "Trip Created Successfully!",
        description: "Your trip request has been submitted. You'll be notified when drivers respond.",
      });

      // Navigate to matches or trip details
      setTimeout(() => {
        navigate(`/passenger/matches?tripId=${data.id}`);
      }, 2000);

    } catch (error) {
      console.error('Trip submission failed:', error);
      toast({
        title: "Failed to Create Trip",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const minTime = new Date();
  minTime.setMinutes(minTime.getMinutes() + 5); // 5 minutes from now

  return (
    <div className="min-h-screen bg-background">
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold">Book Your Ride</CardTitle>
          <p className="text-muted-foreground">
            Fast, reliable transportation across Kigali
          </p>
        </CardHeader>
        
        <CardContent className="px-4">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-8 pb-6">
              {/* Pickup Location */}
              <PickupInput
                label={t('where_from')}
                placeholder={t('enter_pickup_location')}
                allowCurrentLocation={true}
                onSelect={(location) => updateTripData({ pickup: location })}
                value={tripData.pickup}
              />

              {/* Drop-off Location */}
              <DropoffInput
                label={t('where_to')}
                placeholder={t('enter_dropoff_location')}
                onSelect={(location) => updateTripData({ dropoff: location })}
                value={tripData.dropoff}
                pickupLocation={tripData.pickup}
              />

              {/* Travel Time Selection */}
              <TravelTimeSelector
                label="When do you want to travel?"
                value={tripData.travelTime}
                onChange={(value) => updateTripData({ 
                  travelTime: value,
                  scheduledTime: value === 'now' ? undefined : tripData.scheduledTime
                })}
              />

              {/* Scheduled Date/Time (conditional) */}
              {tripData.travelTime === 'schedule' && (
                <ScheduledDateTime
                  label="Pick travel time"
                  minTime={minTime}
                  maxDaysAhead={7}
                  value={tripData.scheduledTime}
                  onSelect={(date) => updateTripData({ scheduledTime: date })}
                />
              )}

              {/* Vehicle Type Selection */}
              <VehicleTypeSelector
                label={t('choose_vehicle_type')}
                value={tripData.vehicleType}
                onSelect={(vehicleType) => updateTripData({ vehicleType })}
              />

              {/* Trip Summary */}
              <TripSummaryCard
                title={t('confirm_trip')}
                pickup={tripData.pickup}
                dropoff={tripData.dropoff}
                travelTime={tripData.travelTime}
                scheduledTime={tripData.scheduledTime}
                vehicleType={tripData.vehicleType}
                onSubmit={submitTrip}
                isSubmitting={isSubmitting}
              />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};