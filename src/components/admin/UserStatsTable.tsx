
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Flag, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';

interface UserData {
  id: string;
  name: string;
  phone: string;
  role: 'driver' | 'passenger';
  dateJoined: string;
  tripsCount: number;
  lastSeen: string;
  status: 'active' | 'inactive';
}

interface UserStatsTableProps {
  data?: UserData[];
}

export const UserStatsTable: React.FC<UserStatsTableProps> = ({ data = [] }) => {
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const navigate = useNavigate();

  const filteredData = data.filter(user => {
    const roleMatch = roleFilter === 'all' || user.role === roleFilter;
    
    let timeMatch = true;
    if (timeFilter === '7days') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      timeMatch = new Date(user.dateJoined) >= weekAgo;
    } else if (timeFilter === '30days') {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      timeMatch = new Date(user.dateJoined) >= monthAgo;
    }
    
    return roleMatch && timeMatch;
  });

  const handleViewUser = (userId: string) => {
    navigate(`/admin/user-details?id=${userId}`);
  };

  const handleFlagUser = (userId: string) => {
    console.log('Flag user:', userId);
    // TODO: Implement flag user modal
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>
        
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="driver">Driver</SelectItem>
            <SelectItem value="passenger">Passenger</SelectItem>
          </SelectContent>
        </Select>

        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-sm text-gray-500">
          {filteredData.length} users found
        </span>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Trips</TableHead>
              <TableHead>Last Seen</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <div className="font-medium text-gray-900">
                      {user.name || 'Anonymous User'}
                    </div>
                    <div className="text-sm text-gray-500">{user.phone}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === 'driver' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {new Date(user.dateJoined).toLocaleDateString()}
                  </div>
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
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewUser(user.id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFlagUser(user.id)}
                    >
                      <Flag className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No users found matching the current filters.
          </div>
        )}
      </div>
    </div>
  );
};
