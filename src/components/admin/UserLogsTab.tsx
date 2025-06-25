
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserLogsTabProps {
  userId: string;
}

export const UserLogsTab: React.FC<UserLogsTabProps> = ({ userId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center text-gray-500 py-8">
          Activity logs for user {userId.slice(0, 8)}... will be displayed here.
          <br />
          <span className="text-sm">Coming soon...</span>
        </div>
      </CardContent>
    </Card>
  );
};
