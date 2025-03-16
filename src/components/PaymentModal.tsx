import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { PricingPlan as BasePricingPlan } from '../types';
import { PAYMENT_PLANS } from '../config/plans';
import LoadingSpinner from './LoadingSpinner';
import { Check } from 'lucide-react';
import { STRIPE_TEST_MODE } from '../config/constants';

// Extend the PricingPlan type to include the interval property
interface PricingPlan extends BasePricingPlan {
  interval: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  isDarkMode: boolean;
  onClose: () => void;
  user: User | null;
  remainingReadings: number;
  onLoginRequired?: () => void;
  onSubscribe: (plan: BasePricingPlan) => Promise<void>;
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
      
      // Convert the extended PricingPlan back to BasePricingPlan before passing to onSubscribe
      const basePlan: BasePricingPlan = {
        id: plan.id,
        name: plan.name,
        price: plan.price,
        stripePriceId: plan.stripePriceId,
        description: plan.description,
        features: plan.features,
        readingsPerMonth: plan.readingsPerMonth,
        recommended: plan.recommended
      };
      
      await onSubscribe(basePlan);
      
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
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isOpen ? 'visible' : 'invisible'
      }`}
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      ></div>
      <div
        className={`relative w-full max-w-4xl rounded-lg shadow-xl ${
          isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
        } p-6 md:p-8 overflow-y-auto max-h-[90vh]`}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full ${
            isDarkMode
              ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
              : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Choose Your Subscription Plan
        </h2>

        {/* Display test mode warning if active */}
        {STRIPE_TEST_MODE && (
          <div className="bg-yellow-600 text-white p-3 rounded-lg mb-4 text-center font-bold">
            ⚠️ STRIPE TEST MODE ACTIVE - No real charges will be made
          </div>
        )}

        {/* Display remaining readings information */}
        <div className="mb-6 text-center">
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {remainingReadings > 0 ? (
              <>You have {remainingReadings} free readings remaining.</>
            ) : (
              <>You've used all your free readings!</>
            )}
          </p>
        </div>

        {/* Display error message if any */}
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(PAYMENT_PLANS as (BasePricingPlan & { interval?: string })[]).map((plan) => (
            <div
              key={plan.id}
              className={`border rounded-lg p-6 ${
                isDarkMode
                  ? 'border-indigo-500/30 bg-indigo-900/20 hover:bg-indigo-900/30'
                  : 'border-indigo-100 bg-indigo-50 hover:bg-indigo-100'
              } transition-colors duration-200 ${
                plan.recommended
                  ? isDarkMode
                    ? 'ring-2 ring-indigo-500'
                    : 'ring-2 ring-indigo-500'
                  : ''
              }`}
            >
              {plan.recommended && (
                <span
                  className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-4 ${
                    isDarkMode
                      ? 'bg-indigo-500/20 text-indigo-300'
                      : 'bg-indigo-100 text-indigo-800'
                  }`}
                >
                  Recommended
                </span>
              )}
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {plan.name}
              </h3>
              <div className="mt-2 mb-4">
                <span className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ${plan.price}
                </span>
                <span className={`ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  /{plan.interval || 'month'}
                </span>
              </div>
              <ul className="mb-6 space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check size={18} className={`mr-2 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  // Cast the plan to include the required interval property
                  const planWithInterval: PricingPlan = {
                    ...plan,
                    interval: plan.interval || 'month'
                  };
                  handleSubscribe(planWithInterval);
                }}
                disabled={isLoading || !user}
                className={`w-full py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
                  isDarkMode
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-indigo-800 disabled:text-indigo-200'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-gray-300 disabled:text-gray-500'
                }`}
              >
                {isLoading ? <LoadingSpinner size="small" /> : 'Subscribe Now'}
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
