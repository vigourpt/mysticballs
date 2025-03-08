import React, { useEffect, useState } from 'react';
import { supabase, createUserProfile, getUserProfile, updateUserReadingsCount, getCodeVerifierFromServer } from '../services/supabase';
import ReactConfetti from 'react-confetti';
import { ANONYMOUS_FREE_READINGS_LIMIT, FREE_READINGS_LIMIT } from '../config/constants';

// Retrieve the code verifier from various storage options with retry logic
const getCodeVerifier = async (email?: string): Promise<string | null> => {
  // First try to get it from URL parameters
  const params = new URLSearchParams(window.location.search);
  const codeVerifierFromUrl = params.get('code_verifier');
  if (codeVerifierFromUrl) {
    console.log('Retrieved code verifier from URL parameters');
    return codeVerifierFromUrl;
  }
  
  // Then try localStorage
  const codeVerifierFromLocalStorage = localStorage.getItem('pkce_code_verifier');
  if (codeVerifierFromLocalStorage) {
    console.log('Retrieved code verifier from localStorage');
    return codeVerifierFromLocalStorage;
  }
  
  // Then try sessionStorage
  const codeVerifierFromSessionStorage = sessionStorage.getItem('pkce_code_verifier');
  if (codeVerifierFromSessionStorage) {
    console.log('Retrieved code verifier from sessionStorage');
    return codeVerifierFromSessionStorage;
  }
  
  // Then try cookies
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i]?.trim() || '';
    if (cookie.startsWith('pkce_code_verifier=')) {
      const codeVerifierFromCookie = cookie.substring('pkce_code_verifier='.length, cookie.length);
      console.log('Retrieved code verifier from cookies');
      return codeVerifierFromCookie;
    }
  }
  
  // Finally try to get it from the server if we have an email
  if (email) {
    console.log('Attempting to retrieve code verifier from server for email:', email);
    
    // Implement retry logic for server retrieval
    let retryCount = 0;
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second
    
    while (retryCount <= maxRetries) {
      try {
        const codeVerifierFromServer = await getCodeVerifierFromServer(email);
        if (codeVerifierFromServer) {
          console.log('Retrieved code verifier from server on attempt', retryCount + 1);
          return codeVerifierFromServer;
        }
        
        // If we get here, the code verifier was not found but no error was thrown
        console.log(`Code verifier not found on server (attempt ${retryCount + 1}/${maxRetries + 1})`);
      } catch (error) {
        console.error(`Error retrieving code verifier on attempt ${retryCount + 1}:`, error);
      }
      
      // If we've reached the max retries, break out of the loop
      if (retryCount >= maxRetries) break;
      
      // Exponential backoff with jitter
      const delay = Math.min(baseDelay * Math.pow(2, retryCount), 10000) * (0.75 + Math.random() * 0.5);
      console.log(`Retrying in ${Math.round(delay)}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      retryCount++;
    }
  }
  
  console.log('No code verifier found in any storage after all attempts');
  return null;
};

// Clear the code verifier from all storage options
const clearCodeVerifier = (): void => {
  localStorage.removeItem('pkce_code_verifier');
  sessionStorage.removeItem('pkce_code_verifier');
  document.cookie = 'pkce_code_verifier=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  
  // Also remove it from URL if present
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete('code_verifier');
    window.history.replaceState({}, document.title, url.toString());
  } catch (e) {
    console.error('Error updating URL:', e);
  }
};

const AuthCallback: React.FC = () => {
  const [message, setMessage] = useState<string>('Processing authentication...');
  const [detailMessage, setDetailMessage] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(true);
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

  const handleAuthCallback = async () => {
    try {
      // Get URL parameters
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const type = params.get('type');
      const hashFragment = window.location.hash;
      
      console.log('Auth callback params:', { code, type, hashFragment });
      setDetailMessage('Initializing authentication process...');
      
      // Handle email confirmation flow
      if (code) {
        setMessage('Confirming your email...');
        
        try {
          // First try to get the email from the URL
          const emailParam = params.get('email');
          
          // Get the code verifier from various storage options
          setDetailMessage('Retrieving authentication data...');
          const codeVerifier = await getCodeVerifier(emailParam || undefined);
          console.log('Retrieved code verifier:', codeVerifier ? 'Found' : 'Not found');
          
          if (!codeVerifier) {
            setDetailMessage('Authentication data not found. Attempting to continue...');
            console.error('No code verifier found. Authentication will likely fail.');
          } else {
            setDetailMessage('Authentication data retrieved successfully');
          }
          
          // Exchange the code for a session using the code verifier
          setDetailMessage('Exchanging authentication code for session...');
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            setDetailMessage('Error during code exchange: ' + error.message);
            console.error('Code exchange error:', error);
            throw error;
          }
          
          if (!data?.session) {
            setDetailMessage('No session found after code exchange');
            throw new Error('No session found after code exchange');
          }
          
          setDetailMessage('Session established successfully');
          
          // Clear the code verifier as it's no longer needed
          clearCodeVerifier();
          
          setMessage('Email confirmed! Setting up your account...');
          
          // Get user info
          const userId = data.session.user.id;
          const userEmail = data.session.user.email || '';
          
          console.log('User authenticated:', { userId, userEmail });
          
          try {
            // Try to get existing profile
            setDetailMessage('Checking for existing user profile...');
            let profile = await getUserProfile(userId);
            console.log('Existing profile:', profile);
            
            if (!profile) {
              // Create profile if it doesn't exist
              setMessage('Creating your profile...');
              setDetailMessage('Setting up new user account...');
              console.log('Creating new profile for user:', userId);
              
              // Create with 3 additional free readings (on top of anonymous readings)
              profile = await createUserProfile(userId, userEmail);
              setDetailMessage('User profile created successfully');
              
              // Transfer anonymous readings if any
              const storedReadings = localStorage.getItem('freeReadingsUsed');
              const anonymousReadings = storedReadings ? parseInt(storedReadings, 10) : 0;
              
              if (anonymousReadings > 0) {
                setDetailMessage('Transferring your previous readings...');
                console.log('Transferring anonymous readings:', anonymousReadings);
                
                // Add the additional free readings (FREE_READINGS_LIMIT - ANONYMOUS_FREE_READINGS_LIMIT)
                const additionalReadings = FREE_READINGS_LIMIT - ANONYMOUS_FREE_READINGS_LIMIT;
                
                // Update the user's readings count
                await updateUserReadingsCount(userId, Math.min(anonymousReadings, ANONYMOUS_FREE_READINGS_LIMIT) + additionalReadings);
                setDetailMessage('Previous readings transferred successfully');
                
                // Clear anonymous readings from localStorage
                localStorage.removeItem('freeReadingsUsed');
              } else {
                // If no anonymous readings, just add the additional free readings
                setDetailMessage('Adding your free readings...');
                const additionalReadings = FREE_READINGS_LIMIT - ANONYMOUS_FREE_READINGS_LIMIT;
                await updateUserReadingsCount(userId, additionalReadings);
                setDetailMessage('Free readings added to your account');
              }
            } else {
              setDetailMessage('Existing profile found, preparing your dashboard...');
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
        setDetailMessage('Verifying OAuth authentication...');
        
        try {
          // The Supabase client should handle this automatically
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            setDetailMessage('OAuth verification error: ' + error.message);
            throw error;
          }
          
          if (data?.session) {
            setDetailMessage('OAuth authentication verified successfully');
            
            // Check if we need to create a profile
            const userId = data.session.user.id;
            const userEmail = data.session.user.email || '';
            
            setDetailMessage('Checking user profile status...');
            const profile = await getUserProfile(userId);
            
            if (!profile) {
              setDetailMessage('Creating new user profile for OAuth login...');
              await createUserProfile(userId, userEmail);
              setDetailMessage('Profile created successfully');
              
              // Add free readings
              setDetailMessage('Adding your free readings...');
              await updateUserReadingsCount(userId, FREE_READINGS_LIMIT);
              setDetailMessage('Free readings added to your account');
            }
            
            setSuccess(true);
            setMessage('Authentication successful! Redirecting...');
            
            // Redirect to home page after successful authentication
            setTimeout(() => {
              window.location.href = '/';
            }, 3000);
          } else {
            setDetailMessage('No session found after OAuth verification');
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

  useEffect(() => {
    // Add a small delay to ensure the Supabase client is fully initialized
    const initDelay = setTimeout(() => {
      handleAuthCallback();
    }, 500);
    
    return () => clearTimeout(initDelay);
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
                <div className="absolute inset-0 rounded-full bg-purple-600 opacity-75 animate-ping"></div>
                <div className="absolute inset-2 rounded-full bg-purple-500 opacity-90 animate-pulse"></div>
                <div className="absolute inset-4 rounded-full bg-purple-400 opacity-100"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
                <p className="text-xl font-medium text-white mb-2">Login Successful!</p>
                <p className="text-lg text-fuchsia-300 mb-2">You now have 5 free readings!</p>
                <p className="text-sm text-gray-300">Thank you for confirming your email.</p>
            </div>
          )}
          <p className={`text-lg font-medium ${error ? 'text-red-400' : 'text-gray-300'}`}>
            {message}
          </p>
          {!error && !success && detailMessage && (
            <p className="text-sm text-purple-300 mt-2 animate-pulse">
              {detailMessage}
            </p>
          )}
          {error && (
            <button
              onClick={() => window.location.href = '/'}
              className="mt-6 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
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
