
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, RotateCcw } from 'lucide-react';

interface Filters {
  vehicleType: string[];
  timeRange: string;
  sortBy: string;
}

interface FiltersBlockProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onRefresh: () => void;
}

const FiltersBlock: React.FC<FiltersBlockProps> = ({
  filters,
  onFiltersChange,
  onRefresh
}) => {
  const vehicleTypes = [
    { id: 'moto', label: '🛵 Moto' },
    { id: 'car', label: '🚗 Car' },
    { id: 'tuktuk', label: '🛺 Tuktuk' },
    { id: 'minibus', label: '🚐 Minibus' }
  ];

  const timeRanges = [
    { id: 'all', label: 'Any time' },
    { id: 'next_30min', label: 'Next 30 min' },
    { id: 'next_1hour', label: 'Next hour' },
    { id: 'today', label: 'Today' }
  ];

  const sortOptions = [
    { id: 'best_match', label: 'Best match' },
    { id: 'time', label: 'Earliest time' },
    { id: 'fare', label: 'Lowest fare' }
  ];

  const toggleVehicleType = (type: string) => {
    const newVehicleTypes = filters.vehicleType.includes(type)
      ? filters.vehicleType.filter(t => t !== type)
      : [...filters.vehicleType, type];
    
    onFiltersChange({
      ...filters,
      vehicleType: newVehicleTypes
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      vehicleType: [],
      timeRange: 'all',
      sortBy: 'best_match'
    });
  };

  const hasActiveFilters = filters.vehicleType.length > 0 || 
                          filters.timeRange !== 'all' || 
                          filters.sortBy !== 'best_match';

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </h3>
          <div className="flex space-x-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <RotateCcw className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onRefresh}>
              🔄 Refresh
            </Button>
          </div>
        </div>

        {/* Vehicle Type Filter */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Vehicle Type</p>
          <div className="flex flex-wrap gap-2">
            {vehicleTypes.map((type) => (
              <Badge
                key={type.id}
                variant={filters.vehicleType.includes(type.id) ? "default" : "outline"}
                className="cursor-pointer hover:bg-purple-100"
                onClick={() => toggleVehicleType(type.id)}
              >
                {type.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Time Range Filter */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Departure Time</p>
          <div className="flex flex-wrap gap-2">
            {timeRanges.map((range) => (
              <Badge
                key={range.id}
                variant={filters.timeRange === range.id ? "default" : "outline"}
                className="cursor-pointer hover:bg-purple-100"
                onClick={() => onFiltersChange({ ...filters, timeRange: range.id })}
              >
                {range.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Sort by</p>
          <div className="flex flex-wrap gap-2">
            {sortOptions.map((sort) => (
              <Badge
                key={sort.id}
                variant={filters.sortBy === sort.id ? "default" : "outline"}
                className="cursor-pointer hover:bg-purple-100"
                onClick={() => onFiltersChange({ ...filters, sortBy: sort.id })}
              >
                {sort.label}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FiltersBlock;
