
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KPIStatsCards } from "@/components/admin/KPIStatsCards";
import { UserStatsTable } from "@/components/admin/UserStatsTable";
import { TripStatsTable } from "@/components/admin/TripStatsTable";
import { AIAgentLogsTable } from "@/components/admin/AIAgentLogsTable";
import { GlobalAdminSearch } from "@/components/admin/GlobalAdminSearch";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";

const AdminOverview = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { data: dashboardData, isLoading } = useAdminDashboard(refreshTrigger);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader onRefresh={handleRefresh} />

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* KPI Summary Cards */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Platform Overview</h2>
          <KPIStatsCards data={dashboardData?.kpis} />
        </section>

        {/* Global Search */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🔍 Global Search</h2>
          <GlobalAdminSearch />
        </section>

        {/* Main Dashboard Tabs */}
        <section>
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="users">👥 Users</TabsTrigger>
              <TabsTrigger value="trips">🚖 Trips</TabsTrigger>
              <TabsTrigger value="ai-logs">🤖 AI Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Statistics & Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <UserStatsTable data={dashboardData?.users} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trips" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Trip Statistics & Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <TripStatsTable data={dashboardData?.trips} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai-logs" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Agent Activity Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <AIAgentLogsTable data={dashboardData?.aiLogs} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </div>
  );
};

export default AdminOverview;
