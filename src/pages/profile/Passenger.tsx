
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share, Copy, User } from 'lucide-react';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const PassengerProfile = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const handleCopyPromoCode = () => {
    if (userProfile?.promo_code) {
      navigator.clipboard.writeText(userProfile.promo_code);
      toast({
        title: "Copied!",
        description: "Promo code copied to clipboard"
      });
    }
  };

  const handleSharePromoCode = () => {
    if (userProfile?.promo_code) {
      const message = `Join Kigali Ride with my code: ${userProfile.promo_code} and start earning rewards!`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">My Profile</h1>
            <p className="text-sm opacity-90">Manage your account</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {userProfile?.promo_code?.slice(-2) || 'U'}
              </div>
              <div>
                <div className="font-semibold">Passenger</div>
                <div className="text-sm text-gray-600">
                  Member since {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'recently'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Promo Code Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Share className="w-5 h-5 mr-2" />
              Your Referral Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-700 mb-2">
                  {userProfile?.promo_code || 'Loading...'}
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Share this code to earn rewards when friends join!
                </p>
                <div className="flex space-x-2">
                  <Button onClick={handleCopyPromoCode} className="flex-1">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Code
                  </Button>
                  <Button onClick={handleSharePromoCode} variant="outline" className="flex-1">
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/favorites')}
            >
              ⭐ My Favorite Places
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/past-trips')}
            >
              📝 Trip History
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/rewards')}
            >
              🎁 Rewards & Referrals
            </Button>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
            >
              🌍 Language: English
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
            >
              🔔 Notifications
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-red-600"
            >
              🚪 Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation role="passenger" />
    </div>
  );
};

export default PassengerProfile;
