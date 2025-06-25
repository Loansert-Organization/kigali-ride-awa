
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, MapPin, FileText, DollarSign, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickActionButtonsProps {
  onQuickStart?: () => void;
  isOnline: boolean;
}

const QuickActionButtons: React.FC<QuickActionButtonsProps> = ({
  onQuickStart,
  isOnline
}) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        onClick={() => navigate('/create-trip')}
        className="h-20 bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white"
      >
        <div className="text-center">
          <Plus className="w-6 h-6 mx-auto mb-1" />
          <span className="text-sm font-medium">📍 Create Trip</span>
          <div className="text-xs opacity-90">Plan your route</div>
        </div>
      </Button>

      <Button
        onClick={onQuickStart}
        disabled={!isOnline}
        variant={isOnline ? "default" : "outline"}
        className={`h-20 ${isOnline 
          ? 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white' 
          : 'opacity-50'
        }`}
      >
        <div className="text-center">
          <Zap className="w-6 h-6 mx-auto mb-1" />
          <span className="text-sm font-medium">🚀 Go Live Now</span>
          <div className="text-xs opacity-90">
            {isOnline ? 'Start from here' : 'Go online first'}
          </div>
        </div>
      </Button>

      <Button
        onClick={() => navigate('/past-trips')}
        variant="outline"
        className="h-16"
      >
        <div className="text-center">
          <FileText className="w-5 h-5 mx-auto mb-1" />
          <span className="text-sm">📖 My Trips</span>
        </div>
      </Button>

      <Button
        onClick={() => navigate('/rewards')}
        variant="outline"
        className="h-16"
      >
        <div className="text-center">
          <DollarSign className="w-5 h-5 mx-auto mb-1" />
          <span className="text-sm">💰 Earnings</span>
        </div>
      </Button>
    </div>
  );
};

export default QuickActionButtons;
