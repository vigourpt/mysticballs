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
  session: Session | null; // Add session here
  signOut: () => Promise<boolean>;
  refreshUserData: () => Promise<void>;
  readingsRemaining: number;
}

const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut: contextSignOut, refreshUserData, readingsRemaining, session } = useContext(UserContext) as UserContextProps; // Renamed signOut to contextSignOut
  
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedReadingType, setSelectedReadingType] = useState<ReadingType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<string | null>(null);
  const [readingResult, setReadingResult] = useState<string | null>(null);
  // const [session, setSession] = useState<Session | null>(null); // Remove this line
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
    console.log('[useEffect location.pathname] Path changed to:', location.pathname, 'Current selectedReadingType:', selectedReadingType ? selectedReadingType.id : null);
    if (location.pathname === '/') {
      setCurrentPage('home');
    } else if (location.pathname.startsWith('/reading/')) {
      setCurrentPage('reading');
      
      // Find the reading type from the URL
      const readingTypeId = location.pathname.split('/').pop() as ReadingTypeId;
      const foundReadingType = READING_TYPES.find(rt => rt.id === readingTypeId);
      
      if (foundReadingType) {
        if (!selectedReadingType || selectedReadingType.id !== foundReadingType.id) {
          console.log('[useEffect location.pathname] Setting selectedReadingType to:', foundReadingType.id);
          setSelectedReadingType(foundReadingType);
        }
      }
    }
    // Auth related session logic is now handled by UserContext.tsx
    // The dependency array might need adjustment. If selectedReadingType is only set here
    // and not used as a dependency for other logic within this specific useEffect,
    // then [location.pathname] might be more appropriate.
    // However, selectedReadingType IS used in the condition, so keeping it.
  }, [location.pathname, selectedReadingType]); // Keeping selectedReadingType for now.

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

  // Effect to clear readingResult when selectedReadingType changes
  useEffect(() => {
    // This effect runs whenever selectedReadingType changes.
    // When a new reading type is selected (or selection is cleared),
    // we should clear any previous reading result to ensure the form is shown.
    console.log('[useEffect selectedReadingType] selectedReadingType changed to:', selectedReadingType ? selectedReadingType.id : null, '. Clearing previous readingResult.');
    setReadingResult(null);
  }, [selectedReadingType]); // Dependency: selectedReadingType

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

      if (!session || !session.access_token) {
        toast.error('Authentication session not found. Please sign in again.');
        // Optionally, force sign out or redirect to login here if session is expected but missing
        setIsLoginModalOpen(true); // Prompt to login again
        setIsSubscriptionModalOpen(false);
        return;
      }
      
      // Use the stripePriceId directly from the plan object
      const priceId = plan.stripePriceId;
      
      await createCheckoutSession(
        priceId,
        user.id,
        user.email || '',
        session.access_token // Pass the access token
      );
    } catch (error: any) {
      console.error('Subscription error:', error);
      // Check if the error message is already "User not authenticated" from createCheckoutSession
      // to avoid redundant or confusing messages.
      if (error.message && error.message.includes('User not authenticated')) {
          toast.error('Authentication failed. Please sign in again.');
      } else {
          toast.error(error.message || 'Failed to process subscription. Please try again.');
      }
      // Consider if further action is needed, e.g. if it's an auth error, also open login modal
      if (error.message && error.message.toLowerCase().includes('authenticated')) {
          setIsLoginModalOpen(true);
          setIsSubscriptionModalOpen(false);
      }
    }
  };

  // Function to handle reading submission
  const handleSubmitReading = async (formInputs: Record<string, string>) => {
    console.log('[handleSubmitReading] Called. Current selectedReadingType:', selectedReadingType ? selectedReadingType.id : 'None');
    if (!selectedReadingType) return;
    
    try {
      console.log('[handleSubmitReading] Setting isLoading to true.');
      setIsLoading(true);
      setReadingResult(null);
      console.log('[handleSubmitReading] isLoading is now true, readingResult is null.');
      
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
      
      // Client-side timeout for the fetch call
      const clientTimeoutPromise = new Promise<Response>((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out. Please try again.')), 15000); // 15 seconds
      });

      // Call the Netlify function to generate a reading, raced with client-side timeout
      const response = await Promise.race([
        fetch(getApiUrl('/.netlify/functions/getReading'), {
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
        }),
        clientTimeoutPromise
      ]);
      console.log('[handleSubmitReading] Fetch response received. ok:', response.ok, 'status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to generate reading. Invalid JSON response.' }));
        console.error('Reading generation failed with status:', response.status, errorData);
        // errorData would have been logged by the console.error just above it
        console.log('[handleSubmitReading] Response not OK. Error data logged above. About to throw.');
        
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
          // Use errorData.message if available, otherwise errorData.error
          throw new Error(errorData.message || errorData.error || `Failed to generate reading (${response.status})`);
        }
        
        setIsLoading(false); // Ensure loading is stopped before returning
        return;
      }
      
      console.log('[handleSubmitReading] Response is OK. Attempting to parse JSON.');
      const data = await response.json();
      
      if (data.error) {
        console.log('[handleSubmitReading] Server returned data with error:', data.message || data.error);
        // Use data.message if available from the server's JSON response
        throw new Error(data.message || data.error);
      }
      
      console.log('[handleSubmitReading] Success from server. Setting readingResult with data:', data.reading ? data.reading.substring(0, 30) + '...' : null);
      toast.success(`Your ${selectedReadingType.name} reading has been generated!`);
      setReadingResult(data.reading);
    } catch (error: any) {
      console.log('[handleSubmitReading] Caught error:', error.message);
      console.error('Error submitting reading:', error);
      // error.message here will now be the more detailed message from the throw statements above,
      // or "Request timed out. Please try again." from the clientTimeoutPromise.
      toast.error(error.message || 'Failed to generate reading. An unknown error occurred.');
    } finally {
      console.log('[handleSubmitReading] In finally block. Setting isLoading to false.');
      setIsLoading(false);
      console.log('[handleSubmitReading] isLoading should now be false.');
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

  const handleSignOut = async () => {
    try {
      await contextSignOut();
      // Success is implicitly handled by onAuthStateChange updating context and UI.
    } catch (error) {
      console.error('Sign-out error caught in App.tsx:', error);
      toast.error('Sign-out failed. Please try again.'); // User-facing error
    }
  };

  console.log('[App Render] isLoading:', isLoading, 'readingResult:', readingResult ? readingResult.substring(0, 30) + '...' : null, 'selectedReadingType:', selectedReadingType ? selectedReadingType.id : null);
  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900 text-white bg-gradient-dark' : 'bg-gray-100 text-gray-900 bg-gradient-light'}`}>
      <BackgroundEffects isDarkMode={isDarkMode} />
      
      <Header 
        isDarkMode={isDarkMode} 
        onDarkModeToggle={toggleDarkMode}
        user={user}
        onSignOut={handleSignOut} // Pass the new handler
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
