
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from 'lucide-react';

interface PassengerRequestsEmptyStateProps {
  onBackToDashboard: () => void;
}

const PassengerRequestsEmptyState: React.FC<PassengerRequestsEmptyStateProps> = ({
  onBackToDashboard
}) => {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Requests Available</h3>
        <p className="text-gray-600 mb-4">
          Check back later or go online to receive ride requests
        </p>
        <Button onClick={onBackToDashboard} className="bg-purple-600 hover:bg-purple-700">
          Back to Dashboard
        </Button>
      </CardContent>
    </Card>
  );
};

export default PassengerRequestsEmptyState;
