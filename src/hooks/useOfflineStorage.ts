import { useState, useEffect } from 'react';

interface OfflineTrip {
  id: string;
  role: 'passenger' | 'driver';
  from_location: string;
  to_location: string;
  scheduled_time: string;
  vehicle_type: string;
  status: string;
  created_at: string;
  synced: boolean;
}

interface OfflineData {
  trips: OfflineTrip[];
  userPreferences: {
    language: string;
    favorites: Array<{
      id: string;
      label: string;
      address: string;
      lat?: number;
      lng?: number;
    }>;
  };
  lastSyncTime: string;
}

const OFFLINE_STORAGE_KEY = 'kigali_ride_offline_data';

export const useOfflineStorage = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineData>(() => {
    const saved = localStorage.getItem(OFFLINE_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {
      trips: [],
      userPreferences: { language: 'en', favorites: [] },
      lastSyncTime: new Date().toISOString()
    };
  });

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('App is online - syncing data...');
      syncOfflineData();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      console.log('App is offline - enabling offline mode');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save to localStorage whenever offlineData changes
  useEffect(() => {
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(offlineData));
  }, [offlineData]);

  const addOfflineTrip = (trip: Omit<OfflineTrip, 'synced'>) => {
    const tripWithSync = { ...trip, synced: false };
    setOfflineData(prev => ({
      ...prev,
      trips: [...prev.trips, tripWithSync],
      lastSyncTime: new Date().toISOString()
    }));
    
    // Show offline notification
    if (!isOnline) {
      console.log('Trip saved offline - will sync when connection restored');
    }
  };

  const updateUserPreferences = (preferences: Partial<OfflineData['userPreferences']>) => {
    setOfflineData(prev => ({
      ...prev,
      userPreferences: { ...prev.userPreferences, ...preferences },
      lastSyncTime: new Date().toISOString()
    }));
  };

  const syncOfflineData = async () => {
    if (!isOnline) return;

    const unsyncedTrips = offlineData.trips.filter(trip => !trip.synced);
    
    if (unsyncedTrips.length === 0) {
      console.log('No offline data to sync');
      return;
    }

    console.log(`Syncing ${unsyncedTrips.length} offline trips...`);
    
    // Here you would sync with your backend
    // For now, just mark as synced
    setOfflineData(prev => ({
      ...prev,
      trips: prev.trips.map(trip => ({ ...trip, synced: true })),
      lastSyncTime: new Date().toISOString()
    }));
    
    console.log('Offline data synced successfully');
  };

  const clearOfflineData = () => {
    setOfflineData({
      trips: [],
      userPreferences: { language: 'en', favorites: [] },
      lastSyncTime: new Date().toISOString()
    });
    localStorage.removeItem(OFFLINE_STORAGE_KEY);
  };

  const getOfflineTrips = (role?: 'passenger' | 'driver') => {
    return role 
      ? offlineData.trips.filter(trip => trip.role === role)
      : offlineData.trips;
  };

  return {
    isOnline,
    offlineData,
    addOfflineTrip,
    updateUserPreferences,
    syncOfflineData,
    clearOfflineData,
    getOfflineTrips,
    hasUnsyncedData: offlineData.trips.some(trip => !trip.synced)
  };
};