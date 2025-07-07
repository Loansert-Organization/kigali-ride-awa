import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useLocalization } from '@/hooks/useLocalization';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { 
  Users, 
  Car, 
  MapPin, 
  TrendingUp, 
  AlertTriangle,
  Shield,
  BarChart3,
  Clock
} from 'lucide-react';

interface DashboardStats {
  total_users: number;
  weekly_new_users: number;
  total_drivers: number;
  online_drivers: number;
  total_trips: number;
  weekly_trips: number;
  total_bookings: number;
  weekly_bookings: number;
  total_referrals: number;
  weekly_referrals: number;
  total_rewards_issued: number;
}

interface User {
  id: string;
  phone_number: string;
  role: string;
  created_at: string;
  auth_method: string;
}

interface Trip {
  id: string;
  from_location: string;
  to_location: string;
  status: string;
  vehicle_type: string;
  created_at: string;
  users: { phone_number: string };
}

const AdminDashboard = () => {
  const { user, role } = useAuth();
  const { t } = useLocalization();
  const { handleError } = useErrorHandler();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role !== 'admin') return;
    fetchDashboardData();
  }, [role]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard stats
      const { data: statsData, error: statsError } = await supabase
        .from('admin_dashboard_stats_view')
        .select('*')
        .single();

      if (statsError && statsError.code !== 'PGRST116') {
        throw statsError;
      }

      setStats(statsData);

      // Fetch recent users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, phone_number, role, created_at, auth_method')
        .order('created_at', { ascending: false })
        .limit(10);

      if (usersError) throw usersError;
      setRecentUsers(usersData || []);

      // Fetch recent trips
      const { data: tripsData, error: tripsError } = await supabase
        .from('trips')
        .select(`
          id,
          from_location,
          to_location,
          status,
          vehicle_type,
          created_at,
          users!inner(phone_number)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (tripsError) throw tripsError;
      setRecentTrips(tripsData || []);

    } catch (error) {
      handleError(error, { component: 'AdminDashboard', action: 'fetchData' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'matched': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor and manage the Kigali Ride platform</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_users || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{stats?.weekly_new_users || 0} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.online_drivers || 0}</div>
              <p className="text-xs text-muted-foreground">
                of {stats?.total_drivers || 0} total drivers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_trips || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{stats?.weekly_trips || 0} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bookings</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_bookings || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{stats?.weekly_bookings || 0} this week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="trips">Trips</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentUsers.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{user.phone_number || 'Anonymous'}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline">{user.role}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* System Health */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Database</span>
                      <Badge className="bg-green-100 text-green-800">Online</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Edge Functions</span>
                      <Badge className="bg-green-100 text-green-800">Online</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Real-time Updates</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Push Notifications</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Limited</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{user.phone_number || 'Anonymous User'}</p>
                        <p className="text-sm text-gray-500">
                          Joined: {new Date(user.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Auth: {user.auth_method}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{user.role}</Badge>
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trips" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Trips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTrips.map((trip) => (
                    <div key={trip.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">
                            {trip.from_location} → {trip.to_location}
                          </span>
                          <Badge className={getStatusColor(trip.status)}>
                            {trip.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {trip.users?.phone_number || 'Anonymous'} • {trip.vehicle_type} • 
                          {new Date(trip.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Growth Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Weekly User Growth</span>
                      <span className="font-medium">+{stats?.weekly_new_users || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Weekly Trip Growth</span>
                      <span className="font-medium">+{stats?.weekly_trips || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Weekly Booking Growth</span>
                      <span className="font-medium">+{stats?.weekly_bookings || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Referrals</span>
                      <span className="font-medium">{stats?.total_referrals || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Driver Utilization</span>
                      <span className="font-medium">
                        {stats?.total_drivers ? 
                          Math.round((stats.online_drivers / stats.total_drivers) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rewards Issued</span>
                      <span className="font-medium">{stats?.total_rewards_issued || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>System Uptime</span>
                      <span className="font-medium text-green-600">99.9%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="mt-8 flex gap-4">
          <Button onClick={fetchDashboardData} disabled={loading}>
            Refresh Data
          </Button>
          <Button variant="outline">
            Export Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;