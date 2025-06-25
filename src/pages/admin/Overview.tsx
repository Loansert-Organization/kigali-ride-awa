
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminHeader } from '@/components/admin/AdminHeader';
import { KPIStatsCards } from '@/components/admin/KPIStatsCards';
import { UsersTableBlock } from '@/components/admin/UsersTableBlock';
import { TripsTableBlock } from '@/components/admin/TripsTableBlock';
import { AIAgentLogsTable } from '@/components/admin/AIAgentLogsTable';
import SchemaAuditReport from '@/components/admin/SchemaAuditReport';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';

export default function Overview() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { data, isLoading, error, refetch } = useAdminDashboard(refreshTrigger);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    refetch();
  };

  const handleUserAction = (action: string, user: any) => {
    console.log('User action:', action, user);
    // TODO: Implement user actions (view, ban, flag, etc.)
  };

  const handleTripAction = (action: string, trip: any) => {
    console.log('Trip action:', action, trip);
    // TODO: Implement trip actions (view, cancel, flag, etc.)
  };

  useEffect(() => {
    if (error) {
      console.error('Error loading admin dashboard:', error);
    }
  }, [error]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <AdminHeader onRefresh={handleRefresh} />
      
      <Tabs defaultValue="kpis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="kpis">📊 KPIs</TabsTrigger>
          <TabsTrigger value="users">👥 Users</TabsTrigger>
          <TabsTrigger value="trips">🚗 Trips</TabsTrigger>
          <TabsTrigger value="schema">🔍 Schema Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="kpis" className="space-y-6">
          {/* KPIs Section */}
          <KPIStatsCards data={data?.kpis} />
          
          {/* AI Agent Logs */}
          <AIAgentLogsTable />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UsersTableBlock 
            users={data?.users || []} 
            isLoading={isLoading}
            onUserAction={handleUserAction}
          />
        </TabsContent>

        <TabsContent value="trips" className="space-y-6">
          <TripsTableBlock 
            trips={data?.trips || []} 
            isLoading={isLoading}
            onTripAction={handleTripAction}
          />
        </TabsContent>

        <TabsContent value="schema" className="space-y-6">
          <SchemaAuditReport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
