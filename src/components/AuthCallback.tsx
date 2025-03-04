import React, { useEffect, useState } from 'react';
import { supabase, createUserProfile, getUserProfile } from '../services/supabase';

const AuthCallback: React.FC = () => {
  const [message, setMessage] = useState<string>('Processing authentication...');
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // First, explicitly exchange the auth code for a session
        // This is needed for the email confirmation flow
        const url = window.location.href;
        
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
              
              setMessage('Authentication successful! Redirecting...');
              // Redirect to home page after successful authentication
              setTimeout(() => {
                window.location.href = '/';
              }, 2000);
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
            setMessage('Authentication successful! Redirecting...');
            // Redirect to home page after successful authentication
            setTimeout(() => {
              window.location.href = '/';
            }, 2000);
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
            setMessage('Authentication successful! Redirecting...');
            // Redirect to home page after successful authentication
            setTimeout(() => {
              window.location.href = '/';
            }, 2000);
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
