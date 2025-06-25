
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Calendar, DollarSign } from 'lucide-react';

interface TripSearchBlockProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  dateFromFilter: string;
  onDateFromFilterChange: (value: string) => void;
  dateToFilter: string;
  onDateToFilterChange: (value: string) => void;
  fareMinFilter: string;
  onFareMinFilterChange: (value: string) => void;
  fareMaxFilter: string;
  onFareMaxFilterChange: (value: string) => void;
}

export const TripSearchBlock: React.FC<TripSearchBlockProps> = ({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  dateFromFilter,
  onDateFromFilterChange,
  dateToFilter,
  onDateToFilterChange,
  fareMinFilter,
  onFareMinFilterChange,
  fareMaxFilter,
  onFareMaxFilterChange,
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by Trip ID, location, or creator..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Filter className="w-4 h-4 mr-1" />
                Role
              </label>
              <Select value={roleFilter} onValueChange={onRoleFilterChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="passenger">Passenger</SelectItem>
                  <SelectItem value="driver">Driver</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="matched">Matched</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                From Date
              </label>
              <Input
                type="date"
                value={dateFromFilter}
                onChange={(e) => onDateFromFilterChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">To Date</label>
              <Input
                type="date"
                value={dateToFilter}
                onChange={(e) => onDateToFilterChange(e.target.value)}
              />
            </div>
          </div>

          {/* Filters Row 2 - Fare Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <DollarSign className="w-4 h-4 mr-1" />
                Min Fare (RWF)
              </label>
              <Input
                type="number"
                placeholder="0"
                value={fareMinFilter}
                onChange={(e) => onFareMinFilterChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Max Fare (RWF)</label>
              <Input
                type="number"
                placeholder="No limit"
                value={fareMaxFilter}
                onChange={(e) => onFareMaxFilterChange(e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
