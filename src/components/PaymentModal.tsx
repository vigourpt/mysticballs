import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { PricingPlan } from '../types';
import { PAYMENT_PLANS } from '../config/plans';
import LoadingSpinner from './LoadingSpinner';
import { Check } from 'lucide-react';
import { STRIPE_TEST_MODE } from '../config/constants';

interface PaymentModalProps {
  isOpen: boolean;
  isDarkMode: boolean;
  onClose: () => void;
  user: User | null;
  remainingReadings: number;
  onLoginRequired?: () => void;
  onSubscribe: (plan: PricingPlan) => Promise<void>;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  isDarkMode,
  onClose,
  user,
  remainingReadings,
  onLoginRequired,
  onSubscribe
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (plan: PricingPlan) => {
    if (!user) {
      onLoginRequired?.();
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Log the subscription attempt
      console.log('Attempting to subscribe to plan:', plan.id, 'with price ID:', plan.stripePriceId);
      
      // Add a small delay to ensure UI state is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await onSubscribe(plan);
      
      // If we get here, the subscription was initiated successfully
      console.log('Subscription initiated successfully, redirecting to Stripe');
    } catch (err) {
      console.error('Error subscribing:', err);
      
      // Provide more detailed error message
      let errorMessage = 'Failed to subscribe';
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Add more context for specific error types
        if (errorMessage.includes('network')) {
          errorMessage = 'Network error: Please check your internet connection and try again.';
        } else if (errorMessage.includes('stripe')) {
          errorMessage = 'Payment processing error: ' + errorMessage;
        } else if (errorMessage.includes('404')) {
          errorMessage = 'Server error: The payment service is currently unavailable. Please try again later.';
        } else if (errorMessage.includes('checkout')) {
          errorMessage = 'Payment setup error: ' + errorMessage;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isDarkMode ? 'dark' : ''}`}>
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          aria-label="Close"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-8">
          {STRIPE_TEST_MODE && (
            <div className="bg-yellow-600 text-white p-3 rounded-lg mb-4 text-center font-bold">
              ⚠️ STRIPE TEST MODE ACTIVE - No real charges will be made
            </div>
          )}
          <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Upgrade Your Spiritual Journey</h2>
          <p className={`${isDarkMode ? 'text-indigo-200' : 'text-gray-600'}`}>
            {remainingReadings > 0 ? (
              <>You have {remainingReadings} free readings remaining.</>
            ) : (
              <>You've used all your free readings!</>
            )}
          </p>
          <p className={`mt-2 ${isDarkMode ? 'text-indigo-300 font-medium' : 'text-indigo-600 font-medium'}`}>
            Subscribe now to continue your spiritual journey with premium features!
          </p>
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
              {error}
            </div>
          )}
          {!user && (
            <div className="mb-6 p-4 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
              <p className="text-indigo-700 dark:text-indigo-200">
                Please sign in to subscribe
              </p>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {PAYMENT_PLANS.map((plan: PricingPlan) => (
            <div
              key={plan.id}
              className={`${
                isDarkMode
                  ? 'bg-indigo-800/50 hover:bg-indigo-700/50'
                  : 'bg-white hover:bg-indigo-50'
              } rounded-xl p-6 shadow-lg transition-all duration-300 transform hover:scale-105`}
            >
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{plan.name}</h3>
              <div className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                ${plan.price}
                <span className={`text-sm ${
                  isDarkMode ? 'text-indigo-200' : 'text-gray-600'
                }`}>/month</span>
              </div>
              <p className={`mb-4 ${
                isDarkMode ? 'text-indigo-200' : 'text-gray-600'
              }`}>
                {plan.description}
              </p>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className={`w-5 h-5 mr-2 ${
                      isDarkMode ? 'text-indigo-300' : 'text-indigo-600'
                    }`} />
                    <span className={`${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan)}
                disabled={isLoading}
                className={`w-full py-2 px-4 rounded-lg ${
                  isDarkMode
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-indigo-500 hover:bg-indigo-600'
                } text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2`}
              >
                {isLoading ? (
                  <LoadingSpinner size="small" />
                ) : (
                  `Choose ${plan.name}`
                )}
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          disabled={isLoading}
          className={`mt-6 py-2 px-4 rounded-lg ${
            isDarkMode
              ? 'bg-gray-800 hover:bg-gray-700 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
          } transition-colors w-full disabled:opacity-50`}
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
};

export default PaymentModal;
