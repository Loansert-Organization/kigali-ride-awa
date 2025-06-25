
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { isGuestMode } from '@/utils/authUtils';

interface AppResetButtonBlockProps {
  userProfile: any;
}

const AppResetButtonBlock: React.FC<AppResetButtonBlockProps> = ({ userProfile }) => {
  const navigate = useNavigate();
  const [isResetting, setIsResetting] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const isGuest = isGuestMode(userProfile);

  const handleClearAppData = async () => {
    setIsResetting(true);
    
    try {
      // Clear all localStorage data
      localStorage.clear();
      
      // Clear sessionStorage as well
      sessionStorage.clear();
      
      toast({
        title: "App data cleared",
        description: "All local data has been removed. Restarting app...",
      });

      // Navigate to home and reload
      setTimeout(() => {
        navigate('/', { replace: true });
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('Error clearing app data:', error);
      toast({
        title: "Clear failed",
        description: "There was an error clearing app data.",
        variant: "destructive"
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
      }

      // Clear all local data
      localStorage.clear();
      sessionStorage.clear();
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });

      // Navigate to home
      setTimeout(() => {
        navigate('/', { replace: true });
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Sign out failed",
        description: "There was an error signing out.",
        variant: "destructive"
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">🧰 Tools & Help</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Clear App Data */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full text-orange-600 border-orange-200 hover:bg-orange-50">
              <Trash2 className="w-4 h-4 mr-2" />
              ❌ Clear My App Data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear All App Data?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove all your local app data including:
                • Saved preferences
                • Favorites
                • Local cache
                
                {isGuest && "As a guest user, this will essentially reset your entire experience."}
                
                This action cannot be undone. Are you sure?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearAppData} disabled={isResetting}>
                {isResetting ? 'Clearing...' : 'Yes, Clear Data'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Sign Out */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
              <LogOut className="w-4 h-4 mr-2" />
              🔓 Sign Out {isGuest ? '/ Reset Profile' : ''}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sign Out?</AlertDialogTitle>
              <AlertDialogDescription>
                {isGuest 
                  ? "This will end your guest session and clear all data. You'll start fresh when you return."
                  : "This will sign you out of your account. You can sign back in anytime to access your data."
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSignOut} disabled={isSigningOut}>
                {isSigningOut ? 'Signing Out...' : 'Sign Out'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default AppResetButtonBlock;
