import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { MapLocation } from '@/types';
import { MapPin, Clock, Car, Users, Loader2, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface TripSummaryCardProps {
  title: string;
  pickup?: MapLocation | null;
  dropoff?: MapLocation | null;
  travelTime: 'now' | 'schedule';
  scheduledTime?: Date;
  vehicleType?: string;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
}

const vehicleLabels: Record<string, { icon: string; label: string }> = {
  moto: { icon: "🛵", label: "Moto" },
  car: { icon: "🚗", label: "Car" },
  van: { icon: "🚐", label: "Van" }
};

export const TripSummaryCard = ({ 
  title, 
  pickup, 
  dropoff, 
  travelTime, 
  scheduledTime,
  vehicleType, 
  onSubmit,
  isSubmitting 
}: TripSummaryCardProps) => {
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = async () => {
    try {
      await onSubmit();
      setIsComplete(true);
    } catch (error) {
      console.error('Trip submission failed:', error);
    }
  };

  const canSubmit = pickup && dropoff && vehicleType && 
    (travelTime === 'now' || (travelTime === 'schedule' && scheduledTime));

  const vehicle = vehicleType ? vehicleLabels[vehicleType] : null;

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          {isComplete ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-600" />
              Trip Confirmed!
            </>
          ) : (
            title
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Route Summary */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-medium">From</div>
              <div className="text-sm text-muted-foreground">
                {pickup?.address || 'Select pickup location'}
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-medium">To</div>
              <div className="text-sm text-muted-foreground">
                {dropoff?.address || 'Select drop-off location'}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Trip Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <div className="text-sm font-medium">Travel Time</div>
              <div className="text-sm text-muted-foreground">
                {travelTime === 'now' ? (
                  <Badge variant="outline">🚗 Book Now</Badge>
                ) : scheduledTime ? (
                  <Badge variant="outline">
                    🕓 {format(scheduledTime, "PPP 'at' HH:mm")}
                  </Badge>
                ) : (
                  'Select travel time'
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Car className="w-5 h-5 text-purple-600" />
            <div className="flex-1">
              <div className="text-sm font-medium">Vehicle</div>
              <div className="text-sm text-muted-foreground">
                {vehicle ? (
                  <Badge variant="outline">
                    {vehicle.icon} {vehicle.label}
                  </Badge>
                ) : (
                  'Select vehicle type'
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Submit Button */}
        <Button 
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting || isComplete}
          className="w-full h-12 text-base font-medium"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Creating Trip...
            </>
          ) : isComplete ? (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Trip Created!
            </>
          ) : (
            <>
              ✅ Confirm Trip
            </>
          )}
        </Button>

        {!canSubmit && !isComplete && (
          <div className="text-xs text-muted-foreground text-center">
            Please complete all fields above to continue
          </div>
        )}
      </CardContent>
    </Card>
  );
};