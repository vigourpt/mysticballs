import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

interface PaymentSuccessProps {
  onComplete?: () => void;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const { user, refreshUserData } = useContext(UserContext);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get the session_id from the URL
        const url = new URL(window.location.href);
        const sessionId = url.searchParams.get('session_id');

        if (!sessionId) {
          setVerificationStatus('error');
          setErrorMessage('No session ID found in URL');
          return;
        }

        if (!user) {
          setVerificationStatus('error');
          setErrorMessage('User not authenticated');
          return;
        }

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

        if (data.success) {
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
        } else {
          setVerificationStatus('error');
          setErrorMessage(data.error || 'Payment verification failed');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setVerificationStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
      }
    };

    verifyPayment();
  }, [navigate, user, refreshUserData, onComplete]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900">
      <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8 shadow-2xl max-w-md w-full">
        {verificationStatus === 'pending' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-white mb-4">Verifying Your Payment</h2>
            <p className="text-gray-300">Please wait while we confirm your payment with our payment provider...</p>
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
            <div className="relative">
              <div className="absolute -inset-1 bg-fuchsia-500/30 blur-md rounded-lg"></div>
              <button
                onClick={() => navigate('/')}
                className="relative bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-fuchsia-600 transition-all duration-300 w-full"
              >
                Return to Home
              </button>
            </div>
            <p className="text-gray-400 mt-4 text-sm">You will be redirected automatically in 5 seconds...</p>
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
            <p className="text-gray-300 mb-2">We encountered an error while verifying your payment:</p>
            <p className="text-red-400 mb-6">{errorMessage || 'Unknown error'}</p>
            <div className="relative">
              <div className="absolute -inset-1 bg-fuchsia-500/30 blur-md rounded-lg"></div>
              <button
                onClick={() => navigate('/')}
                className="relative bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-fuchsia-600 transition-all duration-300 w-full"
              >
                Return to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
