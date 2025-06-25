
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface TripDetailsBlockProps {
  scheduledTime: string;
  description: string;
  onUpdate: (updates: { scheduledTime?: string; description?: string }) => void;
}

const TripDetailsBlock: React.FC<TripDetailsBlockProps> = ({
  scheduledTime,
  description,
  onUpdate
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">📝 Trip Details</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="scheduledTime" className="text-sm font-medium text-gray-700">
              Departure Time
            </Label>
            <input
              id="scheduledTime"
              type="datetime-local"
              value={scheduledTime.slice(0, 16)}
              onChange={(e) => onUpdate({ scheduledTime: e.target.value })}
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Additional Notes (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Any special instructions or comments for your driver..."
              value={description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              className="mt-1 resize-none"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-2">
              Examples: "Please call when you arrive", "I have luggage", etc.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TripDetailsBlock;
