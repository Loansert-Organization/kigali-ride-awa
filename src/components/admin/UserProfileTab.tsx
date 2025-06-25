
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

interface UserProfileTabProps {
  user: User;
  onRefresh: () => void;
}

export const UserProfileTab: React.FC<UserProfileTabProps> = ({ user }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-500">Full Name</label>
            <div className="text-gray-900">{user.name || 'Not provided'}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Phone Number</label>
            <div className="text-gray-900">{user.phone}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Role</label>
            <div>
              <Badge variant={user.role === 'driver' ? 'default' : 'secondary'}>
                {user.role}
              </Badge>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Language</label>
            <div className="text-gray-900">English (Default)</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <div>
              <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                {user.status}
              </Badge>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Date Joined</label>
            <div className="text-gray-900">
              {new Date(user.dateJoined).toLocaleDateString()}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Last Seen</label>
            <div className="text-gray-900">{user.lastSeen}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Total Trips</label>
            <div className="text-gray-900">{user.tripsCount}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
