
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Car, 
  TrendingUp, 
  MapPin, 
  Calendar,
  Bell,
  Plus,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { userProfile, isAuthenticated } = useAuth();

  const quickStats = [
    {
      title: 'Total Rides',
      value: '1,234',
      change: '+12%',
      icon: Car,
      color: 'text-blue-600'
    },
    {
      title: 'Active Drivers',
      value: '89',
      change: '+8%',
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Revenue',
      value: '₱45,678',
      change: '+15%',
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      title: 'Locations',
      value: '12',
      change: '+2',
      icon: MapPin,
      color: 'text-orange-600'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'ride_completed',
      message: 'Ride from Nyabugogo to City Center completed',
      time: '2 minutes ago',
      icon: Car
    },
    {
      id: 2,
      type: 'driver_joined',
      message: 'New driver John Doe joined the platform',
      time: '15 minutes ago',
      icon: Users
    },
    {
      id: 3,
      type: 'booking_made',
      message: 'New booking request from Kimisagara',
      time: '1 hour ago',
      icon: Calendar
    }
  ];

  const quickActions = [
    {
      title: 'Book a Ride',
      description: 'Find a ride to your destination',
      action: () => navigate('/book-ride'),
      icon: Car,
      color: 'bg-blue-500'
    },
    {
      title: 'Create Trip',
      description: 'Post where you\'re going',
      action: () => navigate('/create-trip'),
      icon: Plus,
      color: 'bg-green-500'
    },
    {
      title: 'View Analytics',
      description: 'Check your ride statistics',
      action: () => navigate('/analytics'),
      icon: TrendingUp,
      color: 'bg-purple-500'
    }
  ];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back{isAuthenticated && userProfile ? `, ${userProfile.promo_code}` : ''}! 👋
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your rides today.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg bg-gray-100 ${stat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium text-green-600">
                      {stat.change}
                    </span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <Card 
                        key={index}
                        className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-purple-200"
                        onClick={action.action}
                      >
                        <CardContent className="p-4 text-center">
                          <div className={`w-12 h-12 ${action.color} rounded-lg mx-auto mb-3 flex items-center justify-center`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {action.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {action.description}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Recent Activity
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/notifications')}
                >
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          {activity.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
