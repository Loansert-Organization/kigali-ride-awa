
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Car, 
  MapPin,
  Calendar,
  Download,
  Filter
} from 'lucide-react';

const Analytics = () => {
  const metrics = [
    {
      title: 'Total Rides This Month',
      value: '2,847',
      change: '+18.2%',
      trend: 'up',
      icon: Car
    },
    {
      title: 'Active Users',
      value: '1,425',
      change: '+12.5%',
      trend: 'up',
      icon: Users
    },
    {
      title: 'Average Trip Distance',
      value: '8.4 km',
      change: '-2.1%',
      trend: 'down',
      icon: MapPin
    },
    {
      title: 'Booking Success Rate',
      value: '94.2%',
      change: '+3.8%',
      trend: 'up',
      icon: TrendingUp
    }
  ];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Track your ride-sharing performance and insights</p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <Button variant="outline" className="flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" className="flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown;
            const trendColor = metric.trend === 'up' ? 'text-green-600' : 'text-red-600';
            
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className={`flex items-center ${trendColor}`}>
                      <TrendIcon className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">{metric.change}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">
                      {metric.value}
                    </p>
                    <p className="text-sm text-gray-600">{metric.title}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Rides Over Time Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Rides Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Chart visualization coming soon</p>
                  <p className="text-sm text-gray-400">Integration with charting library needed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Popular Routes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Popular Routes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { route: 'Nyabugogo → City Center', rides: 245, percentage: 85 },
                  { route: 'Kimisagara → Remera', rides: 189, percentage: 65 },
                  { route: 'Kicukiro → Nyamirambo', rides: 156, percentage: 54 },
                  { route: 'Gisozi → Downtown', rides: 134, percentage: 46 },
                  { route: 'Kanombe → Kigali Heights', rides: 98, percentage: 34 }
                ].map((route, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {route.route}
                        </span>
                        <span className="text-sm text-gray-600">
                          {route.rides} rides
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${route.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Analytics Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Peak Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Peak Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { time: '7:00 - 9:00 AM', activity: 'High', percentage: 90 },
                  { time: '12:00 - 2:00 PM', activity: 'Medium', percentage: 60 },
                  { time: '5:00 - 7:00 PM', activity: 'High', percentage: 85 },
                  { time: '9:00 - 11:00 PM', activity: 'Low', percentage: 30 }
                ].map((hour, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{hour.time}</p>
                      <p className="text-xs text-gray-600">{hour.activity} Activity</p>
                    </div>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${hour.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Driver Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Top Drivers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Jean Claude', rides: 87, rating: 4.9 },
                  { name: 'Marie Uwimana', rides: 76, rating: 4.8 },
                  { name: 'Patrick Nkusi', rides: 65, rating: 4.7 },
                  { name: 'Grace Mukamana', rides: 58, rating: 4.9 }
                ].map((driver, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-purple-600">
                          {driver.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{driver.name}</p>
                        <p className="text-xs text-gray-600">{driver.rides} rides</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-yellow-600">★</span>
                        <span className="text-sm text-gray-900 ml-1">{driver.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Revenue Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Revenue Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { category: 'Ride Fees', amount: '45,230', percentage: 78 },
                  { category: 'Booking Fees', amount: '8,450', percentage: 15 },
                  { category: 'Cancellation Fees', amount: '2,180', percentage: 4 },
                  { category: 'Other', amount: '1,890', percentage: 3 }
                ].map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {item.category}
                      </span>
                      <span className="text-sm text-gray-600">
                        ₱{item.amount}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Analytics;
