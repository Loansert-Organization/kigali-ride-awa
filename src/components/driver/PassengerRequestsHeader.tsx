
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from 'lucide-react';

interface PassengerRequestsHeaderProps {
  requestCount: number;
  onBack: () => void;
}

const PassengerRequestsHeader: React.FC<PassengerRequestsHeaderProps> = ({
  requestCount,
  onBack
}) => {
  return (
    <div className="bg-white border-b p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mr-3"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-bold">Passenger Requests</h1>
        </div>
        <Badge variant="secondary">
          {requestCount} available
        </Badge>
      </div>
    </div>
  );
};

export default PassengerRequestsHeader;
