
import { useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";

export const useDriverActions = () => {
  const navigate = useNavigate();

  const handleQuickStart = async (driverLocation: {lat: number; lng: number} | null) => {
    if (!driverLocation) {
      toast({
        title: "Location needed",
        description: "Please enable location access to start a trip",
        variant: "destructive"
      });
      return;
    }

    navigate('/create-trip', {
      state: {
        quickStart: true,
        currentLocation: driverLocation
      }
    });
  };

  return {
    navigate,
    handleQuickStart
  };
};
