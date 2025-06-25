
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, FileText, Filter, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';

interface TripData {
  id: string;
  role: 'driver' | 'passenger';
  status: 'open' | 'matched' | 'completed' | 'cancelled';
  fromLocation: string;
  toLocation: string;
  scheduledTime: string;
  fare: number;
  createdBy: string;
}

interface TripStatsTableProps {
  data?: TripData[];
}

export const TripStatsTable: React.FC<TripStatsTableProps> = ({ data = [] }) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-gray-100 text-gray-800';
      case 'matched': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredData = data.filter(trip => {
    const statusMatch = statusFilter === 'all' || trip.status === statusFilter;
    const roleMatch = roleFilter === 'all' || trip.role === roleFilter;
    
    let dateMatch = true;
    if (dateFilter === '7days') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateMatch = new Date(trip.scheduledTime) >= weekAgo;
    } else if (dateFilter === '30days') {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      dateMatch = new Date(trip.scheduledTime) >= monthAgo;
    }
    
    return statusMatch && roleMatch && dateMatch;
  });

  const handleViewOnMap = (tripId: string) => {
    navigate(`/admin/trip-map?id=${tripId}`);
  };

  const handleViewDetails = (tripId: string) => {
    navigate(`/admin/trip-details?id=${tripId}`);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="matched">Matched</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="driver">Driver</SelectItem>
            <SelectItem value="passenger">Passenger</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-sm text-gray-500">
          {filteredData.length} trips found
        </span>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trip ID</TableHead>
              <TableHead>Creator</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Fare</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((trip) => (
              <TableRow key={trip.id}>
                <TableCell>
                  <div className="font-mono text-sm">
                    {trip.id.slice(0, 8)}...
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={trip.role === 'driver' ? 'default' : 'secondary'}>
                    {trip.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(trip.status)}>
                    {trip.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium">{trip.fromLocation}</div>
                    <div className="text-gray-500">→ {trip.toLocation}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {new Date(trip.scheduledTime).toLocaleString()}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">
                    RWF {trip.fare?.toLocaleString() || 'N/A'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewOnMap(trip.id)}
                    >
                      <MapPin className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(trip.id)}
                    >
                      <FileText className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No trips found matching the current filters.
          </div>
        )}
      </div>
    </div>
  );
};
