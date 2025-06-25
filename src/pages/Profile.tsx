
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, User, Settings, Bell, Gift, Copy } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import NotificationSettings from '@/components/settings/NotificationSettings';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: userRecord } = await supabase
          .from('users')
          .select('*')
          .eq('auth_user_id', authUser.id)
          .single();
        
        setUser(userRecord);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleCopyPromoCode = () => {
    if (user?.promo_code) {
      navigator.clipboard.writeText(user.promo_code);
      toast({
        title: "Promo Code Copied!",
        description: "Share it with friends to earn rewards"
      });
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mr-3"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-bold">Profile</h1>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="referrals">
              <Gift className="w-4 h-4 mr-2" />
              Referrals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Role</Label>
                  <div className="p-2 bg-gray-50 rounded capitalize">
                    {user.role || 'Not set'}
                  </div>
                </div>

                <div>
                  <Label>Language</Label>
                  <div className="p-2 bg-gray-50 rounded">
                    {user.language === 'en' ? 'English' : 
                     user.language === 'fr' ? 'Français' : 
                     user.language === 'kn' ? 'Kinyarwanda' : 'English'}
                  </div>
                </div>

                <div>
                  <Label>Member Since</Label>
                  <div className="p-2 bg-gray-50 rounded">
                    {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>

                <Button
                  onClick={handleSignOut}
                  disabled={isLoading}
                  variant="destructive"
                  className="w-full"
                >
                  {isLoading ? 'Signing out...' : 'Sign Out'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationSettings />
          </TabsContent>

          <TabsContent value="referrals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Referral Code</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex-1">
                    <code className="text-lg font-bold text-purple-900">
                      {user.promo_code}
                    </code>
                    <p className="text-sm text-purple-700 mt-1">
                      Share this code with friends to earn rewards
                    </p>
                  </div>
                  <Button onClick={handleCopyPromoCode} size="sm">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How Referrals Work</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-medium">Share Your Code</h4>
                    <p className="text-sm text-gray-600">Give your promo code to friends</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-medium">They Sign Up</h4>
                    <p className="text-sm text-gray-600">Friends use your code when joining</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-medium">Earn Rewards</h4>
                    <p className="text-sm text-gray-600">Get points when they complete rides</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
