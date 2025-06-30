import { useState, useEffect } from 'react';
import { TripDraft } from '../TripWizard';

const DRAFT_STORAGE_KEY = 'trip_wizard_draft';

// Default draft state
const defaultDraft: TripDraft = {
  role: 'passenger',
  seats: 1
};

export const useTripDraft = () => {
  const [draft, setDraft] = useState<TripDraft>(defaultDraft);

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Convert departureTime string back to Date if it exists
        if (parsed.departureTime) {
          parsed.departureTime = new Date(parsed.departureTime);
        }
        
        setDraft({ ...defaultDraft, ...parsed });
      }
    } catch (error) {
      console.warn('Failed to load trip draft from localStorage:', error);
      // Continue with default draft
    }
  }, []);

  // Save draft to localStorage whenever it changes
  useEffect(() => {
    try {
      const draftToSave = {
        ...draft,
        // Convert Date to string for JSON serialization
        departureTime: draft.departureTime?.toISOString() || null
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftToSave));
    } catch (error) {
      console.warn('Failed to save trip draft to localStorage:', error);
    }
  }, [draft]);

  const updateDraft = (updates: Partial<TripDraft>) => {
    setDraft(prev => ({ ...prev, ...updates }));
  };

  const clearDraft = () => {
    setDraft(defaultDraft);
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear trip draft from localStorage:', error);
    }
  };

  const resetToDefaults = () => {
    const newDraft = {
      ...defaultDraft,
      role: draft.role // Keep the role selection
    };
    setDraft(newDraft);
  };

  // Validation helpers
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1: // Route step
        return Boolean(draft.origin && draft.destination);
      
      case 2: // Details step
        return Boolean(
          draft.origin && 
          draft.destination && 
          draft.seats > 0 && 
          draft.departureTime &&
          (draft.role === 'passenger' || draft.vehicleType)
        );
      
      case 3: // Review step
        return Boolean(
          draft.origin && 
          draft.destination && 
          draft.seats > 0 && 
          draft.departureTime &&
          (draft.role === 'passenger' || draft.vehicleType)
        );
      
      default:
        return false;
    }
  };

  const getCompletionPercentage = (): number => {
    let completed = 0;
    let total = 6; // Total required fields

    if (draft.origin) completed++;
    if (draft.destination) completed++;
    if (draft.seats > 0) completed++;
    if (draft.departureTime) completed++;
    if (draft.role === 'passenger' || draft.vehicleType) completed++;
    if (draft.estimatedPrice) completed++;

    return Math.round((completed / total) * 100);
  };

  return {
    draft,
    updateDraft,
    clearDraft,
    resetToDefaults,
    isStepValid,
    getCompletionPercentage
  };
}; 