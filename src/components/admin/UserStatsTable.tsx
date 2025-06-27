
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface UserStats {
  id: string;
  name: string;
  email: string;
  role: 'passenger' | 'driver';
  trips: number;
  joinDate: string;
  status: 'active' | 'inactive';
}

const mockUserStats: UserStats[] = [
  {
    id: 'user-001',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'driver',
    trips: 25,
    joinDate: '2024-01-10',
    status: 'active'
  },
  {
    id: 'user-002',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'passenger',
    trips: 12,
    joinDate: '2024-01-12',
    status: 'active'
  }
];

const UserStatsTable: React.FC = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'driver': return 'bg-blue-100 text-blue-800';
      case 'passenger': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Users</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">User ID</th>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">Role</th>
                <th className="text-left p-2">Trips</th>
                <th className="text-left p-2">Join Date</th>
                <th className="text-left p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockUserStats.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-mono text-sm">{user.id}</td>
                  <td className="p-2">{user.name}</td>
                  <td className="p-2">{user.email}</td>
                  <td className="p-2">
                    <Badge className={getRoleColor(user.role)}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="p-2">{user.trips}</td>
                  <td className="p-2">{user.joinDate}</td>
                  <td className="p-2">
                    <Badge className={getStatusColor(user.status)}>
                      {user.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserStatsTable;
