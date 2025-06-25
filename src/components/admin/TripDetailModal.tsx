
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MapPin, Clock, DollarSign, Users, Car, MessageCircle, Map as MapIcon, Settings } from 'lucide-react';

interface Trip {
  id: string;
  role: 'passenger' | 'driver';
  status: 'pending' | 'open' | 'matched' | 'completed' | 'cancelled';
  fromLocation: string;
  toLocation: string;
  scheduledTime: string;
  fare: number;
  seatsAvailable: number;
  createdBy: string;
  vehicleType: string;
  matchedCount: number;
  description?: string;
  isNegotiable?: boolean;
  createdAt: string;
}

interface TripDetailModalProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export const TripDetailModal: React.FC<TripDetailModalProps> = ({
  trip,
  isOpen,
  onClose,
  onRefresh,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'matched': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSendMessage = () => {
    // TODO: Implement WhatsApp message via Edge Function
    console.log('Send message to trip creator');
  };

  const handleChangeStatus = () => {
    // TODO: Implement status change modal
    console.log('Change trip status');
  };

  const handleViewOnMap = () => {
    // TODO: Implement full map view
    console.log('View trip on full map');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Trip Details</span>
            <Badge className={getStatusColor(trip.status)}>
              {trip.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Trip Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Route Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">From</label>
                  <div className="flex items-center mt-1">
                    <MapPin className="w-4 h-4 mr-2 text-green-600" />
                    <span className="font-medium">{trip.fromLocation}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">To</label>
                  <div className="flex items-center mt-1">
                    <MapPin className="w-4 h-4 mr-2 text-red-600" />
                    <span className="font-medium">{trip.toLocation}</span>
                  </div>
                </div>
                {trip.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="mt-1 text-gray-900">{trip.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Timing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Scheduled Time</label>
                  <div className="mt-1 font-medium">
                    {new Date(trip.scheduledTime).toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <div className="mt-1 text-gray-600">
                    {new Date(trip.createdAt).toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Trip Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Car className="w-5 h-5 mr-2" />
                  Trip Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Role</span>
                  <Badge variant={trip.role === 'driver' ? 'default' : 'secondary'}>
                    {trip.role}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Vehicle Type</span>
                  <span className="font-medium">{trip.vehicleType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    {trip.role === 'driver' ? 'Seats Available' : 'Matches Found'}
                  </span>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span className="font-medium">
                      {trip.role === 'driver' ? trip.seatsAvailable : trip.matchedCount}
                    </span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Fare</span>
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span className="font-medium">
                      {trip.fare ? `RWF ${trip.fare.toLocaleString()}` : 'Negotiable'}
                      {trip.isNegotiable && trip.fare && (
                        <span className="text-xs text-gray-500 ml-1">(Negotiable)</span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Created By</span>
                  <span className="font-medium">{trip.createdBy}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Admin Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={handleSendMessage}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message Creator
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={handleChangeStatus}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Change Status
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={handleViewOnMap}
                  >
                    <MapIcon className="w-4 h-4 mr-2" />
                    View on Full Map
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
