
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, User, Gift, LogOut, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/contexts/AuthContext';
import { WhatsAppLoginModal } from '@/components/auth/WhatsAppLoginModal';
import { useAuthGuard } from '@/hooks/useAuthGuard';

const Profile = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userProfile, logout, isGuest } = useAuth();
  const { requireAuth, showLoginModal, setShowLoginModal, handleLoginSuccess } = useAuthGuard();

  const handleLoginRequired = () => {
    requireAuth(() => {
      // User is now authenticated, the component will re-render
    });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (isGuest) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b p-4">
          <div className="flex items-center max-w-md mx-auto">
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

        <div className="p-4 max-w-md mx-auto">
          <Card className="text-center">
            <CardContent className="p-8">
              <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Guest User</h2>
              <p className="text-gray-600 mb-6">
                Verify your WhatsApp to access your profile, booking history, and rewards.
              </p>
              <Button 
                onClick={handleLoginRequired}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Verify WhatsApp Number
              </Button>
            </CardContent>
          </Card>
        </div>

        <WhatsAppLoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => handleLoginSuccess()}
          title="Verify Your WhatsApp"
          description="Connect your WhatsApp to access your profile and booking history"
        />
      </div>
    );
  }

  if (!userProfile) {
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
        <div className="flex items-center max-w-md mx-auto">
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

      <div className="p-4 max-w-md mx-auto space-y-4">
        {/* User Info Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-purple-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{userProfile.promo_code}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline">
                    {userProfile.role || 'User'}
                  </Badge>
                  <span className="text-sm text-green-600 flex items-center">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    WhatsApp Verified
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {userProfile.phone_number}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">Trips Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Referral Points</div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gift className="w-5 h-5 mr-2" />
              Your Referral Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {userProfile.promo_code}
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Share this code with friends to earn points
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(userProfile.promo_code);
                  }}
                >
                  Copy Code
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings & Actions */}
        <div className="space-y-3">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <Settings className="w-5 h-5 mr-3 text-gray-600" />
                <span>Settings & Preferences</span>
              </div>
              <span className="text-gray-400">→</span>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/leaderboard')}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <Gift className="w-5 h-5 mr-3 text-purple-600" />
                <span>Rewards & Leaderboard</span>
              </div>
              <span className="text-gray-400">→</span>
            </CardContent>
          </Card>
        </div>

        {/* Logout */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full text-red-600 border-red-200 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>

        {/* App Info */}
        <div className="text-center text-xs text-gray-500 pt-4">
          <p>Kigali Ride v1.0 • WhatsApp-Secured</p>
          <p>🇷🇼 Made with ❤️ for Kigali</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
