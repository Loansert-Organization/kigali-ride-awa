
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TripStats {
  id: string;
  route: string;
  driver: string;
  passengers: number;
  fare: number;
  status: 'completed' | 'cancelled' | 'pending';
  date: string;
}

const mockTripStats: TripStats[] = [
  {
    id: 'trip-001',
    route: 'Kigali → Huye',
    driver: 'John Doe',
    passengers: 3,
    fare: 3500,
    status: 'completed',
    date: '2024-01-15'
  },
  {
    id: 'trip-002',
    route: 'Nyabugogo → Remera',
    driver: 'Jane Smith',
    passengers: 2,
    fare: 1500,
    status: 'completed',
    date: '2024-01-15'
  }
];

const TripStatsTable: React.FC = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Trips</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Trip ID</th>
                <th className="text-left p-2">Route</th>
                <th className="text-left p-2">Driver</th>
                <th className="text-left p-2">Passengers</th>
                <th className="text-left p-2">Fare</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {mockTripStats.map((trip) => (
                <tr key={trip.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-mono text-sm">{trip.id}</td>
                  <td className="p-2">{trip.route}</td>
                  <td className="p-2">{trip.driver}</td>
                  <td className="p-2">{trip.passengers}</td>
                  <td className="p-2">RWF {trip.fare.toLocaleString()}</td>
                  <td className="p-2">
                    <Badge className={getStatusColor(trip.status)}>
                      {trip.status}
                    </Badge>
                  </td>
                  <td className="p-2">{trip.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TripStatsTable;
