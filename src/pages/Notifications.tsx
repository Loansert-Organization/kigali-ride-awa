import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { Bell, CheckCircle, AlertCircle, Info, X, Trash2, MarkAsRead } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/services/APIClient';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: string;
  actionUrl?: string;
  tripId?: string;
}

const Notifications = () => {
  const { user } = useAuth();
  const { t } = useLocalization();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // Mock notifications - in real app, this would call edge function
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: t('trip_matched'),
          message: t('driver_found_for_trip'),
          type: 'success',
          read: false,
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          tripId: 'trip-123'
        },
        {
          id: '2',
          title: t('payment_reminder'),
          message: t('complete_payment_for_trip'),
          type: 'warning',
          read: false,
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          tripId: 'trip-122'
        },
        {
          id: '3',
          title: t('trip_completed'),
          message: t('trip_completed_successfully'),
          type: 'info',
          read: true,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          tripId: 'trip-121'
        },
        {
          id: '4',
          title: t('welcome_message'),
          message: t('welcome_to_kigali_ride'),
          type: 'info',
          read: true,
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast({
        title: t('error'),
        description: t('failed_load_notifications'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      
      // In real app, would call edge function to mark as read
      // await apiClient.notifications.markAsRead(notificationId);
      
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      
      toast({
        title: t('success'),
        description: t('all_notifications_marked_read'),
      });
      
      // In real app, would call edge function
      // await apiClient.notifications.markAllAsRead();
      
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      setNotifications(prev => 
        prev.filter(n => n.id !== notificationId)
      );
      
      toast({
        title: t('success'),
        description: t('notification_deleted'),
      });
      
      // In real app, would call edge function
      // await apiClient.notifications.delete(notificationId);
      
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      setNotifications([]);
      
      toast({
        title: t('success'),
        description: t('all_notifications_cleared'),
      });
      
      // In real app, would call edge function
      // await apiClient.notifications.clearAll();
      
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ${t('ago')}`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ${t('ago')}`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title={
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            {t('notifications')}
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
        } 
        showBack={true} 
        showHome={true}
      />
      
      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Action Buttons */}
        {notifications.length > 0 && (
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={markAllAsRead}
                className="flex-1"
              >
                <MarkAsRead className="w-4 h-4 mr-2" />
                {t('mark_all_read')}
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearAllNotifications}
              className="flex-1"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t('clear_all')}
            </Button>
          </div>
        )}

        {/* Notifications List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('no_notifications')}</h3>
              <p className="text-gray-500">{t('notifications_appear_here')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`${notification.read ? 'opacity-75' : 'border-l-4 border-l-blue-500'} cursor-pointer hover:shadow-md transition-shadow`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{notification.title}</h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <p className="text-xs text-gray-400">{formatTimestamp(notification.timestamp)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;