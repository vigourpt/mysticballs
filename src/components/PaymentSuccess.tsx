import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { createSubscription } from '../services/supabase';

interface PaymentSuccessProps {
  onComplete?: () => void;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const { user, refreshUserData } = useContext(UserContext);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        // Get the plan from the URL
        const url = new URL(window.location.href);
        const plan = url.searchParams.get('plan');
        const sessionId = url.searchParams.get('session_id');

        if (!user) {
          setVerificationStatus('error');
          setErrorMessage('User not authenticated');
          return;
        }

        console.log('Payment success page loaded', { plan, sessionId, userId: user.id });

        // If we have a session_id, verify with Stripe
        if (sessionId) {
          try {
            // Call the verify-payment function
            const response = await fetch('/.netlify/functions/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ sessionId, userId: user.id }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to verify payment');
            }

            const data = await response.json();
            if (!data.success) {
              throw new Error(data.error || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Error verifying payment with Stripe:', error);
            // Continue anyway - we'll create the subscription directly
          }
        }
        
        // Create subscription directly in Supabase if we have a plan
        if (plan) {
          try {
            console.log('Creating subscription directly for plan:', plan);
            await createSubscription(user.id, plan);
          } catch (error) {
            console.error('Error creating subscription directly:', error);
            setVerificationStatus('error');
            setErrorMessage('Failed to activate your subscription. Please contact support.');
            return;
          }
        }

        // Payment verification successful
        setVerificationStatus('success');
        
        // Refresh user data to get updated subscription status
        if (refreshUserData) {
          await refreshUserData();
        }
        
        // Call onComplete callback if provided
        if (onComplete) {
          onComplete();
        }
        
        // Redirect to home page after 5 seconds
        setTimeout(() => {
          navigate('/');
        }, 5000);
      } catch (error) {
        console.error('Error handling payment success:', error);
        setVerificationStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
      }
    };

    handlePaymentSuccess();
  }, [navigate, user, refreshUserData, onComplete]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900">
      <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8 shadow-2xl max-w-md w-full">
        {verificationStatus === 'pending' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-white mb-4">Activating Your Subscription</h2>
            <p className="text-gray-300">Please wait while we set up your subscription...</p>
          </div>
        )}

        {verificationStatus === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Payment Successful!</h2>
            <p className="text-gray-300 mb-6">Thank you for your purchase. Your subscription has been activated.</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Return to Home
            </button>
          </div>
        )}

        {verificationStatus === 'error' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Payment Verification Failed</h2>
            <p className="text-gray-300 mb-2">We encountered an issue while verifying your payment:</p>
            <p className="text-red-300 mb-6">{errorMessage || 'Unknown error'}</p>
            <p className="text-gray-300 mb-6">Please contact our support team for assistance.</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Return to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
