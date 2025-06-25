
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const RoleSelector = () => {
  const navigate = useNavigate();
  const { userProfile, refreshUserProfile } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  const selectRole = async (role: 'passenger' | 'driver') => {
    if (!userProfile) {
      toast({
        title: "Error",
        description: "Please wait for your profile to load.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Selecting role:', role, 'for user:', userProfile.id);
      
      const { error } = await supabase
        .from('users')
        .update({ 
          role: role,
          updated_at: new Date().toISOString()
        })
        .eq('id', userProfile.id);

      if (error) {
        console.error('Error updating user role:', error);
        toast({
          title: "Error",
          description: "Failed to save your role. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Role updated successfully');
      
      // Refresh the user profile to get the updated data
      await refreshUserProfile();
      
      // Navigate to appropriate onboarding
      if (role === 'passenger') {
        navigate('/onboarding/passenger');
      } else {
        navigate('/onboarding/driver');
      }
      
      toast({
        title: "Role Selected",
        description: `Welcome as a ${role}! Let's complete your setup.`,
      });
    } catch (error) {
      console.error('Error in selectRole:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-md">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold text-center mb-6">
          Choose your role
        </h2>
        
        <div className="space-y-4">
          <Button 
            onClick={() => selectRole('passenger')}
            disabled={isLoading}
            className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-3"
          >
            <User className="w-6 h-6" />
            <div className="text-left">
              <div className="font-semibold">I'm a Passenger</div>
              <div className="text-sm opacity-90">Book rides across Kigali</div>
            </div>
          </Button>
          
          <Button 
            onClick={() => selectRole('driver')}
            disabled={isLoading}
            className="w-full h-16 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-3"
          >
            <Car className="w-6 h-6" />
            <div className="text-left">
              <div className="font-semibold">I'm a Driver</div>
              <div className="text-sm opacity-90">Offer rides and earn money</div>
            </div>
          </Button>
        </div>
        
        <p className="text-sm text-gray-500 text-center mt-4">
          You can change this later in your profile settings
        </p>
      </CardContent>
    </Card>
  );
};

export { RoleSelector };
