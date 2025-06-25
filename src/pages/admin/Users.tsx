
import React, { useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { UserSearchBlock } from '@/components/admin/UserSearchBlock';
import { UsersTableBlock } from '@/components/admin/UsersTableBlock';
import { UserActionModal } from '@/components/admin/UserActionModal';
import { ConfirmationDialog } from '@/components/admin/ConfirmationDialog';
import { useAdminUsers } from '@/hooks/useAdminUsers';

const AdminUsers = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const { data, isLoading, error } = useAdminUsers({ 
    refreshTrigger, 
    searchQuery, 
    roleFilter, 
    statusFilter 
  });

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleUserAction = (action, user) => {
    if (['ban', 'flag', 'reset'].includes(action)) {
      setConfirmAction({ action, user });
    } else if (action === 'view') {
      setSelectedUser(user);
    }
  };

  const handleConfirmAction = async () => {
    // TODO: Implement action confirmation
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
            Error loading users: {error.message}
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
          <h1 className="text-3xl font-bold text-gray-900">👥 User Management</h1>
          <div className="text-sm text-gray-500">
            {data?.users?.length || 0} users found
          </div>
        </div>

        <UserSearchBlock
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        <UsersTableBlock
          users={data?.users || []}
          isLoading={isLoading}
          onUserAction={handleUserAction}
        />

        {selectedUser && (
          <UserActionModal
            user={selectedUser}
            isOpen={!!selectedUser}
            onClose={() => setSelectedUser(null)}
            onRefresh={handleRefresh}
          />
        )}

        {confirmAction && (
          <ConfirmationDialog
            action={confirmAction.action}
            user={confirmAction.user}
            isOpen={!!confirmAction}
            onClose={() => setConfirmAction(null)}
            onConfirm={handleConfirmAction}
          />
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
