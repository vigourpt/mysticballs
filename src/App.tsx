import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Session, User } from '@supabase/supabase-js';

import Header from './components/Header';
import Footer from './components/Footer';
import ReadingTypeCard from './components/ReadingTypeCard';
import ReadingForm from './components/ReadingForm';
import ReadingOutput from './components/ReadingOutput';
import ReadingHistory from './components/ReadingHistory';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentCancel from './components/PaymentCancel';
import PaymentModal from './components/PaymentModal';
import LoginModal from './components/LoginModal';
import BackgroundEffects from './components/BackgroundEffects';
import { READING_TYPES } from './data/readingTypes';
import { PricingPlan, ReadingType, ReadingTypeId } from './types';
import { UserContext } from './context/UserContext';
import { createCheckoutSession } from './services/stripe';
import { supabase, incrementReadingCount, incrementFreeReadingUsed, syncAnonymousReadings } from './services/supabase';

interface UserProfile {
  is_premium: boolean;
  is_admin?: boolean;
}

interface UserContextProps {
  user: User | null;
  profile: UserProfile | null;
  signOut: () => Promise<boolean>;
  refreshUserData: () => Promise<void>;
  readingsRemaining: number;
}

const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, refreshUserData, readingsRemaining } = useContext(UserContext) as UserContextProps;
  
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedReadingType, setSelectedReadingType] = useState<ReadingType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<string | null>(null);
  const [readingResult, setReadingResult] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  
  // Set initial reading type and page
  useEffect(() => {
    if (location.pathname === '/') {
      setCurrentPage('home');
    } else if (location.pathname.startsWith('/reading/')) {
      setCurrentPage('reading');
      
      // Find the reading type from the URL
      const readingTypeId = location.pathname.split('/').pop() as ReadingTypeId;
      const foundReadingType = READING_TYPES.find(rt => rt.id === readingTypeId);
      
      if (foundReadingType && !selectedReadingType) {
        setSelectedReadingType(foundReadingType);
      }
    }
    
    // Check for auth session
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!error && data.session) {
        setSession(data.session);
      }
    };
    
    getSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [location.pathname, selectedReadingType]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('darkMode', (!isDarkMode).toString());
  };

  // Load dark mode preference from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setIsDarkMode(savedDarkMode === 'true');
    }
    
    // Apply dark mode class to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Sync anonymous readings when user signs in
  useEffect(() => {
    if (user && localStorage.getItem('freeReadingsUsed')) {
      // Sync anonymous readings with user account
      syncAnonymousReadings(user.id).catch(error => {
        console.error('Error syncing anonymous readings:', error);
      });
    }
  }, [user]);

  // Function to handle subscription
  const handleSubscribe = async (plan: PricingPlan) => {
    try {
      if (!user) {
        toast.error('Please sign in to subscribe');
        setIsLoginModalOpen(true);
        setIsSubscriptionModalOpen(false);
        return;
      }
      
      // Use the stripePriceId directly from the plan object
      const priceId = plan.stripePriceId;
      
      await createCheckoutSession(
        priceId,
        user.id,
        user.email || ''
      );
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast.error(error.message || 'Failed to process subscription');
    }
  };

  // Function to get free readings used from localStorage
  const getFreeReadingsUsed = (): number => {
    const count = localStorage.getItem('freeReadingsUsed');
    return count ? parseInt(count, 10) : 0;
  };

  // Function to handle reading submission
  const handleReadingSubmission = async (formInputs: Record<string, string>) => {
    if (!selectedReadingType) return;
    
    try {
      setIsLoading(true);
      
      // Check if user has readings remaining
      if (user) {
        // For signed-in users, increment reading count in database
        if (profile && !profile.is_premium) {
          // Only increment for non-premium users
          await incrementReadingCount(user.id);
          // Refresh user data to update readings count
          await refreshUserData();
        }
      } else {
        // For non-signed-in users, increment local storage count
        const remaining = incrementFreeReadingUsed();
        if (remaining <= 0) {
          toast.info('You have used all your free readings. Sign in for more!', {
            autoClose: 5000
          });
        }
      }
      
      // Call the Netlify function to generate a reading
      const response = await fetch('/.netlify/functions/getReading', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user && session ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({
          readingType: selectedReadingType.id,
          userInput: formInputs,
          isAnonymous: !user,
          anonymousReadingsUsed: !user ? getFreeReadingsUsed() : 0
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to generate reading' }));
        throw new Error(errorData.error || 'Failed to generate reading');
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      toast.success(`Your ${selectedReadingType.name} reading has been generated!`);
      setReadingResult(data.reading);
    } catch (error: any) {
      console.error('Error submitting reading:', error);
      toast.error(error.message || 'Failed to generate reading');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle privacy and terms clicks
  const handlePrivacyClick = () => {
    // Implement privacy policy navigation or modal
    console.log('Privacy policy clicked');
  };

  const handleTermsClick = () => {
    // Implement terms of service navigation or modal
    console.log('Terms of service clicked');
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900 text-white bg-gradient-dark' : 'bg-gray-100 text-gray-900 bg-gradient-light'}`}>
      <BackgroundEffects isDarkMode={isDarkMode} />
      
      <Header 
        isDarkMode={isDarkMode} 
        onDarkModeToggle={toggleDarkMode}
        user={user}
        onSignOut={signOut}
        onLogin={() => setIsLoginModalOpen(true)}
        onManageSubscription={() => setIsSubscriptionModalOpen(true)}
        onSubscribe={() => setIsSubscriptionModalOpen(true)}
        onViewReadingHistory={() => navigate('/history')}
        onViewAdminDashboard={profile?.is_admin ? () => navigate('/admin') : undefined}
      />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h1 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                  Mystic Balls
                </h1>
                <p className={`text-xl ${isDarkMode ? 'text-indigo-200' : 'text-indigo-800'}`}>
                  Discover insights and guidance through various mystical practices
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {READING_TYPES.map((readingType) => (
                  <ReadingTypeCard
                    key={readingType.id}
                    readingType={readingType}
                    isDarkMode={isDarkMode}
                    onClick={() => {
                      setSelectedReadingType(readingType);
                      navigate(`/reading/${readingType.id}`);
                    }}
                  />
                ))}
              </div>
            </div>
          } />

          <Route path="/reading/:readingTypeId" element={
            selectedReadingType ? (
              <div className="max-w-4xl mx-auto">
                <button
                  onClick={() => navigate('/')}
                  className="mb-8 flex items-center gap-2 px-4 py-2 text-white bg-indigo-900/40 hover:bg-indigo-900/60 rounded-lg transition-colors"
                >
                  <span>←</span>
                  Back to Reading Types
                </button>
                
                {readingResult ? (
                  // Display reading result using ReadingOutput component
                  <>
                    <ReadingOutput 
                      readingType={selectedReadingType}
                      isDarkMode={isDarkMode}
                      reading={readingResult}
                      isLoading={false}
                    />
                    <div className="flex justify-between mt-6">
                      <button
                        onClick={() => setReadingResult(null)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        New Reading
                      </button>
                      
                      <button
                        onClick={() => {
                          // Save reading to history if user is logged in
                          // For now just navigate to home
                          navigate('/');
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  </>
                ) : (
                  // Show reading form if no result yet
                  <ReadingForm
                    readingType={selectedReadingType}
                    onSubmit={handleReadingSubmission}
                    isDarkMode={isDarkMode}
                    isLoading={isLoading}
                  />
                )}
              </div>
            ) : <Navigate to="/" replace />
          } />

          <Route path="/history" element={
            user ? <ReadingHistory isDarkMode={isDarkMode} onBack={() => navigate('/')} /> : <Navigate to="/" replace />
          } />
          
          <Route path="/payment/success" element={
            <PaymentSuccess onComplete={() => navigate('/')} />
          } />
          
          <Route path="/payment/cancel" element={
            <PaymentCancel />
          } />
        </Routes>
      </main>
      
      <Footer 
        isDarkMode={isDarkMode} 
        onPrivacyClick={handlePrivacyClick}
        onTermsClick={handleTermsClick}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={isDarkMode ? 'dark' : 'light'}
      />
      
      {/* Login Modal */}
      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}
      
      {/* Subscription Modal */}
      {isSubscriptionModalOpen && (
        <PaymentModal
          isOpen={isSubscriptionModalOpen}
          onClose={() => setIsSubscriptionModalOpen(false)}
          isDarkMode={isDarkMode}
          user={user}
          remainingReadings={readingsRemaining}
          onLoginRequired={() => {
            setIsLoginModalOpen(true);
            setIsSubscriptionModalOpen(false);
          }}
          onSubscribe={handleSubscribe}
        />
      )}
    </div>
  );
};

export default App;
