import React, { useState, useEffect } from 'react';
import { supabaseClient } from '../lib/supabaseClient';
import { ReadingType } from '../types';
import { READING_TYPES } from '../data/readingTypes';
import { Sparkles, Calendar, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import ReadingOutput from './ReadingOutput';

interface ReadingHistoryProps {
  isDarkMode: boolean;
  onBack: () => void;
}

interface Reading {
  id: string;
  reading_type: string;
  user_input: Record<string, any>;
  reading_output: string;
  created_at: string;
}

interface PaginationInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

const ReadingHistory: React.FC<ReadingHistoryProps> = ({ isDarkMode, onBack }) => {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  });
  const [selectedReading, setSelectedReading] = useState<Reading | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null
  });

  // Fetch reading history
  const fetchReadingHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('page', pagination.page.toString());
      queryParams.append('pageSize', pagination.pageSize.toString());
      
      if (filterType) {
        queryParams.append('readingType', filterType);
      }
      
      if (dateRange.start) {
        queryParams.append('startDate', dateRange.start);
      }
      
      if (dateRange.end) {
        queryParams.append('endDate', dateRange.end);
      }
      
      // Get auth token
      const { data: sessionData } = await supabaseClient.auth.getSession();
      const token = sessionData.session?.access_token;
      
      if (!token) {
        throw new Error('Authentication token not found. Please sign in again.');
      }
      
      // Fetch reading history
      const response = await fetch(`/.netlify/functions/getReadingHistory?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Reading history is only available to premium members.');
        } else {
          throw new Error(`Failed to fetch reading history: ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      setReadings(data.readings);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching reading history:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reading history');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchReadingHistory();
  }, [pagination.page, filterType, dateRange.start, dateRange.end]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  // Handle filter change
  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setFilterType(value === 'all' ? null : value);
    setPagination({ ...pagination, page: 1 }); // Reset to first page when filter changes
  };

  // Handle date range change
  const handleDateChange = (type: 'start' | 'end', value: string) => {
    setDateRange({ ...dateRange, [type]: value || null });
    setPagination({ ...pagination, page: 1 }); // Reset to first page when date range changes
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get reading type name
  const getReadingTypeName = (typeId: string) => {
    const readingType = READING_TYPES.find(type => type.id === typeId);
    return readingType ? readingType.name : typeId;
  };

  // Get reading type icon component
  const getReadingTypeIcon = (typeId: string) => {
    const readingType = READING_TYPES.find(type => type.id === typeId);
    const IconComponent = readingType ? readingType.icon : Sparkles;
    return <IconComponent className="w-5 h-5" />;
  };

  // View reading details
  const viewReading = (reading: Reading) => {
    setSelectedReading(reading);
  };

  // Back to list
  const backToList = () => {
    setSelectedReading(null);
  };

  // If a reading is selected, show its details
  if (selectedReading) {
    const foundReadingType = READING_TYPES.find(type => type.id === selectedReading.reading_type);
    
    // Create a reading type object for the ReadingOutput component
    const readingType: ReadingType = {
      id: (selectedReading.reading_type as any),
      name: getReadingTypeName(selectedReading.reading_type),
      description: foundReadingType?.description || '',
      icon: foundReadingType?.icon || Sparkles
    };
    
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={backToList}
          className="mb-8 flex items-center gap-2 px-4 py-2 text-white bg-indigo-900/40 hover:bg-indigo-900/60 rounded-lg transition-colors"
        >
          <span>←</span>
          Back to Reading History
        </button>
        
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-indigo-900/30' : 'bg-white/80'} mb-6`}>
          <div className="flex items-center gap-3 mb-4">
            {getReadingTypeIcon(selectedReading.reading_type)}
            <h3 className="text-xl font-semibold text-white">
              {getReadingTypeName(selectedReading.reading_type)}
            </h3>
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {formatDate(selectedReading.created_at)}
          </p>
        </div>
        
        <ReadingOutput
          readingType={readingType}
          isDarkMode={isDarkMode}
          reading={selectedReading.reading_output}
          isLoading={false}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-white bg-indigo-900/40 hover:bg-indigo-900/60 rounded-lg transition-colors"
        >
          <span>←</span>
          Back
        </button>
        <h2 className="text-2xl md:text-3xl font-bold text-white relative group">
          <span className="absolute -inset-2 bg-fuchsia-500/20 blur-xl rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
          <span className="absolute -inset-2 bg-fuchsia-500/20 blur-lg rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
          <span className="absolute -inset-2 bg-fuchsia-500/20 blur-md rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
          <span className="relative glow-text">Your Reading History</span>
        </h2>
      </div>
      
      {/* Filters */}
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-indigo-900/30' : 'bg-white/80'} mb-6`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <Filter className="w-4 h-4 inline mr-1" />
              Reading Type
            </label>
            <select
              value={filterType || 'all'}
              onChange={handleFilterChange}
              className={`w-full p-2 rounded-md ${
                isDarkMode 
                  ? 'bg-indigo-800/50 text-white border-indigo-700' 
                  : 'bg-white text-gray-800 border-gray-300'
              } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            >
              <option value="all">All Reading Types</option>
              {READING_TYPES.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <Calendar className="w-4 h-4 inline mr-1" />
              From Date
            </label>
            <input
              type="date"
              value={dateRange.start || ''}
              onChange={(e) => handleDateChange('start', e.target.value)}
              className={`w-full p-2 rounded-md ${
                isDarkMode 
                  ? 'bg-indigo-800/50 text-white border-indigo-700' 
                  : 'bg-white text-gray-800 border-gray-300'
              } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
          </div>
          
          <div className="flex-1">
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <Calendar className="w-4 h-4 inline mr-1" />
              To Date
            </label>
            <input
              type="date"
              value={dateRange.end || ''}
              onChange={(e) => handleDateChange('end', e.target.value)}
              className={`w-full p-2 rounded-md ${
                isDarkMode 
                  ? 'bg-indigo-800/50 text-white border-indigo-700' 
                  : 'bg-white text-gray-800 border-gray-300'
              } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
          </div>
        </div>
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className={`p-4 rounded-lg bg-red-500/20 text-white mb-6`}>
          <p>{error}</p>
        </div>
      )}
      
      {/* Empty state */}
      {!loading && !error && readings.length === 0 && (
        <div className={`p-8 rounded-lg ${isDarkMode ? 'bg-indigo-900/30' : 'bg-white/80'} text-center`}>
          <Sparkles className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`} />
          <h3 className="text-xl font-semibold text-white mb-2">No readings found</h3>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {filterType || dateRange.start || dateRange.end
              ? 'Try adjusting your filters to see more results.'
              : 'Your reading history will appear here after you get your first reading.'}
          </p>
        </div>
      )}
      
      {/* Reading list */}
      {!loading && !error && readings.length > 0 && (
        <>
          <div className="grid gap-4">
            {readings.map(reading => (
              <div
                key={reading.id}
                className={`p-4 rounded-lg ${isDarkMode ? 'bg-indigo-900/30' : 'bg-white/80'} cursor-pointer hover:shadow-lg transition-shadow`}
                onClick={() => viewReading(reading)}
              >
                <div className="flex items-center gap-3 mb-2">
                  {getReadingTypeIcon(reading.reading_type)}
                  <h3 className="text-lg font-semibold text-white">
                    {getReadingTypeName(reading.reading_type)}
                  </h3>
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
                  {formatDate(reading.created_at)}
                </p>
                <div className={`line-clamp-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {reading.reading_output.substring(0, 150)}...
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`p-2 rounded-md ${
                  pagination.page === 1
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-indigo-700/50'
                } ${isDarkMode ? 'bg-indigo-900/30' : 'bg-white/80'}`}
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              
              <span className={`px-4 py-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className={`p-2 rounded-md ${
                  pagination.page === pagination.totalPages
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-indigo-700/50'
                } ${isDarkMode ? 'bg-indigo-900/30' : 'bg-white/80'}`}
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReadingHistory;
