
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign } from 'lucide-react';

interface CompletedTrip {
  id: string;
  route: string;
  date: string;
  fare: number;
  passengers: number;
  status: 'completed' | 'cancelled';
  duration: string;
}

interface CompletedTripsBlockProps {
  trips?: CompletedTrip[];
  formatCurrency?: (amount: number) => string;
  isLoading?: boolean;
}

export const CompletedTripsBlock: React.FC<CompletedTripsBlockProps> = ({
  trips = [],
  formatCurrency = (amount) => `RWF ${amount.toLocaleString()}`,
  isLoading = false
}) => {
  // Mock data if no trips provided
  const mockTrips: CompletedTrip[] = [
    {
      id: 'trip-001',
      route: 'Kigali → Huye',
      date: '2024-01-15',
      fare: 3500,
      passengers: 3,
      status: 'completed',
      duration: '2h 30m'
    },
    {
      id: 'trip-002',
      route: 'Nyabugogo → Remera',
      date: '2024-01-15',
      fare: 1500,
      passengers: 2,
      status: 'completed',
      duration: '45m'
    },
    {
      id: 'trip-003',
      route: 'Kimisagara → Airport',
      date: '2024-01-14',
      fare: 2000,
      passengers: 1,
      status: 'cancelled',
      duration: '0m'
    }
  ];

  const displayTrips = trips.length > 0 ? trips : mockTrips;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Trips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (displayTrips.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Trips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No completed trips yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Your trip history will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recent Trips</span>
          <Badge variant="outline">{displayTrips.length} trips</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayTrips.map((trip) => (
            <div key={trip.id} className="p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">{trip.route}</h4>
                  <p className="text-sm text-gray-600">{trip.date}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-medium">{formatCurrency(trip.fare)}</span>
                  </div>
                  <Badge className={getStatusColor(trip.status)}>
                    {trip.status}
                  </Badge>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>{trip.passengers} passenger{trip.passengers !== 1 ? 's' : ''}</span>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{trip.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Also export as default for backward compatibility
export default CompletedTripsBlock;
