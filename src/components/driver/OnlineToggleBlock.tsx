
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from 'lucide-react';

interface OnlineToggleBlockProps {
  isOnline: boolean;
  onToggle: (value: boolean) => void;
  isLoading?: boolean;
}

const OnlineToggleBlock: React.FC<OnlineToggleBlockProps> = ({
  isOnline,
  onToggle,
  isLoading = false
}) => {
  return (
    <Card className={`transition-all duration-300 ${isOnline ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isOnline ? (
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Wifi className="w-6 h-6 text-green-600" />
              </div>
            ) : (
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <WifiOff className="w-6 h-6 text-gray-600" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-800">
                {isOnline ? '✅ You\'re Online' : '❌ You\'re Offline'}
              </h3>
              <p className="text-sm text-gray-600">
                {isOnline 
                  ? 'Visible to passengers nearby' 
                  : 'Hidden from passenger searches'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant={isOnline ? "default" : "secondary"} className={isOnline ? "bg-green-600" : ""}>
              {isOnline ? 'LIVE' : 'OFFLINE'}
            </Badge>
            <Switch
              checked={isOnline}
              onCheckedChange={onToggle}
              disabled={isLoading}
              className={`transition-all duration-300 ${isOnline ? 'data-[state=checked]:bg-green-600' : ''}`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OnlineToggleBlock;
