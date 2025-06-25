
import { useState } from 'react';
import { useDriverProfile } from './driver/useDriverProfile';
import { useDriverLocation } from './driver/useDriverLocation';
import { useDriverStatus } from './driver/useDriverStatus';
import { useDriverActions } from './driver/useDriverActions';
import { useUserData } from './driver/useUserData';

export interface DriverHomeData {
  user: any;
  driverProfile: any;
  isOnline: boolean;
  driverLocation: {lat: number; lng: number} | null;
  statusData: {
    todayTrips: number;
    todayEarnings: number;
    weeklyPoints: number;
    leaderboardRank: undefined;
    lastTripSummary: undefined;
  };
}

export const useDriverHome = () => {
  const [isToggleLoading, setIsToggleLoading] = useState(false);
  
  const { user } = useUserData();
  const { driverProfile, isOnline, setIsOnline } = useDriverProfile();
  const { driverLocation } = useDriverLocation();
  const { statusData, toggleOnlineStatus } = useDriverStatus();
  const { navigate, handleQuickStart } = useDriverActions();

  const handleToggleOnlineStatus = async (newStatus: boolean) => {
    setIsToggleLoading(true);
    try {
      const success = await toggleOnlineStatus(newStatus, driverProfile);
      if (success) {
        setIsOnline(newStatus);
      }
    } finally {
      setIsToggleLoading(false);
    }
  };

  const handleQuickStartAction = () => {
    handleQuickStart(driverLocation);
  };

  return {
    user,
    driverProfile,
    isOnline,
    isToggleLoading,
    driverLocation,
    statusData,
    toggleOnlineStatus: handleToggleOnlineStatus,
    handleQuickStart: handleQuickStartAction,
    navigate
  };
};
