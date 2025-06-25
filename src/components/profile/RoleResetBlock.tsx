
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const RoleResetBlock = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const [isResetting, setIsResetting] = useState(false);

  const handleRoleReset = async () => {
    if (!userProfile) return;

    setIsResetting(true);
    try {
      await updateUserProfile({
        role: null,
        onboarding_completed: false
      });

      toast({
        title: "Role reset successful",
        description: "You can now select a new role. Redirecting to onboarding...",
      });

      // Redirect to home page to start role selection again
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);

    } catch (error) {
      console.error('Error resetting role:', error);
      toast({
        title: "Reset failed",
        description: "Failed to reset your role. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsResetting(false);
    }
  };

  if (!userProfile?.role) return null;

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center text-orange-800">
          <RefreshCw className="w-5 h-5 mr-2" />
          🔄 Change Role
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-orange-700 mb-4">
          Want to switch between being a passenger and driver? You can reset your role and go through onboarding again.
        </p>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full border-orange-300 text-orange-700 hover:bg-orange-100"
              disabled={isResetting}
            >
              {isResetting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset My Role
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                Reset Your Role?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will reset your role and onboarding status. You'll be redirected to select a new role.
                
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Your trip history and referral points will be preserved.
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleRoleReset}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Reset Role
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default RoleResetBlock;
