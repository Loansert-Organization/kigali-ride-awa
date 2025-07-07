import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PageHeader } from '@/components/ui/page-header';
import { User, Phone, Mail, MapPin, Star, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/services/APIClient';

const Profile = () => {
  const navigate = useNavigate();
  const { user, userProfile, updateUserProfile } = useAuth();
  const { t } = useLocalization();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState({
    totalTrips: 0,
    rating: 0,
    joinDate: '',
    completedTrips: 0
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || '',
        phone_number: userProfile.phone_number || '',
        email: userProfile.email || '',
        address: userProfile.address || '',
      });
    }
    loadUserStats();
  }, [userProfile]);

  const loadUserStats = async () => {
    if (!user) return;
    
    try {
      // Get appropriate trip history based on user role
      const isDriver = userProfile?.role === 'driver';
      const response = isDriver 
        ? await apiClient.trips.getDriverTrips(user.id)
        : await apiClient.trips.getPassengerTrips(user.id);
        
      if (response.success && response.data) {
        const trips = response.data;
        setUserStats({
          totalTrips: trips.length,
          completedTrips: trips.filter(t => t.status === 'completed').length,
          rating: 4.2, // Mock rating for now
          joinDate: userProfile?.created_at || new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Failed to load user stats:', error);
      // Set fallback stats
      setUserStats({
        totalTrips: 0,
        completedTrips: 0,
        rating: 0,
        joinDate: userProfile?.created_at || new Date().toISOString()
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await apiClient.user.createOrUpdateProfile(formData);
      
      if (response.success) {
        // Update local auth context
        updateUserProfile(response.data);
        
        toast({
          title: t('success'),
          description: t('profile_updated_successfully'),
        });
      } else {
        throw new Error(response.error?.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: t('error'),
        description: t('failed_update_profile'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title={t('profile')} 
        showBack={true} 
        showHome={true}
      />
      
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6 text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarImage src="" alt={formData.full_name} />
              <AvatarFallback className="text-xl">
                {getInitials(formData.full_name || 'User')}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold">{formData.full_name || t('anonymous_user')}</h2>
            <p className="text-gray-500">{userProfile?.role === 'driver' ? t('driver') : t('passenger')}</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium">{userStats.rating.toFixed(1)}</span>
              <span className="text-xs text-gray-500">({userStats.completedTrips} {t('trips')})</span>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {t('personal_information')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">{t('full_name')}</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                placeholder={t('enter_full_name')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone_number" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {t('phone_number')}
              </Label>
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                placeholder={t('enter_phone_number')}
                type="tel"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {t('email_optional')}
              </Label>
              <Input
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder={t('enter_email')}
                type="email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {t('address_optional')}
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder={t('enter_address')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>{t('statistics')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{userStats.totalTrips}</div>
                <div className="text-sm text-gray-500">{t('total_trips')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{userStats.completedTrips}</div>
                <div className="text-sm text-gray-500">{t('completed_trips')}</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-sm text-gray-500">{t('member_since')}</div>
                <div className="font-medium">
                  {new Date(userStats.joinDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleSave}
            disabled={loading}
            className="w-full h-12"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('saving')}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {t('save_changes')}
              </>
            )}
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/settings')}
            className="w-full h-12"
          >
            {t('settings')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;