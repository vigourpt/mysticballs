import React, { useState, useContext } from 'react';
import { User } from '@supabase/supabase-js';
import { UserContext } from '../context/UserContext';

interface HeaderProps {
  user: User | null;
  isDarkMode: boolean;
  onDarkModeToggle: () => void;
  onSignOut: () => void;
  onLogin: () => void;
  onManageSubscription: () => void;
  onSubscribe: () => void;
  onViewReadingHistory: () => void;
  onViewAdminDashboard?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  user,
  isDarkMode,
  onDarkModeToggle,
  onSignOut,
  onLogin,
  onManageSubscription,
  onSubscribe,
  onViewReadingHistory,
  onViewAdminDashboard
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { profile, subscription, readingsRemaining } = useContext(UserContext);
  
  // Determine subscription status from context
  const isPremium = profile?.is_premium || false;
  const subscriptionStatus = subscription?.status || 'inactive';
  const planType = profile?.plan_type || 'basic';
  
  // Function to get subscription badge text
  const getSubscriptionBadge = () => {
    if (isPremium && subscriptionStatus === 'active') {
      return 'Premium';
    } else if (planType === 'basic' && subscriptionStatus === 'active') {
      return 'Basic';
    } else {
      return 'Free';
    }
  };

  // Function to display readings remaining
  const getReadingsDisplay = () => {
    if (isPremium) {
      return 'Unlimited';
    } else if (readingsRemaining === Infinity) {
      return 'Unlimited';
    } else {
      return readingsRemaining;
    }
  };

  return (
    <header className="bg-opacity-30 backdrop-blur-md bg-black fixed w-full z-50 transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <div className="relative">
                <div className="absolute -inset-1 bg-fuchsia-500/30 blur-md rounded-full"></div>
                <div className="relative">
                  <span className="text-2xl font-bold text-white">
                    <span className="text-fuchsia-400">Mystic</span>
                    <span className="text-purple-300">Balls</span>
                  </span>
                </div>
              </div>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={onDarkModeToggle}
              className="p-2 rounded-full hover:bg-gray-700/30 transition-colors"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {user ? (
              <>
                {/* Subscription Badge */}
                <div className="flex items-center">
                  <span 
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isPremium 
                        ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white' 
                        : planType === 'basic' && subscriptionStatus === 'active'
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                          : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {getSubscriptionBadge()}
                  </span>
                </div>

                {/* Readings Remaining Badge */}
                <div className="flex items-center">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-900/60 text-white">
                    {getReadingsDisplay()} {readingsRemaining !== Infinity ? 'Readings Left' : ''}
                  </span>
                </div>

                {/* Reading History Button - Only show for premium users */}
                {isPremium && (
                  <button
                    onClick={onViewReadingHistory}
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700/30 transition-colors"
                  >
                    Reading History
                  </button>
                )}

                {/* Admin Dashboard Button - Only show for admin users */}
                {profile?.is_admin && onViewAdminDashboard && (
                  <button
                    onClick={onViewAdminDashboard}
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700/30 transition-colors"
                  >
                    Admin Dashboard
                  </button>
                )}

                {/* Manage Subscription or Upgrade Button */}
                <button
                  onClick={onManageSubscription}
                  className={`text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700/30 transition-colors ${
                    subscriptionStatus === 'active' ? '' : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                  }`}
                >
                  {subscriptionStatus === 'active' ? 'Manage Subscription' : 'Upgrade'}
                </button>

                {/* Sign Out Button */}
                <button
                  onClick={onSignOut}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700/30 transition-colors"
                >
                  Sign Out
                </button>

                {/* User Avatar with Email and Readings */}
                <div className="relative ml-3 group">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 flex items-center justify-center text-white font-medium">
                    {user.email ? user.email.charAt(0).toUpperCase() : '?'}
                  </div>
                  
                  {/* Tooltip with user info */}
                  <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-lg p-4 z-50 hidden group-hover:block">
                    <p className="text-white text-sm mb-2">
                      <span className="font-semibold">Email:</span> {user.email}
                    </p>
                    <p className="text-white text-sm">
                      <span className="font-semibold">Readings Left:</span> {
                        isPremium ? 
                          'Unlimited' : 
                          profile?.readings_remaining !== undefined ? 
                            profile.readings_remaining : 
                            'Loading...'
                      }
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Readings Remaining Badge for non-signed-in users */}
                <div className="flex items-center">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-900/60 text-white mr-2">
                    {readingsRemaining} Free Readings Left
                  </span>
                </div>
                
                {/* Sign In Button */}
                <button
                  onClick={onLogin}
                  className="text-white bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Sign In
                </button>

                {/* Subscribe Button */}
                <button
                  onClick={onSubscribe}
                  className="bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-purple-600 hover:to-fuchsia-600 transition-colors"
                >
                  Subscribe
                </button>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white p-2"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-black bg-opacity-90 backdrop-blur-md">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={onDarkModeToggle}
              className="w-full text-left flex items-center text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700/30 transition-colors"
            >
              {isDarkMode ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Switch to Light Mode
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  Switch to Dark Mode
                </>
              )}
            </button>

            {user ? (
              <>
                {/* Subscription Badge */}
                <div className="flex items-center px-3 py-2">
                  <span 
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isPremium 
                        ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white' 
                        : planType === 'basic' && subscriptionStatus === 'active'
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                          : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {getSubscriptionBadge()}
                  </span>
                </div>

                {/* Readings Remaining Badge for mobile - signed-in users */}
                <div className="w-full text-left px-3 py-2 text-base font-medium">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-900/60 text-white">
                    {getReadingsDisplay()} {readingsRemaining !== Infinity ? 'Readings Left' : ''}
                  </span>
                </div>

                {/* Reading History Button - Only show for premium users */}
                {isPremium && (
                  <button
                    onClick={() => {
                      onViewReadingHistory();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700/30 transition-colors"
                  >
                    Reading History
                  </button>
                )}

                {/* Admin Dashboard Button - Only show for admin users */}
                {profile?.is_admin && onViewAdminDashboard && (
                  <button
                    onClick={() => {
                      onViewAdminDashboard();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700/30 transition-colors"
                  >
                    Admin Dashboard
                  </button>
                )}

                {/* Manage Subscription or Upgrade Button */}
                <button
                  onClick={() => {
                    onManageSubscription();
                    setIsMenuOpen(false);
                  }}
                  className={`w-full text-left text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700/30 transition-colors ${
                    subscriptionStatus === 'active' ? '' : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                  }`}
                >
                  {subscriptionStatus === 'active' ? 'Manage Subscription' : 'Upgrade'}
                </button>

                {/* Sign Out Button */}
                <button
                  onClick={() => {
                    onSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700/30 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                {/* Readings Remaining Badge for mobile - non-signed-in users */}
                <div className="w-full text-left px-3 py-2 text-base font-medium">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-900/60 text-white">
                    {readingsRemaining} Free Readings Left
                  </span>
                </div>
                
                {/* Sign In Button */}
                <button
                  onClick={() => {
                    onLogin();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700/30 transition-colors"
                >
                  Sign In
                </button>

                {/* Subscribe Button */}
                <button
                  onClick={() => {
                    onSubscribe();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white px-3 py-2 rounded-md text-base font-medium hover:from-purple-600 hover:to-fuchsia-600 transition-colors"
                >
                  Subscribe
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
