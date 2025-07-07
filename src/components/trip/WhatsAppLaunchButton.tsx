import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, ExternalLink, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/services/APIClient';

interface WhatsAppLaunchButtonProps {
  driverPhone: string;
  passengerName: string;
  tripDetails: {
    fromAddress: string;
    toAddress: string;
    departureTime: string;
  };
  bookingId?: string;
  onLaunched?: () => void;
}

export const WhatsAppLaunchButton = ({
  driverPhone,
  passengerName,
  tripDetails,
  bookingId,
  onLaunched
}: WhatsAppLaunchButtonProps) => {
  const [isLaunching, setIsLaunching] = useState(false);
  const { toast } = useToast();

  const handleLaunchWhatsApp = async () => {
    setIsLaunching(true);

    try {
      // Create WhatsApp message in Kinyarwanda and English
      const message = `🚗 *Kigali Ride - Trip Confirmation*

Muraho! Nitwa ${passengerName}. 

*Trip Details:*
📍 From: ${tripDetails.fromAddress}
📍 To: ${tripDetails.toAddress}  
🕐 Time: ${new Date(tripDetails.departureTime).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })}

${bookingId ? `Booking ID: ${bookingId}` : ''}

Murakoze cyane! / Thank you!`;

    // Call edge function to generate WhatsApp URL
    const response = await apiClient.notifications.sendWhatsAppInvite(
      driverPhone,
      message
    );

    if (response.success && response.data?.whatsapp_url) {
      // Update booking status to indicate WhatsApp was launched
      if (bookingId) {
        try {
          const updateResponse = await apiClient.request('update-booking-whatsapp-status', {
            body: { 
              bookingId, 
              whatsappLaunched: true 
            }
          });
          
          if (!updateResponse.success) {
            console.warn('Failed to update WhatsApp status:', updateResponse.error);
          }
        } catch (updateError) {
          console.warn('Failed to update WhatsApp status:', updateError);
        }
      }

        // Open WhatsApp
        window.open(response.data.whatsapp_url, '_blank');
        
        toast({
          title: "WhatsApp Opened!",
          description: "Continue your conversation with the driver on WhatsApp.",
        });

        onLaunched?.();
      } else {
        throw new Error(response.error || 'Failed to generate WhatsApp link');
      }
    } catch (error) {
      console.error('WhatsApp launch error:', error);
      toast({
        title: "Error",
        description: "Failed to open WhatsApp. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <Button 
      onClick={handleLaunchWhatsApp}
      disabled={isLaunching}
      className="w-full bg-green-600 hover:bg-green-700 text-white"
      size="lg"
    >
      {isLaunching ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Opening WhatsApp...
        </>
      ) : (
        <>
          <MessageCircle className="w-4 h-4 mr-2" />
          Contact Driver on WhatsApp
          <ExternalLink className="w-3 h-3 ml-2" />
        </>
      )}
    </Button>
  );
};