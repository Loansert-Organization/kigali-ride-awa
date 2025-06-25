
import React from 'react';
import BottomNavigation from "@/components/navigation/BottomNavigation";
import OnlineToggleBlock from "@/components/driver/OnlineToggleBlock";
import DriverStatusSummary from "@/components/driver/DriverStatusSummary";
import QuickActionButtons from "@/components/driver/QuickActionButtons";
import PassengerRequestsFeed from "@/components/driver/PassengerRequestsFeed";
import DriverHeader from "@/components/driver/DriverHeader";
import { useDriverHome } from "@/hooks/useDriverHome";

const DriverHome = () => {
  const {
    driverProfile,
    isOnline,
    isToggleLoading,
    driverLocation,
    statusData,
    toggleOnlineStatus,
    handleQuickStart,
    navigate
  } = useDriverHome();

  return (
    <div className="min-h-screen bg-gray-50">
      <DriverHeader
        driverProfile={driverProfile}
        onProfileClick={() => navigate('/profile')}
      />

      <div className="p-4 space-y-4 pb-24">
        <OnlineToggleBlock
          isOnline={isOnline}
          onToggle={toggleOnlineStatus}
          isLoading={isToggleLoading}
        />

        <DriverStatusSummary
          todayTrips={statusData.todayTrips}
          todayEarnings={statusData.todayEarnings}
          weeklyPoints={statusData.weeklyPoints}
          leaderboardRank={statusData.leaderboardRank}
          lastTripSummary={statusData.lastTripSummary}
        />

        <QuickActionButtons
          onQuickStart={handleQuickStart}
          isOnline={isOnline}
        />

        <PassengerRequestsFeed
          driverLocation={driverLocation}
          vehicleType={driverProfile?.vehicle_type || 'car'}
          isOnline={isOnline}
        />
      </div>

      <BottomNavigation role="driver" />
    </div>
  );
};

export default DriverHome;
