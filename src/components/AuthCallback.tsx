import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

const AuthCallback: React.FC = () => {
  const [message, setMessage] = useState<string>('Processing authentication...');
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash fragment from the URL
        const hashFragment = window.location.hash;
        
        // Process the hash fragment if it exists
        if (hashFragment) {
          // The hash contains the access token and other auth info
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            throw error;
          }
          
          if (data?.session) {
            setMessage('Authentication successful! Redirecting...');
            // Redirect to home page after successful authentication
            setTimeout(() => {
              window.location.href = '/';
            }, 2000);
          } else {
            throw new Error('No session found');
          }
        } else {
          // If there's no hash fragment, check if there's a session
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            throw error;
          }
          
          if (data?.session) {
            setMessage('Authentication successful! Redirecting...');
            // Redirect to home page after successful authentication
            setTimeout(() => {
              window.location.href = '/';
            }, 2000);
          } else {
            throw new Error('No session found');
          }
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(true);
        setMessage(err instanceof Error ? err.message : 'Authentication failed');
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-900 to-blue-950">
      <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8 shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">
          {error ? 'Authentication Error' : 'Authentication'}
        </h2>
        <div className="text-center">
          {!error && (
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          )}
          <p className={`text-lg ${error ? 'text-red-400' : 'text-gray-300'}`}>
            {message}
          </p>
          {error && (
            <button
              onClick={() => window.location.href = '/'}
              className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              Return to Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
