
import { useState } from 'react';
import { useDriverProfile } from './driver/useDriverProfile';
import { useDriverLocation } from './driver/useDriverLocation';
import { useDriverStatus } from './driver/useDriverStatus';
import { useDriverActions } from './driver/useDriverActions';
import { useUserData } from './driver/useUserData';
import { UserProfile } from '@/types/user';
import { DriverProfile } from '@/types/api';

export interface DriverHomeData {
  user: UserProfile | null;
  driverProfile: DriverProfile | null;
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
  const { driverProfile, isOnline, toggleOnlineStatus: originalToggleOnlineStatus } = useDriverProfile();
  const { driverLocation } = useDriverLocation();
  const { statusData } = useDriverStatus();
  const { navigate, handleQuickStart } = useDriverActions();

  const handleToggleOnlineStatus = async (_newStatus: boolean) => {
    setIsToggleLoading(true);
    try {
      await originalToggleOnlineStatus();
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
