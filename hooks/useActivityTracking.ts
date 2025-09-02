import { useEffect } from 'react';
import { AutoLogoutService } from '../services/AutoLogoutService';

/**
 * Custom hook to track user activity and reset auto-logout timer
 * Use this hook in screens where you want to track user activity
 */
export const useActivityTracking = () => {
  useEffect(() => {
    // Record activity when component mounts
    AutoLogoutService.recordActivity();
  }, []);

  // Return a function that components can call manually to record activity
  const recordActivity = () => {
    AutoLogoutService.recordActivity();
  };

  return { recordActivity };
}; 