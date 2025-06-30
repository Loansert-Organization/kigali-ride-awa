import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, User } from "lucide-react";

const RoleSelectPage = () => {
  const navigate = useNavigate();
  const { setRole, loading } = useAuth();

  const choose = async (role: UserRole) => {
    await setRole(role);
    navigate(role === UserRole.DRIVER ? '/driver/home' : '/passenger/home');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <Card className="w-full max-w-md border-purple-200 bg-purple-50">
        <CardContent className="p-6 text-center space-y-6">
          <h2 className="text-2xl font-bold">Welcome 👋</h2>
          <p className="text-gray-600">Choose how you want to use Kigali Ride</p>
          <div className="space-y-4">
            <Button disabled={loading} className="w-full h-14 bg-green-600 hover:bg-green-700" onClick={() => choose(UserRole.DRIVER)}>
              <Car className="w-6 h-6 mr-3" /> Driver / Offer rides
            </Button>
            <Button disabled={loading} className="w-full h-14 bg-blue-600 hover:bg-blue-700" onClick={() => choose(UserRole.PASSENGER)}>
              <User className="w-6 h-6 mr-3" /> Passenger / Book a ride
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { RoleSelectPage }; 