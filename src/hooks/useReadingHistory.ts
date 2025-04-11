import { useState, useEffect } from 'react';
import { supabaseClient } from '../lib/supabaseClient';

export type ReadingType = 'mystic-ball' | 'tarot' | 'orb';

export interface ReadingHistoryItem {
  id: string;
  user_id: string;
  reading_type: ReadingType;
  reading_output: any;
  question?: string;
  is_favorite: boolean;
  created_at: string;
}

interface UseReadingHistoryProps {
  limit?: number;
  readingType?: ReadingType;
  favoritesOnly?: boolean;
}

export function useReadingHistory({ 
  limit = 20, 
  readingType,
  favoritesOnly = false 
}: UseReadingHistoryProps = {}) {
  const [readings, setReadings] = useState<ReadingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Function to fetch reading history
  const fetchReadings = async () => {
    try {
      setLoading(true);
      
      // Build query
      let query = supabaseClient
        .from('reading_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      // Add filters based on props
      if (readingType) {
        query = query.eq('reading_type', readingType);
      }
      
      if (favoritesOnly) {
        query = query.eq('is_favorite', true);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      setReadings(data || []);
    } catch (err) {
      console.error('Error fetching reading history:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  // Toggle favorite status of a reading
  const toggleFavorite = async (readingId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabaseClient
        .from('reading_history')
        .update({ is_favorite: !currentStatus })
        .eq('id', readingId);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setReadings(prev => 
        prev.map(reading => 
          reading.id === readingId 
            ? { ...reading, is_favorite: !currentStatus } 
            : reading
        )
      );
      
      return true;
    } catch (err) {
      console.error('Error toggling favorite status:', err);
      return false;
    }
  };

  // Save a new reading
  const saveReading = async (
    readingType: ReadingType, 
    readingOutput: any, 
    question?: string
  ) => {
    try {
      const { data, error } = await supabaseClient
        .from('reading_history')
        .insert([
          { 
            reading_type: readingType, 
            reading_output: readingOutput,
            question,
            is_favorite: false
          }
        ])
        .select();
      
      if (error) {
        throw error;
      }
      
      // Refresh readings after save
      fetchReadings();
      
      return data ? data[0] : null;
    } catch (err) {
      console.error('Error saving reading:', err);
      return null;
    }
  };

  // Fetch readings on mount and when dependencies change
  useEffect(() => {
    fetchReadings();
  }, [limit, readingType, favoritesOnly]);

  return {
    readings,
    loading,
    error,
    toggleFavorite,
    saveReading,
    refreshReadings: fetchReadings
  };
}
