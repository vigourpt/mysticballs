import { useState, useEffect } from 'react';
import { UserUsage } from '../types';
import { getUserProfile, incrementReadingCount, updatePremiumStatus } from '../services/supabase';
import { FREE_READINGS_LIMIT } from '../config/constants';

const ANONYMOUS_STORAGE_KEY = 'anonymous_readings_count';

export const useUsageTracking = (userId: string | null) => {
  const [usage, setUsage] = useState<UserUsage>({
    readingsCount: 0,
    isPremium: false,
  });

  useEffect(() => {
    const loadUsage = async () => {
      if (!userId) {
        // For anonymous users, get count from localStorage
        const anonymousCount = parseInt(localStorage.getItem(ANONYMOUS_STORAGE_KEY) || '0');
        setUsage({ readingsCount: anonymousCount, isPremium: false });
        return;
      }
      
      try {
        const profile = await getUserProfile(userId);
        if (profile) {
          setUsage({
            readingsCount: profile.readings_count,
            isPremium: profile.is_premium,
            lastReadingDate: profile.last_reading_date,
          });
        }
      } catch (error) {
        console.error('Error loading usage:', error);
      }
    };

    loadUsage();
  }, [userId]);

  const incrementUsage = async () => {
    if (!userId) {
      // For anonymous users, store count in localStorage
      const newCount = usage.readingsCount + 1;
      localStorage.setItem(ANONYMOUS_STORAGE_KEY, newCount.toString());
      setUsage(prev => ({
        ...prev,
        readingsCount: newCount,
      }));
      return;
    }

    try {
      await incrementReadingCount(userId);
      setUsage(prev => ({
        ...prev,
        readingsCount: prev.readingsCount + 1,
        lastReadingDate: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error incrementing usage:', error);
    }
  };

  const hasReachedLimit = () => {
    if (!userId) {
      return usage.readingsCount >= FREE_READINGS_LIMIT;
    }
    return !usage.isPremium && usage.readingsCount >= FREE_READINGS_LIMIT;
  };

  const remainingReadings = () => {
    if (usage.isPremium) return Infinity;
    return Math.max(0, FREE_READINGS_LIMIT - usage.readingsCount);
  };

  const setPremiumStatus = async (isPremium: boolean) => {
    if (!userId) return;

    try {
      await updatePremiumStatus(userId, isPremium);
      setUsage(prev => ({
        ...prev,
        isPremium,
      }));
    } catch (error) {
      console.error('Error updating premium status:', error);
    }
  };

  return {
    usage,
    incrementUsage,
    hasReachedLimit,
    remainingReadings,
    setPremiumStatus,
  };
};