import React, { useEffect, useState } from 'react';
import { useAuthState } from '../hooks/useAuthState';
import { supabase } from '../services/supabase';
import ReactConfetti from 'react-confetti';
import { STRIPE_TEST_MODE } from '../config/constants';

const PaymentSuccess: React.FC = () => {
  const [message, setMessage] = useState<string>('Processing your payment...');
  const [error, setError] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [planType, setPlanType] = useState<string | null>(null);
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const { user } = useAuthState();
  
  // Function to fetch user profile and subscription details
  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      // Get user profile
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('plan_type, is_premium')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return;
      }
      
      if (userProfile) {
        setPlanType(userProfile.plan_type || (userProfile.is_premium ? 'premium' : 'basic'));
      }
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
    }
  };

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
    const verifyPayment = async () => {
      try {
        // Get the session ID from the URL
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get('session_id');
        
        if (!sessionId) {
          throw new Error('No session ID found in URL');
        }
        
        // Get the auth token
        const { data: sessionData } = await supabase.auth.getSession();
        let token = sessionData.session?.access_token;
        
        if (!token) {
          // If token is not found, try to refresh the session
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError || !refreshData.session) {
            console.error('Failed to refresh authentication session:', refreshError);
            throw new Error('Authentication token not found. Please sign in again.');
          }
          
          // Use the refreshed token
          token = refreshData.session.access_token;
        }
        
        // Check if the session ID starts with 'cs_test_' to determine if it's a test mode session
        const isTestMode = STRIPE_TEST_MODE || (sessionId && sessionId.startsWith('cs_test_'));
        
        console.log('Payment verification mode:', isTestMode ? 'TEST' : 'LIVE', 'Session ID:', sessionId);
        
        // Verify the payment with the server
        const response = await fetch('/.netlify/functions/verify-payment', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-stripe-test-mode': isTestMode ? 'true' : 'false'
          },
          body: JSON.stringify({ sessionId })
        });
        
        if (!response.ok) {
          let errorText;
          try {
            const errorJson = await response.json();
            errorText = errorJson.error || `HTTP error ${response.status}`;
          } catch (e) {
            errorText = await response.text();
          }
          
          throw new Error(`Failed to verify payment: ${errorText}`);
        }
        
        const result = await response.json();
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        // Payment was successful
        setSuccess(true);
        setMessage('Payment successful! Your account has been upgraded.');
        
        // Fetch user profile to get plan type
        await fetchUserProfile();
        
        // Redirect to home page after a delay
        setTimeout(() => {
          window.location.href = '/';
        }, 5000);
      } catch (err) {
        console.error('Error verifying payment:', err);
        setError(true);
        setMessage(err instanceof Error ? err.message : 'Failed to verify payment');
      }
    };

    if (user) {
      verifyPayment();
    } else {
      setError(true);
      setMessage('You must be logged in to verify your payment');
    }
  }, [user]);

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
          {error ? 'Payment Error' : success ? 'Payment Successful!' : 'Processing Payment'}
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
              <p className="text-xl font-medium text-white mb-2">Subscription Activated!</p>
              <p className="text-lg text-fuchsia-300 mb-2" id="subscription-message">
                {planType === 'premium' 
                  ? 'You now have unlimited readings!' 
                  : planType === 'basic' 
                    ? 'You now have 50 readings per month!' 
                    : 'Subscription activated successfully!'}
              </p>
              <p className="text-sm text-gray-300">Redirecting you to the home page...</p>
            </div>
          )}
          <p className={`text-lg ${error ? 'text-red-400' : 'text-gray-300'}`}>
            {message}
          </p>
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

export default PaymentSuccess;
