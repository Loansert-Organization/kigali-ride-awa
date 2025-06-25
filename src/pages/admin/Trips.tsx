
import React, { useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { TripSearchBlock } from '@/components/admin/TripSearchBlock';
import { TripsTableBlock } from '@/components/admin/TripsTableBlock';
import { TripDetailModal } from '@/components/admin/TripDetailModal';
import { TripConfirmationDialog } from '@/components/admin/TripConfirmationDialog';
import { TripMapView } from '@/components/admin/TripMapView';
import { useAdminTrips } from '@/hooks/useAdminTrips';
import { Button } from '@/components/ui/button';
import { Map, Table } from 'lucide-react';

const AdminTrips = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [fareMinFilter, setFareMinFilter] = useState('');
  const [fareMaxFilter, setFareMaxFilter] = useState('');
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [viewMode, setViewMode] = useState<'table' | 'map'>('table');

  const { data, isLoading, error } = useAdminTrips({ 
    refreshTrigger, 
    searchQuery, 
    roleFilter, 
    statusFilter,
    dateFromFilter,
    dateToFilter,
    fareMinFilter,
    fareMaxFilter
  });

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleTripAction = (action, trip) => {
    if (['cancel', 'flag', 'force-match'].includes(action)) {
      setConfirmAction({ action, trip });
    } else if (action === 'view') {
      setSelectedTrip(trip);
    }
  };

  const handleConfirmAction = async () => {
    // TODO: Implement action confirmation via Edge Functions
    console.log('Confirming action:', confirmAction);
    setConfirmAction(null);
    handleRefresh();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader onRefresh={handleRefresh} />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-red-600">
            Error loading trips: {error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader onRefresh={handleRefresh} />
      
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">🚖 Trip Management</h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              {data?.trips?.length || 0} trips found
            </div>
            <div className="flex bg-white rounded-lg border">
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="rounded-r-none"
              >
                <Table className="w-4 h-4 mr-2" />
                Table
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('map')}
                className="rounded-l-none"
              >
                <Map className="w-4 h-4 mr-2" />
                Map
              </Button>
            </div>
          </div>
        </div>

        <TripSearchBlock
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          dateFromFilter={dateFromFilter}
          onDateFromFilterChange={setDateFromFilter}
          dateToFilter={dateToFilter}
          onDateToFilterChange={setDateToFilter}
          fareMinFilter={fareMinFilter}
          onFareMinFilterChange={setFareMinFilter}
          fareMaxFilter={fareMaxFilter}
          onFareMaxFilterChange={setFareMaxFilter}
        />

        {viewMode === 'table' ? (
          <TripsTableBlock
            trips={data?.trips || []}
            isLoading={isLoading}
            onTripAction={handleTripAction}
          />
        ) : (
          <TripMapView
            trips={data?.trips || []}
            isLoading={isLoading}
            onTripAction={handleTripAction}
          />
        )}

        {selectedTrip && (
          <TripDetailModal
            trip={selectedTrip}
            isOpen={!!selectedTrip}
            onClose={() => setSelectedTrip(null)}
            onRefresh={handleRefresh}
          />
        )}

        {confirmAction && (
          <TripConfirmationDialog
            action={confirmAction.action}
            trip={confirmAction.trip}
            isOpen={!!confirmAction}
            onClose={() => setConfirmAction(null)}
            onConfirm={handleConfirmAction}
          />
        )}
      </div>
    </div>
  );
};

export default AdminTrips;
