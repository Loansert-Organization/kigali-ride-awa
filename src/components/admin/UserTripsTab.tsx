
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserTripsTabProps {
  userId: string;
}

export const UserTripsTab: React.FC<UserTripsTabProps> = ({ userId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trip History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center text-gray-500 py-8">
          Trip history for user {userId.slice(0, 8)}... will be displayed here.
          <br />
          <span className="text-sm">Coming soon...</span>
        </div>
      </CardContent>
    </Card>
  );
};
