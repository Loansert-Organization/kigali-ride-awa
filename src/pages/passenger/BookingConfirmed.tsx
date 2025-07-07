import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { WhatsAppLaunchButton } from '@/components/trip/WhatsAppLaunchButton';
import { CheckCircle, MapPin, Clock, Car, Phone, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/services/APIClient';

interface BookingDetails {
  id: string;
  passengerTrip: {
    from_address: string;
    to_address: string;
    requested_departure_time: string;
  };
  driverTrip: {
    from_address: string;
    to_address: string;
    scheduled_departure_time: string;
    vehicle_type: string;
    fare_per_seat: number;
  };
  driver: {
    phone_number: string;
    name?: string;
  };
  passenger: {
    name?: string;
  };
  status: string;
  created_at: string;
}

const BookingConfirmed = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) {
        navigate('/passenger/home');
        return;
      }

      try {
        // This is a call to get booking details from our edge function
        const response = await apiClient.request(`get-booking-details`, {
          body: { bookingId }
        });

        if (response.success && response.data) {
          setBooking(response.data);
        } else {
          throw new Error(response.error || 'Booking not found');
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
        toast({
          title: "Error",
          description: "Failed to load booking details.",
          variant: "destructive"
        });
        navigate('/passenger/home');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, navigate, toast]);

  const handleWhatsAppLaunched = () => {
    toast({
      title: "WhatsApp Opened",
      description: "Continue coordinating with your driver on WhatsApp. Have a safe trip!",
    });
  };

  const handleBackToHome = () => {
    navigate('/passenger/home');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Booking Not Found" showBack={true} />
        <div className="flex items-center justify-center p-8">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600">Booking details could not be found.</p>
              <Button onClick={handleBackToHome} className="mt-4">
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Booking Confirmed" 
        showBack={true}
        onBack={handleBackToHome}
      />
      
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Success Header */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-green-800 mb-2">
              Booking Confirmed!
            </h2>
            <p className="text-green-700">
              Your ride has been matched with a driver. 
            </p>
            <Badge className="mt-2 bg-green-100 text-green-800">
              Booking #{booking.id.slice(0, 8)}
            </Badge>
          </CardContent>
        </Card>

        {/* Driver Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Your Driver
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{booking.driver.name || 'Driver'}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Car className="w-4 h-4" />
                  <span>{booking.driverTrip.vehicle_type}</span>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="secondary">
                  {booking.driverTrip.fare_per_seat} RWF
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-gray-600" />
              <span className="font-mono">{booking.driver.phone_number}</span>
            </div>
          </CardContent>
        </Card>

        {/* Trip Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Trip Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm text-gray-600">Pickup</p>
                  <p className="font-medium">{booking.passengerTrip.from_address}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm text-gray-600">Destination</p>
                  <p className="font-medium">{booking.passengerTrip.to_address}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Departure Time</p>
                  <p className="font-medium">
                    {new Date(booking.driverTrip.scheduled_departure_time).toLocaleString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Coordination */}
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-center text-green-800">
              Next Step: Coordinate with Driver
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-green-700 text-sm">
              Tap the button below to open WhatsApp and coordinate the exact pickup location and timing with your driver.
            </p>
            
            <WhatsAppLaunchButton
              driverPhone={booking.driver.phone_number}
              passengerName={booking.passenger.name || 'Passenger'}
              tripDetails={{
                fromAddress: booking.passengerTrip.from_address,
                toAddress: booking.passengerTrip.to_address,
                departureTime: booking.driverTrip.scheduled_departure_time
              }}
              bookingId={booking.id}
              onLaunched={handleWhatsAppLaunched}
            />
            
            <p className="text-xs text-center text-gray-600">
              💡 <strong>Tip:</strong> Share your exact location pin and confirm the pickup time with your driver
            </p>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="space-y-2">
          <Button 
            variant="outline" 
            onClick={handleBackToHome}
            className="w-full"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmed;