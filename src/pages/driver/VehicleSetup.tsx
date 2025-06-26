
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Car } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UnifiedWhatsAppOTP } from "@/components/auth/UnifiedWhatsAppOTP";
import { useAuth } from "@/contexts/AuthContext";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";

const VehicleSetup = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userProfile } = useAuth();
  const { isAuthenticated: isWhatsAppAuth, getCurrentUser } = useUnifiedAuth();
  const [vehicleType, setVehicleType] = useState<string>("");
  const [plateNumber, setPlateNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showWhatsAppOTP, setShowWhatsAppOTP] = useState(false);

  const proceedWithVehicleSetup = async () => {
    if (!vehicleType || !plateNumber.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all vehicle details",
        variant: "destructive"
      });
      return;
    }

    // Get user from WhatsApp auth or regular auth
    const whatsappUser = getCurrentUser();
    const currentUser = whatsappUser || userProfile;

    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please verify your WhatsApp number first",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create or update driver profile
      const { error } = await supabase
        .from('driver_profiles')
        .upsert({
          user_id: currentUser.id,
          vehicle_type: vehicleType,
          plate_number: plateNumber.toUpperCase(),
          is_online: false
        });

      if (error) throw error;

      // Update user role to driver if not already set
      if (currentUser.role !== 'driver') {
        const { error: roleError } = await supabase
          .from('users')
          .update({ role: 'driver' })
          .eq('id', currentUser.id);

        if (roleError) throw roleError;
      }

      toast({
        title: "🚗 Vehicle setup complete!",
        description: "You can now start posting trips and earning money"
      });

      navigate('/home/driver');
    } catch (error) {
      console.error('Vehicle setup error:', error);
      toast({
        title: "Setup failed",
        description: "Please try again or contact support",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVehicleSetup = () => {
    // If not authenticated, show WhatsApp login wizard
    if (!isAuthenticated && !isWhatsAppAuth()) {
      setShowWhatsAppOTP(true);
      return;
    }

    // If authenticated, proceed with vehicle setup
    proceedWithVehicleSetup();
  };

  const handleWhatsAppSuccess = () => {
    setShowWhatsAppOTP(false);
    // After successful WhatsApp login, proceed with vehicle setup
    setTimeout(() => {
      proceedWithVehicleSetup();
    }, 500);
  };

  const currentUserAuth = isAuthenticated || isWhatsAppAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center max-w-md mx-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mr-3">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-bold">Vehicle Setup</h1>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <div className="text-center">
            <Car className="w-16 h-16 mx-auto text-purple-600 mb-4" />
            <h2 className="text-lg font-semibold">Add Your Vehicle</h2>
            <p className="text-gray-600 text-sm">
              Set up your vehicle to start posting trips and receiving ride requests
            </p>
          </div>

          {/* Auth Status */}
          {!currentUserAuth && (
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <p className="text-sm text-green-800">
                🚗 Fill in your vehicle details. You'll verify your WhatsApp when saving.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="vehicleType">Vehicle Type</Label>
              <Select value={vehicleType} onValueChange={setVehicleType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="moto">🏍️ Moto</SelectItem>
                  <SelectItem value="car">🚗 Car</SelectItem>
                  <SelectItem value="tuktuk">🛺 Tuktuk</SelectItem>
                  <SelectItem value="minibus">🚐 Minibus</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="plateNumber">Plate Number</Label>
              <Input
                id="plateNumber"
                type="text"
                placeholder="e.g., RAD 123 A"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                className="uppercase"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your vehicle's license plate number
              </p>
            </div>
          </div>

          <Button
            onClick={handleVehicleSetup}
            disabled={isLoading}
            size="lg"
            className="w-full bg-purple-600 hover:bg-purple-700 text-xs"
          >
            {isLoading ? 'Setting up...' : !currentUserAuth ? '📱 Verify WhatsApp & Complete Setup' : '🚗 Complete Vehicle Setup'}
          </Button>

          {!currentUserAuth && (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                You'll need to verify your WhatsApp number to continue
              </p>
            </div>
          )}
        </div>
      </div>

      {/* WhatsApp OTP Flow */}
      {showWhatsAppOTP && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">WhatsApp Verification</h2>
            </div>
            <UnifiedWhatsAppOTP
              onSuccess={handleWhatsAppSuccess}
              onCancel={() => setShowWhatsAppOTP(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleSetup;
