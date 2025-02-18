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

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);
import TourGuide from './components/TourGuide';
import { ONBOARDING_STEPS } from './config/tutorial';
import { Step } from './types';
import ReadingTypeInfo from './components/ReadingTypeInfo';
import ReadingOutput from './components/ReadingOutput';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : true;
  });

  const [selectedReadingType, setSelectedReadingType] = useState<ReadingType | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [profiles, setProfiles] = useState<UserProfile[] | null>(null);
  const [supabaseError, setSupabaseError] = useState<Error | null>(null);
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
          setSupabaseError(error);
        } else {
          setProfiles(data);
        }
      } catch (err) {
        setSupabaseError(err instanceof Error ? err : new Error(String(err)) as Error);
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
        <div className="text-center pt-16 pb-16 max-w-4xl mx-auto">
          <h2 className="text-2xl text-blue-400 mb-6">
            Welcome to Your Spiritual Journey
          </h2>
          <p className={`text-base max-w-2xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
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
            <div className="space-y-8">
              <div className={`p-8 rounded-xl w-full ${isDarkMode ? 'bg-indigo-900/40' : 'bg-white'}`}>
                <h2 className="text-3xl font-bold mb-8">{selectedReadingType.name}</h2>
                <ReadingForm
                  readingType={selectedReadingType}
                  onSubmit={handleReadingSubmit}
                  isDarkMode={isDarkMode}
                />
              </div>
              {readingOutput && (
                <div className={`p-8 rounded-xl w-full ${isDarkMode ? 'bg-indigo-900/40' : 'bg-white'}`}>
                  <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Your Reading
                  </h3>
                  <ReadingOutput
                    readingType={selectedReadingType}
                    isDarkMode={isDarkMode}
                    reading={readingOutput}
                    isLoading={isLoading}
                  />
                </div>
              )}
            </div>
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
            <div className="mt-24">
              <ReadingTypeInfo isDarkMode={isDarkMode} />
            </div>

            <div className="mt-24">
              <h2 className="text-3xl font-bold text-center mb-12">How to Get the Best From Your Reading</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-indigo-900/40 rounded-xl p-8">
                  <h3 className="text-xl font-semibold mb-4">Set Your Intention</h3>
                  <p className={`text-gray-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Take a moment to center yourself and clearly focus on your question or area of concern. The more specific your intention, the more focused your reading will be.
                  </p>
                </div>
                <div className="bg-indigo-900/40 rounded-xl p-8">
                  <h3 className="text-xl font-semibold mb-4">Create Sacred Space</h3>
                  <p className={`text-gray-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Find a quiet, comfortable place where you won't be disturbed. This helps create the right environment for receiving spiritual insights.
                  </p>
                </div>
                <div className="bg-indigo-900/40 rounded-xl p-8">
                  <h3 className="text-xl font-semibold mb-4">Stay Open</h3>
                  <p className={`text-gray-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Approach your reading with an open mind and heart. Sometimes the guidance we receive isn't what we expect, but it's often what we need.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-24">
              <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
              <div className="space-y-6 max-w-4xl mx-auto">
                <div className="bg-indigo-900/40 rounded-xl p-8">
                  <h3 className="text-xl font-semibold mb-4">How accurate are the readings?</h3>
                  <p className={`text-gray-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Our readings combine traditional spiritual wisdom with advanced AI technology. While they provide valuable insights and guidance, remember that you have free will and the power to shape your path.
                  </p>
                </div>
                <div className="bg-indigo-900/40 rounded-xl p-8">
                  <h3 className="text-xl font-semibold mb-4">How often should I get a reading?</h3>
                  <p className={`text-gray-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    This varies by individual. Some find daily guidance helpful, while others prefer weekly or monthly readings. Listen to your intuition and seek guidance when you feel called to do so.
                  </p>
                </div>
                <div className="bg-indigo-900/40 rounded-xl p-8">
                  <h3 className="text-xl font-semibold mb-4">What if I don't understand my reading?</h3>
                  <p className={`text-gray-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Take time to reflect on the messages received. Sometimes insights become clearer with time. You can also try journaling about your reading or discussing it with a trusted friend.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

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
