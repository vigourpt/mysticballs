import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useAuthState } from './hooks/useAuthState';
import { READING_TYPES } from './data/readingTypes';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import PaymentModal from './components/PaymentModal';
import ReadingSelector from './components/ReadingSelector';
import ReadingForm from './components/ReadingForm';
import { PricingPlan, ReadingType } from './types';
import { supabaseClient } from './lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';
import { UserProfile } from './services/supabase';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import TourGuide from './components/TourGuide';
import { ONBOARDING_STEPS } from './config/tutorial';
import { Step } from './types';
import ReadingOutput from './components/ReadingOutput';
import FAQ from './components/FAQ';

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
  const [profiles, setProfiles] = useState<UserProfile[] | null>(null);
  const [currentPage, setCurrentPage] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<Step | null>(ONBOARDING_STEPS.length > 0 ? ONBOARDING_STEPS[0] : null);
  const [readingOutput, setReadingOutput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading: authLoading } = useAuthState();
  const { signOut } = useAuth();

  const nextStep = () => {
    const currentIndex = ONBOARDING_STEPS.findIndex(step => step.id === currentStep?.id);
    if (currentIndex >= 0 && currentIndex < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(ONBOARDING_STEPS[currentIndex + 1]);
    } else {
      setCurrentStep(null);
    }
  };

  const handleReadingTypeSelect = (readingType: ReadingType) => {
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
      const response = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: plan.stripePriceId, customerId: user?.id })
      });
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (result.url) {
        window.location.href = result.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Error creating checkout session:', err);
      throw err;
    }
  };

  const handleReadingSubmit = async (formData: Record<string, string>) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    setIsLoading(true);
    setReadingOutput(null);

    try {
      const response = await fetch('/.netlify/functions/getReading', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          readingType: selectedReadingType?.id,
          userInput: formData,
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
      setReadingOutput(data.reading);
    } catch (error) {
      console.error('Error getting reading:', error);
      setReadingOutput(error instanceof Error ? error.message : "There was an error getting your reading. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const { data, error } = await supabaseClient
          .from('user_profiles')
          .select('*');

        if (error) {
          setProfiles(null);
        } else {
          setProfiles(data);
        }
      } catch (err) {
        setProfiles(null);
      }
    };

    fetchProfiles();
  }, []);

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
        ? 'bg-gradient-to-br from-indigo-950 via-purple-900 to-blue-950' 
        : 'bg-gradient-to-br from-indigo-100 via-purple-100 to-blue-100'
    }`}>
      <Header
        isDarkMode={isDarkMode}
        onDarkModeToggle={handleDarkModeToggle}
        user={user}
        onSignOut={signOut}
      />
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
          <PrivacyPolicy isDarkMode={isDarkMode} />
        ) : currentPage === 'terms' ? (
          <TermsOfService isDarkMode={isDarkMode} />
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
            />
            {profiles && (
              <p className={`text-sm text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-700'} mt-2`}>
                {profiles.length} user profiles loaded.
              </p>
            )}
          </div>
        )}
      </main>
      {!selectedReadingType && <FAQ isDarkMode={isDarkMode} />}
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
        remainingReadings={0}
      />

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
