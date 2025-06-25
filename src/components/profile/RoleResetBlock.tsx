
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface RoleResetBlockProps {
  currentRole: string;
}

const RoleResetBlock: React.FC<RoleResetBlockProps> = ({ currentRole }) => {
  const navigate = useNavigate();
  const [isResetting, setIsResetting] = useState(false);

  const handleRoleReset = async () => {
    setIsResetting(true);
    
    try {
      // Clear role-specific data from localStorage
      localStorage.removeItem('onboarding_completed');
      localStorage.removeItem('user_role');
      
      toast({
        title: "Role reset successful",
        description: "You'll now select a new role and restart setup",
      });

      // Navigate to role selection
      setTimeout(() => {
        navigate('/', { replace: true });
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('Error resetting role:', error);
      toast({
        title: "Reset failed",
        description: "There was an error resetting your role. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">🔄 Account Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800 mb-3">
              <strong>Switch Role:</strong> Currently set as {currentRole === 'driver' ? '🚗 Driver' : '🧍 Passenger'}
            </p>
            <p className="text-xs text-orange-700 mb-3">
              Changing your role will clear your current app data and restart the setup process.
            </p>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Switch Role
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Switch Role?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will clear your current app data and restart the setup process. 
                    You'll be able to choose between Driver or Passenger again.
                    
                    Are you sure you want to continue?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRoleReset} disabled={isResetting}>
                    {isResetting ? 'Resetting...' : 'Yes, Switch Role'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleResetBlock;
