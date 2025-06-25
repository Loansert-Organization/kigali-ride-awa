
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchX, Bell, ArrowLeft } from 'lucide-react';

interface NoMatchFallbackBlockProps {
  onBackToBooking: () => void;
}

const NoMatchFallbackBlock: React.FC<NoMatchFallbackBlockProps> = ({
  onBackToBooking
}) => {
  return (
    <Card className="mx-auto max-w-md">
      <CardContent className="p-8 text-center">
        <div className="mb-6">
          <SearchX className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No matches found
          </h3>
          <p className="text-gray-600">
            No drivers are currently heading your way, but don't worry - new trips are posted all the time!
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={onBackToBooking}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Edit your trip details
          </Button>

          <Button
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            disabled
          >
            <Bell className="w-4 h-4 mr-2" />
            Notify me when available
            <span className="ml-2 text-xs opacity-75">(Coming soon)</span>
          </Button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> Try adjusting your pickup time or vehicle type for more matches.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NoMatchFallbackBlock;
