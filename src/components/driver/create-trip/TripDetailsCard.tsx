
import React from 'react';
import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface TripDetailsCardProps {
  scheduledTime: string;
  vehicleType: string;
  seatsAvailable: string;
  fare: string;
  description: string;
  onUpdate: (updates: any) => void;
}

const TripDetailsCard: React.FC<TripDetailsCardProps> = ({
  scheduledTime,
  vehicleType,
  seatsAvailable,
  fare,
  description,
  onUpdate
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Trip Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="time">Departure Time</Label>
          <Input
            id="time"
            type="datetime-local"
            value={scheduledTime}
            onChange={(e) => onUpdate({ scheduledTime: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="vehicle">Vehicle Type</Label>
          <Select
            value={vehicleType}
            onValueChange={(value) => onUpdate({ vehicleType: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="moto">🏍️ Moto</SelectItem>
              <SelectItem value="car">🚗 Car</SelectItem>
              <SelectItem value="tuktuk">🛺 Tuktuk</SelectItem>
              <SelectItem value="minibus">🚐 Minibus</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="seats">Available Seats</Label>
            <Select
              value={seatsAvailable}
              onValueChange={(value) => onUpdate({ seatsAvailable: value })}
            >
              <SelectTrigger>
                <SelectValue />
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
            <Label htmlFor="fare">Fare per person (RWF)</Label>
            <Input
              id="fare"
              type="number"
              placeholder="Optional"
              value={fare}
              onChange={(e) => onUpdate({ fare: e.target.value })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Trip Description</Label>
          <Textarea
            id="notes"
            placeholder="Any details passengers should know? (meetup point, stops, etc.)"
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
