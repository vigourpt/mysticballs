import React, { useEffect, useState } from 'react';
import { supabase, createUserProfile, getUserProfile, updateUserReadingsCount } from '../services/supabase';
import ReactConfetti from 'react-confetti';
import { ANONYMOUS_FREE_READINGS_LIMIT, FREE_READINGS_LIMIT } from '../config/constants';

const AuthCallback: React.FC = () => {
  const [message, setMessage] = useState<string>('Processing authentication...');
  const [error, setError] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Update window dimensions when window is resized
  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get URL parameters
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const type = params.get('type');
        const hashFragment = window.location.hash;
        
        console.log('Auth callback params:', { code, type, hashFragment });
        
        // Handle email confirmation flow
        if (code) {
          setMessage('Confirming your email...');
          
          try {
            // Exchange the code for a session
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            
            if (error) {
              console.error('Code exchange error:', error);
              throw error;
            }
            
            if (!data?.session) {
              throw new Error('No session found after code exchange');
            }
            
            setMessage('Email confirmed! Setting up your account...');
            
            // Get user info
            const userId = data.session.user.id;
            const email = data.session.user.email || '';
            
            console.log('User authenticated:', { userId, email });
            
            try {
              // Try to get existing profile
              let profile = await getUserProfile(userId);
              console.log('Existing profile:', profile);
              
              if (!profile) {
                // Create profile if it doesn't exist
                setMessage('Creating your profile...');
                console.log('Creating new profile for user:', userId);
                
                // Create with 3 additional free readings (on top of anonymous readings)
                profile = await createUserProfile(userId, email);
                
                // Transfer anonymous readings if any
                const storedReadings = localStorage.getItem('freeReadingsUsed');
                const anonymousReadings = storedReadings ? parseInt(storedReadings, 10) : 0;
                
                if (anonymousReadings > 0) {
                  console.log('Transferring anonymous readings:', anonymousReadings);
                  
                  // Add the additional free readings (FREE_READINGS_LIMIT - ANONYMOUS_FREE_READINGS_LIMIT)
                  const additionalReadings = FREE_READINGS_LIMIT - ANONYMOUS_FREE_READINGS_LIMIT;
                  
                  // Update the user's readings count
                  await updateUserReadingsCount(userId, Math.min(anonymousReadings, ANONYMOUS_FREE_READINGS_LIMIT) + additionalReadings);
                  
                  // Clear anonymous readings from localStorage
                  localStorage.removeItem('freeReadingsUsed');
                } else {
                  // If no anonymous readings, just add the additional free readings
                  const additionalReadings = FREE_READINGS_LIMIT - ANONYMOUS_FREE_READINGS_LIMIT;
                  await updateUserReadingsCount(userId, additionalReadings);
                }
              }
              
              setSuccess(true);
              setMessage('Authentication successful! Redirecting...');
              
              // Redirect to home page after successful authentication
              setTimeout(() => {
                window.location.href = '/';
              }, 3000);
            } catch (profileError) {
              console.error('Profile error:', profileError);
              // Continue anyway, as the auth was successful
              setSuccess(true);
              setMessage('Authentication successful! Redirecting...');
              setTimeout(() => {
                window.location.href = '/';
              }, 3000);
            }
          } catch (sessionError) {
            console.error('Session error:', sessionError);
            throw sessionError;
          }
        } 
        // Handle OAuth flow (Google, etc.)
        else if (hashFragment) {
          setMessage('Processing OAuth login...');
          
          try {
            // The Supabase client should handle this automatically
            const { data, error } = await supabase.auth.getSession();
            
            if (error) {
              throw error;
            }
            
            if (data?.session) {
              setSuccess(true);
              setMessage('Authentication successful! Redirecting...');
              
              // Redirect to home page after successful authentication
              setTimeout(() => {
                window.location.href = '/';
              }, 3000);
            } else {
              throw new Error('No session found');
            }
          } catch (oauthError) {
            console.error('OAuth error:', oauthError);
            throw oauthError;
          }
        } 
        // No authentication parameters found
        else {
          // Check if we already have a session
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            throw error;
          }
          
          if (data?.session) {
            setSuccess(true);
            setMessage('Already authenticated! Redirecting...');
            
            // Redirect to home page
            setTimeout(() => {
              window.location.href = '/';
            }, 3000);
          } else {
            throw new Error('No authentication parameters found');
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
      {success && (
        <ReactConfetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.1}
          colors={['#f472b6', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b']}
        />
      )}
      <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8 shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">
          {error ? 'Authentication Error' : success ? 'Welcome!' : 'Authentication'}
        </h2>
        <div className="text-center">
          {!error && !success && (
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          )}
          {success && (
            <div className="mb-6">
              <div className="relative mx-auto w-24 h-24 mb-4">
                {/* Pulsing circles animation */}
                <div className="absolute inset-0 rounded-full bg-indigo-600 opacity-75 animate-ping"></div>
                <div className="absolute inset-2 rounded-full bg-indigo-500 opacity-90 animate-pulse"></div>
                <div className="absolute inset-4 rounded-full bg-indigo-400 opacity-100"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              <p className="text-xl font-medium text-white mb-2">Login Successful!</p>
              <p className="text-lg text-indigo-200">You now have 5 free readings!</p>
            </div>
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
