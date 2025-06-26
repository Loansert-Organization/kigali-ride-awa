
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface TripDetailsCardProps {
  scheduledTime: string;
  vehicleType: string;
  seatsAvailable: number;
  fare: string;
  description: string;
  isNegotiable: boolean;
  onUpdate: (updates: {
    scheduledTime?: string;
    vehicleType?: string;
    seatsAvailable?: number;
    fare?: string;
    description?: string;
    isNegotiable?: boolean;
  }) => void;
}

const TripDetailsCard: React.FC<TripDetailsCardProps> = ({
  scheduledTime,
  vehicleType,
  seatsAvailable,
  fare,
  description,
  isNegotiable,
  onUpdate
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Trip Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="scheduledTime">Departure Time</Label>
          <Input
            id="scheduledTime"
            type="datetime-local"
            value={scheduledTime}
            onChange={(e) => onUpdate({ scheduledTime: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="vehicleType">Vehicle Type</Label>
          <Select value={vehicleType} onValueChange={(value) => onUpdate({ vehicleType: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select vehicle type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="moto">🏍️ Moto</SelectItem>
              <SelectItem value="car">🚗 Car</SelectItem>
              <SelectItem value="tuktuk">🛺 Tuktuk</SelectItem>
              <SelectItem value="minibus">🚐 Minibus</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="seatsAvailable">Available Seats</Label>
          <Select 
            value={seatsAvailable.toString()} 
            onValueChange={(value) => onUpdate({ seatsAvailable: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select seats" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 seat</SelectItem>
              <SelectItem value="2">2 seats</SelectItem>
              <SelectItem value="3">3 seats</SelectItem>
              <SelectItem value="4">4 seats</SelectItem>
              <SelectItem value="5">5+ seats</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="fare">Fare (RWF)</Label>
          <Input
            id="fare"
            type="number"
            placeholder="e.g., 1000"
            value={fare}
            onChange={(e) => onUpdate({ fare: e.target.value })}
            disabled={isNegotiable}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isNegotiable"
            checked={isNegotiable}
            onCheckedChange={(checked) => onUpdate({ isNegotiable: checked })}
          />
          <Label htmlFor="isNegotiable">Fare is negotiable</Label>
        </div>

        <div>
          <Label htmlFor="description">Additional Details (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Any special instructions or details about the trip..."
            value={description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TripDetailsCard;
