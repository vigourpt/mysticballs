import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Session, User } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

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
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import FAQ from './components/FAQ';
import TutorialButton from './components/TutorialButton';
import TourGuide from './components/TourGuide';
import OnboardingOverlay from './components/OnboardingOverlay';
import ReadingTypeInfo from './components/ReadingTypeInfo';
import { READING_TYPES } from './data/readingTypes';
import { PricingPlan, ReadingType, ReadingTypeId, Step } from './types';
import { UserContext } from './context/UserContext';
import { createCheckoutSession } from './services/stripe';
import { supabase, incrementAnonymousReadingCount, syncAnonymousReadings } from './services/supabase';
import { ONBOARDING_STEPS } from './config/tutorial';
import { getApiUrl } from './utils/api';

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
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  
  // Helper function to generate a unique device ID for anonymous users
  const generateDeviceId = (): string => {
    const deviceId = uuidv4();
    localStorage.setItem('mysticballs_device_id', deviceId);
    return deviceId;
  };

  // Initialize device ID on app load if not already set
  const initializeDeviceId = (): string => {
    const existingDeviceId = localStorage.getItem('mysticballs_device_id');
    if (existingDeviceId) {
      return existingDeviceId;
    }
    return generateDeviceId();
  };

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

  // Function to handle reading submission
  const handleSubmitReading = async (formInputs: Record<string, string>) => {
    if (!selectedReadingType) return;
    
    try {
      setIsLoading(true);
      setReadingResult(null);
      
      // For non-signed-in users, increment local storage count before making the API call
      // This ensures the count is updated even if the API call fails
      let anonymousReadingsUsed = 0;
      if (!user) {
        anonymousReadingsUsed = parseInt(localStorage.getItem('mysticballs_free_readings_used') || '0', 10);
        // Only increment if we're about to make a successful API call
        const remaining = await incrementAnonymousReadingCount();
        // Update the readingsRemaining in the parent context
        await refreshUserData();
        if (remaining <= 0) {
          toast.info('You have used all your free readings. Sign in for more!', {
            autoClose: 5000
          });
        }
      } else {
        // For signed-in users, the count will be updated in the backend
        // But we need to refresh the user data to get the updated count
        await refreshUserData();
      }
      
      // Call the Netlify function to generate a reading
      const response = await fetch(getApiUrl('/.netlify/functions/getReading'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user && session ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({
          readingType: selectedReadingType.id,
          userInput: formInputs,
          isAnonymous: !user,
          anonymousReadingsUsed: anonymousReadingsUsed,
          deviceId: initializeDeviceId()
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to generate reading' }));
        console.error('Reading generation failed with status:', response.status, errorData);
        
        // Handle specific error cases
        if (response.status === 401) {
          // Auth error - try to refresh the session
          const { error } = await supabase.auth.refreshSession();
          if (error) {
            console.error('Session refresh failed:', error);
            // If refresh fails, redirect to login
            setIsLoginModalOpen(true);
          } else {
            // Retry with the new session
            toast.info('Session refreshed. Please try again.');
          }
        } else if (response.status === 402) {
          // Payment required - show subscription modal
          setIsSubscriptionModalOpen(true);
          toast.info('You need to upgrade to continue using this feature.');
        } else {
          throw new Error(errorData.error || `Failed to generate reading (${response.status})`);
        }
        
        setIsLoading(false);
        return;
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
    setCurrentPage('privacy');
    navigate('/privacy');
  };

  const handleTermsClick = () => {
    setCurrentPage('terms');
    navigate('/terms');
  };

  // Add tutorial handlers
  const startTutorial = () => {
    setIsTutorialActive(true);
    setCurrentTutorialStep(0);
  };

  const nextTutorialStep = () => {
    if (currentTutorialStep < ONBOARDING_STEPS.length - 1) {
      setCurrentTutorialStep(prev => prev + 1);
    } else {
      setIsTutorialActive(false);
    }
  };

  const closeTutorial = () => {
    setIsTutorialActive(false);
  };

  const completeOnboarding = () => {
    setIsOnboardingOpen(false);
    localStorage.setItem('mysticballs_onboarding_completed', 'true');
  };

  // Check if onboarding has been completed
  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('mysticballs_onboarding_completed');
    if (!onboardingCompleted && location.pathname === '/') {
      setIsOnboardingOpen(true);
    }
  }, [location.pathname]);

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
      
      {/* Add padding to prevent content from being hidden behind fixed header */}
      <main className="flex-grow pt-24 container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12 pt-8">
                <h1 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-purple-300' : 'text-purple-700'} relative group`}>
                  <span className="absolute inset-0 -left-4 -right-4 bg-fuchsia-500/20 blur-xl rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
                  <span className="absolute inset-0 -left-4 -right-4 bg-fuchsia-500/20 blur-lg rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
                  <span className="absolute inset-0 -left-4 -right-4 bg-fuchsia-500/20 blur-md rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
                  <span className="relative glow-text">Welcome to Your Spiritual Journey</span>
                </h1>
                <p className={`text-xl ${isDarkMode ? 'text-indigo-200' : 'text-indigo-800'} max-w-3xl mx-auto px-16`}>
                  Explore ancient wisdom through our innovative collection of spiritual readings. Whether you seek guidance on love, career, decisions, or understanding your AI-powered insights combine traditional knowledge with modern technology to illuminate your path forward.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 reading-types">
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
              
              {/* Add Reading Type Info section with title */}
              <div className="mt-16">
                <h2 className={`text-3xl md:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} relative group mb-8 text-center max-w-4xl mx-auto`}>
                  <span className="absolute inset-0 -left-8 -right-8 bg-fuchsia-500/20 blur-xl rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
                  <span className="absolute inset-0 -left-8 -right-8 bg-fuchsia-500/20 blur-lg rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
                  <span className="absolute inset-0 -left-8 -right-8 bg-fuchsia-500/20 blur-md rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
                  <span className="relative glow-text">Explore Our Reading Types</span>
                </h2>
                <ReadingTypeInfo isDarkMode={isDarkMode} />
              </div>
              
              {/* Add FAQ section */}
              <FAQ isDarkMode={isDarkMode} />
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
                    onSubmit={handleSubmitReading}
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
          
          <Route path="/privacy" element={
            <PrivacyPolicy isDarkMode={isDarkMode} onBack={() => navigate('/')} />
          } />
          
          <Route path="/terms" element={
            <TermsOfService isDarkMode={isDarkMode} onBack={() => navigate('/')} />
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
      
      <TutorialButton isDarkMode={isDarkMode} onStartTutorial={startTutorial} />
      
      {isTutorialActive && currentTutorialStep < ONBOARDING_STEPS.length && (
        <TourGuide
          currentStep={ONBOARDING_STEPS[currentTutorialStep] as Step}
          onClose={closeTutorial}
          nextStep={nextTutorialStep}
        />
      )}
      
      {isOnboardingOpen && (
        <OnboardingOverlay
          steps={[...ONBOARDING_STEPS] as Step[]}
          isOpen={isOnboardingOpen}
          onComplete={completeOnboarding}
          isDarkMode={isDarkMode}
        />
      )}
      
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
