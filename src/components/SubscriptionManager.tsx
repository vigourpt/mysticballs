import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Subscription, getSubscription, cancelSubscription, supabase } from '../services/supabase';
import LoadingSpinner from './LoadingSpinner';

interface SubscriptionManagerProps {
  user: User;
  isDarkMode: boolean;
  onClose: () => void;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ user, isDarkMode, onClose }) => {
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
        
        const subscriptionData = await getSubscription(user.id);
        setSubscription(subscriptionData);
      } catch (err) {
        console.error('Error fetching subscription:', err);
        setError('Failed to load subscription information. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
    
    // Set up real-time subscription for updates
    const subscription = supabase
      .channel('subscription-status')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'subscriptions', filter: `user_id=eq.${user.id}` }, 
        (payload) => {
          console.log('Subscription status updated:', payload.new);
          setSubscription(payload.new as Subscription);
        }
      )
      .subscribe();

    // Clean up subscription when component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, [user.id]);

  const handleCancelSubscription = async () => {
    if (!subscription || !subscription.stripe_subscription_id) return;
    
    try {
      setIsCancelling(true);
      setError(null);
      
      await cancelSubscription(subscription.stripe_subscription_id);
      
      // Update the local subscription state
      setSubscription({
        ...subscription,
        cancel_at_period_end: true
      });
      
      setSuccessMessage('Your subscription has been canceled and will end at the end of your current billing period.');
      setShowConfirmation(false);
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      setError('Failed to cancel subscription. Please try again later.');
    } finally {
      setIsCancelling(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPlanName = (planId: string) => {
    // Extract plan name from the plan ID
    // Example: price_1NxYZ2... => Basic Plan
    if (planId.includes('basic')) return 'Basic Plan';
    if (planId.includes('premium')) return 'Premium Plan';
    return 'Subscription Plan';
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-500';
      case 'canceled':
        return 'bg-red-500/20 text-red-500';
      case 'past_due':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'unpaid':
        return 'bg-red-500/20 text-red-500';
      case 'trialing':
        return 'bg-blue-500/20 text-blue-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isDarkMode ? 'dark' : ''}`}>
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          aria-label="Close"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Subscription Management
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="bg-red-500/10 text-red-500 p-4 rounded-lg mb-4">
            {error}
          </div>
        ) : !subscription ? (
          <div className="text-center py-6">
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
              You don't have an active subscription.
            </p>
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg ${
                isDarkMode
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'bg-indigo-500 hover:bg-indigo-600'
              } text-white transition-colors`}
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {successMessage && (
              <div className="bg-green-500/10 text-green-500 p-4 rounded-lg mb-4">
                {successMessage}
              </div>
            )}
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Plan</span>
                <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {getPlanName(subscription.plan_id)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Status</span>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(subscription.status)}`}>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Current Period Ends</span>
                <span className={`${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {formatDate(subscription.current_period_end)}
                </span>
              </div>
              
              {subscription.cancel_at_period_end && (
                <div className="bg-yellow-500/10 text-yellow-500 p-3 rounded-lg text-sm">
                  Your subscription is set to cancel at the end of the current billing period.
                </div>
              )}
            </div>
            
            {!subscription.cancel_at_period_end && !showConfirmation && (
              <button
                onClick={() => setShowConfirmation(true)}
                className={`w-full py-2 px-4 rounded-lg ${
                  isDarkMode
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-red-500 hover:bg-red-600'
                } text-white transition-colors`}
              >
                Cancel Subscription
              </button>
            )}
            
            {showConfirmation && (
              <div className="space-y-4">
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Are you sure you want to cancel your subscription? You'll continue to have access until the end of your current billing period.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className={`flex-1 py-2 px-4 rounded-lg ${
                      isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-gray-200 hover:bg-gray-300'
                    } ${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors`}
                  >
                    Keep Subscription
                  </button>
                  <button
                    onClick={handleCancelSubscription}
                    disabled={isCancelling}
                    className={`flex-1 py-2 px-4 rounded-lg ${
                      isDarkMode
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-red-500 hover:bg-red-600'
                    } text-white transition-colors disabled:opacity-50 flex items-center justify-center`}
                  >
                    {isCancelling ? (
                      <>
                        <LoadingSpinner size="small" />
                        <span className="ml-2">Processing...</span>
                      </>
                    ) : (
                      'Confirm Cancellation'
                    )}
                  </button>
                </div>
              </div>
            )}
            
            <button
              onClick={onClose}
              className={`mt-4 w-full py-2 px-4 rounded-lg ${
                isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-gray-200 hover:bg-gray-300'
              } ${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors`}
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SubscriptionManager;
