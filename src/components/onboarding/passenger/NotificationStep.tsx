
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bell } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface NotificationStepProps {
  onNext: () => void;
  onNotificationsGranted: (granted: boolean) => void;
  t: any;
}

const NotificationStep: React.FC<NotificationStepProps> = ({
  onNext,
  onNotificationsGranted,
  t
}) => {
  const requestNotifications = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        onNotificationsGranted(true);
        localStorage.setItem('notifications_granted', 'true');
        toast({
          title: t.notificationsEnabled,
          description: t.notificationsSuccess,
        });
      } else {
        toast({
          title: t.notificationsDenied,
          description: t.notificationsDeniedDesc,
          variant: "destructive"
        });
      }
      setTimeout(() => onNext(), 500);
    } catch (error) {
      toast({
        title: t.notificationsDenied,
        description: t.notificationsDeniedDesc,
        variant: "destructive"
      });
      setTimeout(() => onNext(), 1000);
    }
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm animate-fade-in">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold">{t.enableNotifications}</h2>
          <p className="text-gray-600 mt-2">{t.notificationDesc}</p>
          <p className="text-sm text-gray-500 mt-1">{t.notificationFallback}</p>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={requestNotifications} 
            className="w-full bg-blue-600 hover:bg-blue-700 py-3"
          >
            <Bell className="w-5 h-5 mr-2" />
            {t.enableNotifications}
          </Button>
          <Button 
            variant="outline" 
            onClick={onNext} 
            className="w-full"
          >
            Skip for now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationStep;
