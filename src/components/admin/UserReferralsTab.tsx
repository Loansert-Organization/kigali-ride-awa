
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserReferralsTabProps {
  userId: string;
}

export const UserReferralsTab: React.FC<UserReferralsTabProps> = ({ userId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Referral Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center text-gray-500 py-8">
          Referral data for user {userId.slice(0, 8)}... will be displayed here.
          <br />
          <span className="text-sm">Coming soon...</span>
        </div>
      </CardContent>
    </Card>
  );
};
