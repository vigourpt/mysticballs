import React, { useState, useEffect, useContext } from 'react';
import { User } from '@supabase/supabase-js';
import { Subscription, getSubscription, cancelSubscription } from '../services/supabase';
import { UserContext } from '../context/UserContext';
import LoadingSpinner from './LoadingSpinner';

interface SubscriptionManagerProps {
  user: User;
  isDarkMode: boolean;
  onClose: () => void;
}

// Define a type for the raw subscription data from the database
interface SubscriptionData {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string; // This is a string in the database, not the union type
  plan_id: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ user, isDarkMode, onClose }) => {
  const { refreshUserData } = useContext(UserContext);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        try {
          console.log('Fetching subscription from database for user:', user.id);
          // Cast the return type to SubscriptionData since that's what actually comes from the database
          const subscriptionData = await getSubscription(user.id) as unknown as SubscriptionData | null;
          console.log('Subscription data retrieved:', subscriptionData);
          
          if (subscriptionData) {
            const validStatus = ['active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid'];
            const status = validStatus.includes(subscriptionData.status) 
              ? subscriptionData.status as Subscription['status']
              : 'canceled';
            
            // Create a properly typed Subscription object
            const typedSubscription: Subscription = {
              ...subscriptionData,
              status
            };
            
            setSubscription(typedSubscription);
          } else {
            setSubscription(null);
          }
        } catch (fetchError) {
          console.error('Error fetching subscription:', fetchError);
          setError('Failed to fetch subscription details. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, [user.id]);

  const handleCancelSubscription = async () => {
    if (!subscription) return;
    
    try {
      setIsCancelling(true);
      setError(null);
      
      await cancelSubscription(subscription.id);
      
      // Update the subscription status
      if (subscription) {
        const updatedSubscription: Subscription = {
          ...subscription,
          cancel_at_period_end: true
        };
        
        setSubscription(updatedSubscription);
        setSuccessMessage('Your subscription has been canceled and will end at the end of your current billing period.');
        
        // Refresh the subscription in the context
        refreshUserData();
      }
    } catch (cancelError: any) {
      console.error('Error canceling subscription:', cancelError);
      setError(cancelError.message || 'Failed to cancel subscription. Please try again later.');
    } finally {
      setIsCancelling(false);
      setShowConfirmation(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getPlanName = (planId: string) => {
    switch (planId) {
      case 'price_1R0CJxG3HGXKeksqy7NYmuh8':
        return 'Basic';
      case 'price_1R0CKrG3HGXKeksqjeKEA1ox':
        return 'Premium';
      case 'price_1QKja1G3HGXKeksqUqC0edF0':
        return 'Premium (Production)';
      case 'price_1QKjTIG3HGXKeksq3NJSoxfN':
        return 'Basic (Production)';
      default:
        return planId;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'canceled':
        return 'bg-red-500';
      case 'past_due':
        return 'bg-yellow-500';
      case 'incomplete':
      case 'incomplete_expired':
        return 'bg-orange-500';
      case 'trialing':
        return 'bg-blue-500';
      case 'unpaid':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className={`p-6 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Subscription Management
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <LoadingSpinner size="medium" showSlowLoadingMessage={true} />
        </div>
      ) : error ? (
        <div className={`p-4 rounded-md ${isDarkMode ? 'bg-red-900/30 text-red-200' : 'bg-red-100 text-red-800'} mb-4`}>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className={`mt-2 px-4 py-2 rounded-md ${isDarkMode ? 'bg-red-700 hover:bg-red-600' : 'bg-red-600 hover:bg-red-700'} text-white`}
          >
            Retry
          </button>
        </div>
      ) : successMessage ? (
        <div className={`p-4 rounded-md ${isDarkMode ? 'bg-green-900/30 text-green-200' : 'bg-green-100 text-green-800'} mb-4`}>
          <p>{successMessage}</p>
          <button
            onClick={onClose}
            className={`mt-2 px-4 py-2 rounded-md ${isDarkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'} text-white`}
          >
            Close
          </button>
        </div>
      ) : subscription ? (
        <div>
          <div className={`p-4 rounded-md ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-6`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Plan</p>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {getPlanName(subscription.plan_id)}
                </p>
              </div>
              
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status</p>
                <div className="flex items-center">
                  <span className={`inline-block w-3 h-3 rounded-full ${getStatusBadgeColor(subscription.status)} mr-2`}></span>
                  <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                    {subscription.cancel_at_period_end && ' (Cancels at period end)'}
                  </p>
                </div>
              </div>
              
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current Period Started</p>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {formatDate(subscription.current_period_start)}
                </p>
              </div>
              
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current Period Ends</p>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {formatDate(subscription.current_period_end)}
                </p>
              </div>
            </div>
          </div>
          
          {subscription.status === 'active' && !subscription.cancel_at_period_end && (
            <div className="flex flex-col space-y-4">
              {showConfirmation ? (
                <div className={`p-4 rounded-md ${isDarkMode ? 'bg-red-900/30' : 'bg-red-100'} mb-4`}>
                  <p className={`mb-4 ${isDarkMode ? 'text-red-200' : 'text-red-800'}`}>
                    Are you sure you want to cancel your subscription? You'll still have access until the end of your current billing period.
                  </p>
                  <div className="flex space-x-4">
                    <button
                      onClick={handleCancelSubscription}
                      disabled={isCancelling}
                      className={`px-4 py-2 rounded-md ${isDarkMode ? 'bg-red-700 hover:bg-red-600' : 'bg-red-600 hover:bg-red-700'} text-white disabled:opacity-50`}
                    >
                      {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
                    </button>
                    <button
                      onClick={() => setShowConfirmation(false)}
                      className={`px-4 py-2 rounded-md ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
                    >
                      No, Keep Subscription
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowConfirmation(true)}
                  className={`px-4 py-2 rounded-md ${isDarkMode ? 'bg-red-700 hover:bg-red-600' : 'bg-red-600 hover:bg-red-700'} text-white`}
                >
                  Cancel Subscription
                </button>
              )}
              
              <button
                onClick={() => {
                  // Implement update payment method functionality
                  console.log('Update payment method clicked');
                }}
                className={`px-4 py-2 rounded-md ${isDarkMode ? 'bg-indigo-700 hover:bg-indigo-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white`}
              >
                Update Payment Method
              </button>
            </div>
          )}
          
          {subscription.status === 'active' && subscription.cancel_at_period_end && (
            <div className="mt-4">
              <button
                onClick={async () => {
                  // Implement reactivate subscription functionality
                  console.log('Reactivate subscription clicked');
                }}
                className={`px-4 py-2 rounded-md ${isDarkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'} text-white`}
              >
                Reactivate Subscription
              </button>
            </div>
          )}
          
          {['past_due', 'incomplete', 'unpaid'].includes(subscription.status) && (
            <div className="mt-4">
              <button
                onClick={() => {
                  // Implement update payment method functionality for past due subscriptions
                  console.log('Update payment for past due subscription');
                }}
                className={`px-4 py-2 rounded-md ${isDarkMode ? 'bg-yellow-700 hover:bg-yellow-600' : 'bg-yellow-600 hover:bg-yellow-700'} text-white`}
              >
                Update Payment Information
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className={`p-4 rounded-md ${isDarkMode ? 'bg-blue-900/30 text-blue-200' : 'bg-blue-100 text-blue-800'} mb-4`}>
          <p>You don't have an active subscription.</p>
          <button
            onClick={onClose}
            className={`mt-2 px-4 py-2 rounded-md ${isDarkMode ? 'bg-indigo-700 hover:bg-indigo-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white`}
          >
            Subscribe Now
          </button>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManager;
