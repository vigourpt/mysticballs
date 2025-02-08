import { useState, useEffect } from 'react';
import { UserUsage } from '../types';
import { getUserProfile } from '../services/supabase';

const defaultUsage: UserUsage = {
  readingsCount: 0,
  isPremium: false,
  lastReadingDate: null,
  readingsRemaining: 3
};

export const useUsageTracking = (userId: string | null) => {
  const [usage, setUsage] = useState<UserUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUsage = async () => {
      if (!userId) {
        setUsage(defaultUsage);
        setLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile(userId);
        if (profile) {
          setUsage({
            readingsCount: profile.readings_count,
            isPremium: profile.is_premium,
            lastReadingDate: profile.last_reading_date,
            readingsRemaining: profile.is_premium ? Infinity : Math.max(0, 3 - profile.readings_count)
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch usage'));
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
  }, [userId]);

  return { usage, loading, error };
};