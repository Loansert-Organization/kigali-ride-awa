import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TripRole } from './TripWizard';
import { CheckCircle, Share2, MessageCircle, Eye, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SuccessSheetProps {
  tripId: string;
  role: TripRole;
  onClose: () => void;
}

export const SuccessSheet = ({ tripId, role, onClose }: SuccessSheetProps) => {
  const { toast } = useToast();

  const handleShare = () => {
    const tripUrl = `${window.location.origin}/trip/${tripId}`;
    const message = role === 'driver' 
      ? `🚗 I'm offering a ride! Check out my trip: ${tripUrl}`
      : `🚶‍♀️ I need a ride! Check out my request: ${tripUrl}`;

    if (navigator.share) {
      navigator.share({
        title: 'Kigali Ride Trip',
        text: message,
        url: tripUrl
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(message);
        toast({
          title: "Link Copied",
          description: "Trip link copied to clipboard",
        });
      });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(message);
      toast({
        title: "Link Copied", 
        description: "Trip link copied to clipboard",
      });
    } else {
      // Fallback for older browsers
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleViewTrips = () => {
    const path = role === 'driver' ? '/driver/trips' : '/passenger/trips';
    window.location.href = path;
  };

  const handleFindMatches = () => {
    const path = role === 'driver' ? '/driver/requests' : '/passenger/matches';
    window.location.href = path;
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <CardTitle className="text-xl text-green-900">
            🎉 Trip Published Successfully!
          </CardTitle>
          
          <div className="flex justify-center mt-2">
            <Badge 
              variant="secondary" 
              className="bg-green-200 text-green-800"
            >
              {role === 'driver' ? '🚗 Driver Trip' : '🚶‍♀️ Passenger Request'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-center text-sm text-green-800">
            {role === 'driver' 
              ? "Your trip is now live! Passengers can see and book your ride."
              : "Your request is active! Drivers can see and offer you a ride."
            }
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handleShare}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share on WhatsApp
            </Button>

            <Button 
              onClick={handleFindMatches}
              variant="outline"
              className="w-full"
            >
              <Eye className="w-4 h-4 mr-2" />
              {role === 'driver' ? 'View Passenger Requests' : 'Find Available Rides'}
            </Button>

            <Button 
              onClick={handleViewTrips}
              variant="outline"
              className="w-full"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              View My Trips
            </Button>
          </div>

          {/* Next Steps */}
          <div className="bg-white p-4 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-900 mb-2">What's Next?</h4>
            <ul className="text-sm text-green-800 space-y-1">
              {role === 'driver' ? (
                <>
                  <li>• We'll notify you when passengers are interested</li>
                  <li>• Check your messages for trip requests</li>
                  <li>• Keep your phone nearby for updates</li>
                </>
              ) : (
                <>
                  <li>• We're searching for available drivers</li>
                  <li>• You'll get notified when matches are found</li>
                  <li>• Check back soon for ride options</li>
                </>
              )}
            </ul>
          </div>

          {/* Close Button */}
          <Button 
            onClick={onClose}
            variant="ghost"
            className="w-full mt-6"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}; 