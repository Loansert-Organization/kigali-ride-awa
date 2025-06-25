
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useDriverOnboarding } from "@/hooks/useDriverOnboarding";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const DriverOnboarding = () => {
  const { userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const {
    currentStep,
    setCurrentStep,
    language,
    locationGranted,
    setLocationGranted,
    notificationsGranted,
    setNotificationsGranted,
    vehicleType,
    setVehicleType,
    plateNumber,
    setPlateNumber,
    existingPromo,
    finishOnboarding
  } = useDriverOnboarding();

  useEffect(() => {
    // Redirect if user is not a driver or has completed onboarding
    if (!loading && userProfile) {
      if (userProfile.role !== 'driver') {
        navigate('/');
        return;
      }
      
      if (userProfile.onboarding_completed) {
        navigate('/home/driver');
        return;
      }
    }
  }, [userProfile, loading, navigate]);

  if (loading || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Setting up your driver profile...</p>
        </div>
      </div>
    );
  }

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      finishOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            🚗 Driver Setup
          </h1>
          <p className="text-gray-600">
            Step {currentStep + 1} of 3
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 0 && "Vehicle Information"}
              {currentStep === 1 && "Permissions"}
              {currentStep === 2 && "Final Details"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 0 && (
              <>
                <div>
                  <Label htmlFor="vehicleType">Vehicle Type</Label>
                  <Select value={vehicleType} onValueChange={(value: any) => setVehicleType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="moto">Motorcycle</SelectItem>
                      <SelectItem value="car">Car</SelectItem>
                      <SelectItem value="tuktuk">Tuk Tuk</SelectItem>
                      <SelectItem value="minibus">Minibus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="plateNumber">Plate Number</Label>
                  <Input
                    id="plateNumber"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    placeholder="Enter your vehicle plate number"
                    className="uppercase"
                  />
                </div>
              </>
            )}

            {currentStep === 1 && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Location Access</Label>
                    <p className="text-sm text-gray-600">
                      Required to show your location to passengers
                    </p>
                  </div>
                  <Switch
                    checked={locationGranted}
                    onCheckedChange={setLocationGranted}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-gray-600">
                      Get notified about new ride requests
                    </p>
                  </div>
                  <Switch
                    checked={notificationsGranted}
                    onCheckedChange={setNotificationsGranted}
                  />
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">
                    Ready to Start Driving!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Your driver profile is almost complete.
                  </p>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Vehicle:</strong> {vehicleType} <br />
                      <strong>Plate:</strong> {plateNumber} <br />
                      {existingPromo && (
                        <>
                          <strong>Promo Code:</strong> {existingPromo}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleBack}
                className="flex-1"
              >
                {currentStep === 0 ? 'Back to Role' : 'Previous'}
              </Button>
              
              <Button 
                onClick={handleNext}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={currentStep === 0 && !plateNumber.trim()}
              >
                {currentStep === 2 ? 'Complete Setup' : 'Continue'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DriverOnboarding;
