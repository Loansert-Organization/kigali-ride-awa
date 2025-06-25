
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingUp, Calendar, Users, Car } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { supabase } from "@/integrations/supabase/client";
import TripMapView from '@/components/maps/TripMapView';

const TripHeatmap = () => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('today');
  const [roleFilter, setRoleFilter] = useState('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stats, setStats] = useState({
    totalTrips: 0,
    passengerTrips: 0,
    driverTrips: 0,
    hotspots: []
  });

  useEffect(() => {
    loadHeatmapData();
  }, [refreshTrigger, timeFilter, roleFilter]);

  const loadHeatmapData = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('trip_heatmap_logs')
        .select('*');

      // Apply time filter
      if (timeFilter === 'today') {
        const today = new Date().toISOString().split('T')[0];
        query = query.gte('created_at', today);
      } else if (timeFilter === 'week') {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('created_at', weekAgo);
      } else if (timeFilter === 'month') {
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('created_at', monthAgo);
      }

      // Apply role filter
      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter);
      }

      const { data } = await query.order('created_at', { ascending: false });

      setHeatmapData(data || []);

      // Calculate stats
      const totalTrips = data?.length || 0;
      const passengerTrips = data?.filter(d => d.role === 'passenger').length || 0;
      const driverTrips = data?.filter(d => d.role === 'driver').length || 0;

      // Calculate hotspots (simplified)
      const hotspots = data?.reduce((acc: any[], curr) => {
        const existingHotspot = acc.find(h => 
          Math.abs(h.lat - curr.lat) < 0.01 && Math.abs(h.lng - curr.lng) < 0.01
        );
        
        if (existingHotspot) {
          existingHotspot.count++;
        } else {
          acc.push({ lat: curr.lat, lng: curr.lng, count: 1 });
        }
        
        return acc;
      }, []).sort((a, b) => b.count - a.count).slice(0, 5) || [];

      setStats({ totalTrips, passengerTrips, driverTrips, hotspots });
    } catch (error) {
      console.error('Error loading heatmap data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader onRefresh={handleRefresh} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🗺️ Trip Heatmap</h1>
          <div className="flex items-center space-x-4">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="passenger">Passengers</SelectItem>
                <SelectItem value="driver">Drivers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Trips</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTrips}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Passenger Trips</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.passengerTrips}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Driver Trips</p>
                  <p className="text-2xl font-bold text-green-600">{stats.driverTrips}</p>
                </div>
                <Car className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hotspots</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.hotspots.length}</p>
                </div>
                <MapPin className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Heatmap */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Trip Activity Heatmap</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="h-96 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading heatmap...</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-96 bg-gray-100 rounded-b-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <MapPin className="w-12 h-12 mx-auto mb-4" />
                      <p className="font-medium">Interactive Heatmap</p>
                      <p className="text-sm">Showing {heatmapData.length} trip origins</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Hotspots */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Top Hotspots</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.hotspots.map((hotspot, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-orange-600">#{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {hotspot.lat.toFixed(4)}, {hotspot.lng.toFixed(4)}
                          </div>
                          <div className="text-xs text-gray-500">Coordinate</div>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {hotspot.count} trips
                      </Badge>
                    </div>
                  ))}
                  
                  {stats.hotspots.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <MapPin className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">No hotspots found for selected filters</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripHeatmap;
