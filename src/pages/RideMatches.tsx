
import React from 'react';
import { useRideMatches } from '@/hooks/useRideMatches';
import RideMatchesHeader from '@/components/matches/RideMatchesHeader';
import MatchesMapBlock from "@/components/matches/MatchesMapBlock";
import FiltersBlock from "@/components/matches/FiltersBlock";
import RideMatchesList from "@/components/matches/RideMatchesList";

const RideMatches = () => {
  const {
    passengerTrip,
    matchingTrips,
    loading,
    filters,
    setFilters,
    loadMatchingTrips,
    handleMatchTrip
  } = useRideMatches();

  return (
    <div className="min-h-screen bg-gray-50">
      <RideMatchesHeader matchCount={matchingTrips.length} />

      {/* Map Section */}
      {passengerTrip && (
        <MatchesMapBlock
          passengerTrip={passengerTrip}
          driverTrips={matchingTrips}
        />
      )}

      {/* Filters */}
      <div className="p-4">
        <FiltersBlock
          filters={filters}
          onFiltersChange={setFilters}
          onRefresh={loadMatchingTrips}
        />
      </div>

      {/* Matches List */}
      <div className="px-4 pb-24">
        <RideMatchesList
          trips={matchingTrips}
          loading={loading}
          onMatch={handleMatchTrip}
          onWhatsApp={() => {}}
        />
      </div>
    </div>
  );
};

export default RideMatches;
