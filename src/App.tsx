import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useAuthState } from './hooks/useAuthState';
import { READING_TYPES } from './data/readingTypes';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import PaymentModal from './components/PaymentModal';
import SubscriptionManager from './components/SubscriptionManager';
import ReadingSelector from './components/ReadingSelector';
import ReadingForm from './components/ReadingForm';
import AuthCallback from './components/AuthCallback';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentCancel from './components/PaymentCancel';
import AdminControls from './components/AdminControls';
import { PricingPlan, ReadingType } from './types';
import { supabaseClient } from './lib/supabaseClient';
import { createClient, User } from '@supabase/supabase-js';
import { UserProfile, createUserProfile } from './services/supabase';
import { FREE_READINGS_LIMIT, ANONYMOUS_FREE_READINGS_LIMIT, ADMIN_EMAIL, STRIPE_TEST_MODE } from './config/constants';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import TourGuide from './components/TourGuide';
import { ONBOARDING_STEPS } from './config/tutorial';
import { Step } from './types';
import ReadingOutput from './components/ReadingOutput';
import FAQ from './components/FAQ';
import ReactConfetti from 'react-confetti';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : true;
  });

  const [selectedReadingType, setSelectedReadingType] = useState<ReadingType | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSubscriptionManager, setShowSubscriptionManager] = useState(false);
  const [profiles, setProfiles] = useState<UserProfile[] | null>(null);
  const [currentPage, setCurrentPage] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<Step | null>(() => {
    return ONBOARDING_STEPS.length > 0 ? ONBOARDING_STEPS[0] as Step : null;
  });
  const [readingOutput, setReadingOutput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const { user, loading: authLoading } = useAuthState();
  const { signOut } = useAuth();

  // Update window dimensions when window is resized
  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextStep = () => {
    const currentIndex = ONBOARDING_STEPS.findIndex(step => step.id === currentStep?.id);
    if (currentIndex >= 0 && currentIndex < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(ONBOARDING_STEPS[currentIndex + 1] as Step);
    } else {
      setCurrentStep(null);
    }
  };

  // Function to check and reset localStorage if needed
  const checkAndResetLocalStorage = () => {
    // Get free readings used from localStorage
    const storedReadings = localStorage.getItem('freeReadingsUsed');
    const freeReadingsUsed = storedReadings ? parseInt(storedReadings, 10) : 0;
    
    // If localStorage has an invalid value (negative or greater than limit), reset it
    if (freeReadingsUsed < 0 || freeReadingsUsed > FREE_READINGS_LIMIT) {
      console.log('Resetting invalid freeReadingsUsed value:', freeReadingsUsed);
      localStorage.removeItem('freeReadingsUsed');
    }
  };
  
  // Check localStorage on component mount
  useEffect(() => {
    checkAndResetLocalStorage();
  }, []);

  // Check if user is admin
  const isAdmin = (user: User | null): boolean => {
    return !!user && user.email === ADMIN_EMAIL;
  };

  const handleReadingTypeSelect = (readingType: ReadingType) => {
    // Check and reset localStorage if needed
    if (!user) {
      checkAndResetLocalStorage();
    }
    
    // For non-authenticated users, check against ANONYMOUS_FREE_READINGS_LIMIT
    if (!user) {
      const storedReadings = localStorage.getItem('freeReadingsUsed');
      const freeReadingsUsed = storedReadings ? parseInt(storedReadings, 10) : 0;
      const remainingReadings = Math.max(0, ANONYMOUS_FREE_READINGS_LIMIT - freeReadingsUsed);
      
      // If they've used all anonymous free readings, prompt to login with message about 3 more free readings
      if (remainingReadings <= 0) {
        setShowLoginModal(true);
        return;
      }
    }
    
    // For authenticated users, check against FREE_READINGS_LIMIT
    const freeReadingsRemaining = user && profiles?.[0]
      ? Math.max(0, FREE_READINGS_LIMIT - (profiles[0].readings_count || 0))
      : ANONYMOUS_FREE_READINGS_LIMIT;
    
    // If it's a premium reading and user is not premium and has no free readings left
    if (readingType.premiumOnly && (!user || !profiles?.[0]?.is_premium) && freeReadingsRemaining <= 0) {
      setShowPaymentModal(true);
      return;
    }
    
    // Admin users bypass all restrictions
    if (user && isAdmin(user)) {
      setSelectedReadingType(readingType);
      setReadingOutput(null);
      return;
    }
    
    setSelectedReadingType(readingType);
    setReadingOutput(null);
  };

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const handleDarkModeToggle = () => {
    setIsDarkMode((prev: boolean) => !prev);
  };

  const handleSubscribe = async (plan: PricingPlan) => {
    try {
      console.log('Creating checkout session for plan:', plan.id, 'with price ID:', plan.stripePriceId);
      
      if (!user?.id) {
        throw new Error('User ID is required for subscription');
      }
      
      // Get the auth token
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      
      if (!token) {
        throw new Error('Authentication token not found. Please sign in again.');
      }
      
      const response = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Stripe-Test-Mode': STRIPE_TEST_MODE ? 'true' : 'false'
        },
        body: JSON.stringify({ 
          priceId: plan.stripePriceId, 
          customerId: user.id,
          planName: plan.name
        })
      });
      
      // Log the response status for debugging
      console.log('Checkout session response status:', response.status);
      
      if (!response.ok) {
        let errorText;
        try {
          // Try to parse the error as JSON
          const errorJson = await response.json();
          errorText = errorJson.error || `HTTP error ${response.status}`;
        } catch (e) {
          // If it's not JSON, get the text
          errorText = await response.text();
        }
        
        console.error('Checkout session error response:', response.status, errorText);
        throw new Error(`Failed to create checkout session: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Checkout session created:', result);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (result.url) {
        // Show success animation before redirecting
        setShowConfetti(true);
        console.log('Redirecting to Stripe checkout:', result.url);
        
        // Give the confetti a moment to show before redirecting
        setTimeout(() => {
          setShowConfetti(false);
          window.location.href = result.url;
        }, 1500);
      } else {
        throw new Error('No checkout URL returned from server');
      }
    } catch (err) {
      console.error('Error creating checkout session:', err);
      throw err;
    }
  };

  const handleReadingSubmit = async (formData: Record<string, string>) => {
    // Allow non-logged-in users to get readings
    // Track readings in localStorage for non-logged-in users
    let freeReadingsUsed = 0;
    
    // Admin users bypass all restrictions
    if (user && isAdmin(user)) {
      // Continue with reading submission
    }
    // For non-authenticated users
    else if (!user) {
      // Get free readings used from localStorage
      const storedReadings = localStorage.getItem('freeReadingsUsed');
      freeReadingsUsed = storedReadings ? parseInt(storedReadings, 10) : 0;
      
      // Reset if invalid value
      if (freeReadingsUsed < 0 || freeReadingsUsed > ANONYMOUS_FREE_READINGS_LIMIT) {
        console.log('Resetting invalid freeReadingsUsed value:', freeReadingsUsed);
        freeReadingsUsed = 0;
        localStorage.removeItem('freeReadingsUsed');
      }
      
      // If they've used all anonymous free readings, prompt to login with message about 3 more free readings
      if (freeReadingsUsed >= ANONYMOUS_FREE_READINGS_LIMIT) {
        setShowLoginModal(true);
        return;
      }
    }
    // For authenticated users
    else if (user && profiles?.[0]) {
      // If they've used all free readings and are not premium, show payment modal
      if (!profiles[0].is_premium && profiles[0].readings_count >= FREE_READINGS_LIMIT) {
        setShowPaymentModal(true);
        return;
      }
    }

    setIsLoading(true);
    setReadingOutput(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if user is logged in
      if (user) {
        headers['Authorization'] = `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`;
      }
      
      const response = await fetch('/.netlify/functions/getReading', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          readingType: selectedReadingType?.id,
          userInput: {
            ...formData,
            // Pass the current anonymous readings count for the backend to check
            anonymousReadingsUsed: !user ? freeReadingsUsed : 0
          },
          isAnonymous: !user,
        }),
      });

      if (!response.ok) {
        if (response.status === 402) {
          setShowPaymentModal(true);
        } else {
          throw new Error('Failed to get reading');
        }
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      
      // If user is not logged in, increment free readings used in localStorage
      if (!user) {
        freeReadingsUsed += 1;
        localStorage.setItem('freeReadingsUsed', freeReadingsUsed.toString());
      } else {
        // Refresh user profile after successful reading to update the readings count
        await fetchUserProfile(user.id);
      }
      
      setReadingOutput(data.reading);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 7000); // Increased from 5000ms to 7000ms
    } catch (error) {
      console.error('Error getting reading:', error);
      setReadingOutput(error instanceof Error ? error.message : "There was an error getting your reading. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for:', userId);
      
      // Try to get the user profile
      const { data, error } = await supabaseClient
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // If the error is "not found", create a new profile
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating new profile');
          
          // Get user email from auth
          const { data: userData } = await supabase.auth.getUser();
          if (!userData?.user?.email) {
            throw new Error('User email not found');
          }
          
          // Create a new profile with additional free readings
          const additionalReadings = FREE_READINGS_LIMIT - ANONYMOUS_FREE_READINGS_LIMIT;
          console.log('Adding additional free readings:', additionalReadings);
          
          // Create a new profile
          const newProfile = await createUserProfile(userId, userData.user.email);
          
          if (newProfile) {
            // Update the profile with additional free readings
            await supabaseClient
              .from('user_profiles')
              .update({
                readings_count: additionalReadings,
                updated_at: new Date().toISOString()
              })
              .eq('id', userId);
              
            // Fetch the updated profile
            const { data: updatedProfile } = await supabaseClient
              .from('user_profiles')
              .select('*')
              .eq('id', userId)
              .single();
              
            if (updatedProfile) {
              console.log('Updated profile with free readings:', updatedProfile);
              setProfiles([updatedProfile]);
              return updatedProfile;
            } else {
              // If we couldn't fetch the updated profile, return the original one
              setProfiles([newProfile]);
              return newProfile;
            }
          } else {
            throw new Error('Failed to create user profile');
          }
        } else {
          console.error('Error fetching user profile:', error);
          return null;
        }
      } else {
        // Log the profile data
        console.log('Fetched user profile:', data);
        
        // Update profiles state with the fetched profile
        setProfiles([data]);
        return data;
      }
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserProfile(user.id);
    } else {
      setProfiles(null);
    }
  }, [user]);

  // Check if the current URL path is /auth/callback, /payment/success, or /payment/cancel
  const isAuthCallback = window.location.pathname === '/auth/callback';
  const isPaymentSuccess = window.location.pathname === '/payment/success';
  const isPaymentCancel = window.location.pathname === '/payment/cancel';

  if (isAuthCallback) {
    return <AuthCallback />;
  }

  if (isPaymentSuccess) {
    return <PaymentSuccess />;
  }

  if (isPaymentCancel) {
    return <PaymentCancel />;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-indigo-950 bg-gradient-to-br from-indigo-950 via-purple-900 to-blue-950 bg-fixed' 
        : 'bg-indigo-100 bg-gradient-to-br from-indigo-100 via-purple-100 to-blue-100 bg-fixed'
    }`}>
      {showConfetti && (
        <ReactConfetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.1}
          colors={['#f472b6', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b']}
        />
      )}
      <Header
        user={user}
        isDarkMode={isDarkMode}
        onDarkModeToggle={handleDarkModeToggle}
        onSignOut={signOut}
        userProfile={profiles?.[0]}
        onLogin={() => setShowLoginModal(true)}
        onManageSubscription={() => setShowSubscriptionManager(true)}
        onSubscribe={() => setShowPaymentModal(true)}
      />
      
      {/* Admin Controls - only visible to admin users */}
      <div className="container mx-auto px-4 mt-4">
        <AdminControls />
      </div>
      <div className="container mx-auto px-4">
        <div className="pt-16 pb-16 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white relative group mb-8">
            <span className="absolute -inset-1 bg-fuchsia-500/20 blur-xl rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
            <span className="absolute -inset-1 bg-fuchsia-500/20 blur-lg rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
            <span className="absolute -inset-1 bg-fuchsia-500/20 blur-md rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
            <span className="relative glow-text">Welcome to Your Spiritual Journey</span>
          </h2>
          <p className={`text-xl md:text-2xl leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Explore ancient wisdom through our diverse collection of spiritual readings. Whether you 
            seek guidance, clarity, or deeper understanding, our AI-powered insights combine traditional 
            knowledge with modern technology to illuminate your path forward.
          </p>
        </div>
      </div>
      <main className="container mx-auto px-4 py-12">
        {currentPage === 'privacy' ? (
          <PrivacyPolicy 
            isDarkMode={isDarkMode} 
            onBack={() => setCurrentPage(null)} 
          />
        ) : currentPage === 'terms' ? (
          <TermsOfService 
            isDarkMode={isDarkMode} 
            onBack={() => setCurrentPage(null)} 
          />
        ) : selectedReadingType ? (
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setSelectedReadingType(null)}
              className="mb-8 flex items-center gap-2 px-4 py-2 text-white bg-indigo-900/40 hover:bg-indigo-900/60 rounded-lg transition-colors"
            >
              <span>←</span>
              Back to Reading Types
            </button>
            <ReadingForm
              readingType={selectedReadingType}
              onSubmit={handleReadingSubmit}
              isDarkMode={isDarkMode}
              isLoading={isLoading}
            />
            {readingOutput && (
              <div className="mt-8">
                <ReadingOutput
                  readingType={selectedReadingType}
                  isDarkMode={isDarkMode}
                  reading={readingOutput}
                  isLoading={isLoading}
                />
              </div>
            )}
          </div>
        ) : (
          <div>
            <ReadingSelector
              READING_TYPES={READING_TYPES}
              handleReadingTypeSelect={handleReadingTypeSelect}
              isDarkMode={isDarkMode}
              isPremium={user ? profiles?.[0]?.is_premium : false}
              freeReadingsRemaining={user && profiles?.[0]
                ? Math.max(0, FREE_READINGS_LIMIT - (profiles[0].readings_count || 0))
                : Math.max(0, ANONYMOUS_FREE_READINGS_LIMIT - (localStorage.getItem('freeReadingsUsed') ? parseInt(localStorage.getItem('freeReadingsUsed') || '0', 10) : 0))}
            />
            {profiles && (
              <p className={`text-sm text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-700'} mt-2`}>
                {profiles.length} user profiles loaded.
              </p>
            )}
          </div>
        )}
      </main>
      {!selectedReadingType && !currentPage && <FAQ isDarkMode={isDarkMode} />}
      <Footer
        onPrivacyClick={() => setCurrentPage('privacy')}
        onTermsClick={() => setCurrentPage('terms')}
        isDarkMode={isDarkMode}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        isDarkMode={isDarkMode}
        user={user}
        onSubscribe={handleSubscribe}
        remainingReadings={user && profiles?.[0] ?
          Math.max(0, FREE_READINGS_LIMIT - (profiles[0].readings_count || 0)) :
          FREE_READINGS_LIMIT}
      />

      {user && showSubscriptionManager && (
        <SubscriptionManager
          user={user}
          isDarkMode={isDarkMode}
          onClose={() => setShowSubscriptionManager(false)}
        />
      )}

      {currentStep && (
        <TourGuide
          currentStep={currentStep}
          onClose={() => setCurrentStep(null)}
          nextStep={nextStep}
        />
      )}
    </div>
  );
};

export default App;
