import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/ui/page-header';
import { Settings as SettingsIcon, Globe, Bell, Shield, Smartphone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/services/APIClient';

const Settings = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const { t, language, changeLanguage, availableLanguages } = useLocalization();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [whatsappIntegration, setWhatsappIntegration] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appConfig, setAppConfig] = useState<any>(null);

  useEffect(() => {
    loadAppConfig();
    loadUserPreferences();
  }, []);

  const loadAppConfig = async () => {
    try {
      const response = await apiClient.config.getAppConfig();
      if (response.success) {
        setAppConfig(response.data);
        setWhatsappIntegration(response.data?.whatsappEnabled || false);
      }
    } catch (error) {
      console.error('Failed to load app config:', error);
    }
  };

  const loadUserPreferences = () => {
    const storedNotifications = localStorage.getItem('notifications_enabled');
    const storedLocation = localStorage.getItem('location_enabled');
    
    if (storedNotifications !== null) {
      setNotifications(JSON.parse(storedNotifications));
    }
    if (storedLocation !== null) {
      setLocationSharing(JSON.parse(storedLocation));
    }
  };

  const handleLanguageChange = async (newLanguage: string) => {
    setLoading(true);
    try {
      changeLanguage(newLanguage as any);
      
      // Update user profile if authenticated
      if (user && !user.id.startsWith('local-')) {
        await apiClient.user.createOrUpdateProfile({
          language: newLanguage
        });
      }
      
      toast({
        title: t('success'),
        description: t('language_updated'),
      });
    } catch (error) {
      console.error('Failed to update language:', error);
      toast({
        title: t('error'),
        description: t('failed_update_language'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    setNotifications(enabled);
    localStorage.setItem('notifications_enabled', JSON.stringify(enabled));
    
    if (enabled && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          toast({
            title: t('permission_denied'),
            description: t('enable_notifications_manually'),
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Failed to request notification permission:', error);
      }
    }
    
    toast({
      title: t('success'),
      description: enabled ? t('notifications_enabled_msg') : t('notifications_disabled_msg'),
    });
  };

  const handleLocationToggle = (enabled: boolean) => {
    setLocationSharing(enabled);
    localStorage.setItem('location_enabled', JSON.stringify(enabled));
    
    toast({
      title: t('success'),
      description: enabled ? t('location_sharing_enabled') : t('location_sharing_disabled'),
    });
  };

  const handleWhatsAppSetup = async () => {
    // Redirect to WhatsApp OAuth setup
    navigate('/auth/whatsapp');
  };

  const handleDeleteAccount = () => {
    navigate('/settings/delete-account');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title={t('settings')} 
        showBack={true} 
        showHome={true}
      />
      
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              {t('language_settings')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('select_language')}</Label>
              <Select value={language} onValueChange={handleLanguageChange} disabled={loading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              {t('notification_settings')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">{t('push_notifications')}</Label>
                <p className="text-sm text-gray-500">{t('receive_trip_updates')}</p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={handleNotificationToggle}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {t('privacy_settings')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">{t('location_sharing')}</Label>
                <p className="text-sm text-gray-500">{t('share_location_for_rides')}</p>
              </div>
              <Switch
                checked={locationSharing}
                onCheckedChange={handleLocationToggle}
              />
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              {t('whatsapp_integration')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-0.5">
              <Label className="text-base">{t('whatsapp_status')}</Label>
              <p className="text-sm text-gray-500">
                {whatsappIntegration ? t('whatsapp_connected') : t('whatsapp_not_connected')}
              </p>
            </div>
            <Button 
              variant={whatsappIntegration ? "outline" : "default"}
              onClick={handleWhatsAppSetup}
              className="w-full"
            >
              {whatsappIntegration ? t('manage_whatsapp') : t('connect_whatsapp')}
            </Button>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              {t('account_settings')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/profile')}
              className="w-full"
            >
              {t('edit_profile')}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/notifications')}
              className="w-full"
            >
              {t('notification_center')}
            </Button>
            
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount}
              className="w-full"
            >
              {t('delete_account')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;