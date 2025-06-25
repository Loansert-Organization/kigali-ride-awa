
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EarningsHeaderProps {
  onWithdrawClick: () => void;
}

export const EarningsHeader: React.FC<EarningsHeaderProps> = ({ onWithdrawClick }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/home/driver')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Your Earnings</h1>
          </div>
          <Button
            onClick={onWithdrawClick}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Withdraw
          </Button>
        </div>
      </div>
    </div>
  );
};
