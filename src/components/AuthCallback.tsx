import React, { useEffect, useState } from 'react';
import { supabase, createUserProfile, getUserProfile } from '../services/supabase';
import ReactConfetti from 'react-confetti';

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
        // First, explicitly exchange the auth code for a session
        // This is needed for the email confirmation flow
        
        // Check if we have a hash fragment (OAuth) or a code query param (email confirmation)
        const hashFragment = window.location.hash;
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        
        if (code) {
          // This is an email confirmation flow
          setMessage('Confirming your email...');
          
          // Exchange the code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            throw error;
          }
          
          if (data?.session) {
            setMessage('Email confirmed! Setting up your account...');
            
            // Check if user profile exists, create if it doesn't
            const userId = data.session.user.id;
            const email = data.session.user.email || '';
            
            try {
              // Try to get existing profile
              const profile = await getUserProfile(userId);
              
              if (!profile) {
                // Create profile if it doesn't exist
                setMessage('Creating your profile...');
                await createUserProfile(userId, email);
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
              setMessage('Authentication successful! Redirecting...');
              setTimeout(() => {
                window.location.href = '/';
              }, 2000);
            }
          } else {
            throw new Error('No session found after code exchange');
          }
        } else if (hashFragment) {
          // This is an OAuth flow with hash fragment
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
        } else {
          // No code or hash fragment, just check if we have a session
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
