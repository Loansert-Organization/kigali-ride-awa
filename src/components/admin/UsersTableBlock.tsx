
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Ban, Flag, User } from 'lucide-react';

interface User {
  id: string;
  name: string;
  phone: string;
  role: 'driver' | 'passenger' | 'admin';
  tripsCount: number;
  lastSeen: string;
  status: 'active' | 'banned' | 'flagged';
  dateJoined: string;
}

interface UsersTableBlockProps {
  users: User[];
  isLoading: boolean;
  onUserAction: (action: string, user: User) => void;
}

export const UsersTableBlock: React.FC<UsersTableBlockProps> = ({
  users,
  isLoading,
  onUserAction
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'banned':
        return <Badge variant="destructive">Banned</Badge>;
      case 'flagged':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Flagged</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'driver':
        return <Badge variant="default">Driver</Badge>;
      case 'passenger':
        return <Badge variant="secondary">Passenger</Badge>;
      case 'admin':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Admin</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border p-8">
        <div className="text-center text-gray-500">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="p-6 border-b">
        <div className="flex items-center space-x-2">
          <User className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Trips</TableHead>
            <TableHead>Last Seen</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div>
                  <div className="font-medium text-gray-900">
                    {user.name || 'Anonymous User'}
                  </div>
                  <div className="text-sm text-gray-500">{user.phone}</div>
                  <div className="text-xs text-gray-400">
                    Joined: {new Date(user.dateJoined).toLocaleDateString()}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {getRoleBadge(user.role)}
              </TableCell>
              <TableCell>
                <span className="font-medium">{user.tripsCount}</span>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {user.lastSeen === 'today' ? (
                    <span className="text-green-600 font-medium">Today</span>
                  ) : (
                    user.lastSeen
                  )}
                </div>
              </TableCell>
              <TableCell>
                {getStatusBadge(user.status)}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUserAction('view', user)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUserAction('flag', user)}
                    disabled={user.status === 'flagged'}
                  >
                    <Flag className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUserAction('ban', user)}
                    disabled={user.status === 'banned'}
                  >
                    <Ban className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {users.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No users found matching the current filters.
        </div>
      )}
    </div>
  );
};
