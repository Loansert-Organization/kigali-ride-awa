
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';

interface RideMatchesHeaderProps {
  matchCount: number;
}

const RideMatchesHeader: React.FC<RideMatchesHeaderProps> = ({ matchCount }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold">Available Rides</h1>
          <p className="text-sm text-gray-500">
            {matchCount} matches found
          </p>
        </div>
      </div>
    </div>
  );
};

export default RideMatchesHeader;
