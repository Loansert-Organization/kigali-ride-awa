
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Car, 
  Users, 
  TrendingUp,
  Settings,
  Search,
  Filter,
  MoreVertical,
  Check,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Notifications = () => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'ride_completed',
      title: 'Ride Completed',
      message: 'Your ride from Nyabugogo to City Center has been completed successfully.',
      time: '2 minutes ago',
      read: false,
      icon: Car,
      color: 'text-green-600'
    },
    {
      id: 2,
      type: 'driver_match',
      title: 'Driver Found',
      message: 'Great news! Jean Claude is driving your route and can pick you up.',
      time: '15 minutes ago',
      read: false,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      id: 3,
      type: 'system',
      title: 'Welcome to Kigali Ride!',
      message: 'Thank you for joining our community. Complete your profile to get better matches.',
      time: '1 hour ago',
      read: true,
      icon: Bell,
      color: 'text-purple-600'
    },
    {
      id: 4,
      type: 'promotion',
      title: 'Special Offer',
      message: 'Get 20% off your next 5 rides when you refer a friend!',
      time: '3 hours ago',
      read: true,
      icon: TrendingUp,
      color: 'text-orange-600'
    },
    {
      id: 5,
      type: 'ride_request',
      title: 'New Ride Request',
      message: 'Someone requested a ride on your route from Kimisagara to Remera.',
      time: '1 day ago',
      read: true,
      icon: Car,
      color: 'text-blue-600'
    }
  ]);

  const tabs = [
    { id: 'all', label: 'All', count: notifications.length },
    { id: 'unread', label: 'Unread', count: notifications.filter(n => !n.read).length },
    { id: 'ride', label: 'Rides', count: notifications.filter(n => n.type.includes('ride')).length },
    { id: 'system', label: 'System', count: notifications.filter(n => n.type === 'system').length }
  ];

  const filteredNotifications = notifications.filter(notification => {
    switch (selectedTab) {
      case 'unread':
        return !notification.read;
      case 'ride':
        return notification.type.includes('ride') || notification.type === 'driver_match';
      case 'system':
        return notification.type === 'system' || notification.type === 'promotion';
      default:
        return true;
    }
  });

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
            <p className="text-gray-600">Stay updated with your ride activities</p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <Button variant="outline" size="sm">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="flex border-b">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex-1 px-4 py-3 text-sm font-medium text-center border-b-2 transition-colors ${
                    selectedTab === tab.id
                      ? 'border-purple-500 text-purple-600 bg-purple-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {tab.count}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Bar */}
        {notifications.some(n => !n.read) && (
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">
              {notifications.filter(n => !n.read).length} unread notifications
            </p>
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <Check className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-600">
                  {selectedTab === 'unread' 
                    ? "You're all caught up! No unread notifications."
                    : "You don't have any notifications in this category yet."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <Card 
                  key={notification.id}
                  className={`transition-all hover:shadow-md ${
                    !notification.read ? 'border-l-4 border-l-purple-500 bg-purple-50/30' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg bg-gray-100 ${notification.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-medium ${
                              !notification.read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                              {!notification.read && (
                                <span className="inline-block w-2 h-2 bg-purple-500 rounded-full ml-2" />
                              )}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {notification.time}
                            </p>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {!notification.read && (
                                <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                  <Check className="mr-2 h-4 w-4" />
                                  Mark as read
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => deleteNotification(notification.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Load More Button */}
        {filteredNotifications.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline">
              Load More Notifications
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Notifications;
