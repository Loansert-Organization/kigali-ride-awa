
import React from 'react';
import { MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TripRouteCardProps {
  fromLocation: string;
  toLocation: string;
  onUpdate: (updates: { fromLocation?: string; toLocation?: string }) => void;
}

const TripRouteCard: React.FC<TripRouteCardProps> = ({
  fromLocation,
  toLocation,
  onUpdate
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          Trip Route
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="from">From (Starting Point)</Label>
          <Input
            id="from"
            placeholder="Where are you starting from?"
            value={fromLocation}
            onChange={(e) => onUpdate({ fromLocation: e.target.value })}
          />
        </div>
        
        <div>
          <Label htmlFor="to">To (Destination)</Label>
          <Input
            id="to"
            placeholder="Where are you going?"
            value={toLocation}
            onChange={(e) => onUpdate({ toLocation: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TripRouteCard;
