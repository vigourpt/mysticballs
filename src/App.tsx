import React, { FC, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useAuth } from './hooks/useAuth';
import { useUsageTracking } from './hooks/useUsageTracking';
import { useTutorial } from './hooks/useTutorial';
import { ReadingType, Step, PaymentPlan } from './types';
import { supabase } from './services/supabase';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import PaymentModal from './components/PaymentModal';
import TourGuide from './components/TourGuide';
import ReadingSelector from './components/ReadingSelector';
import ReadingForm from './components/ReadingForm';
import ReadingOutput from './components/ReadingOutput';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';

const READING_TYPES: ReadingType[] = [
  {
    id: 'tarot',
    name: 'Tarot Reading',
    description: 'Discover insights through the ancient wisdom of tarot cards, dating back to the 15th century. Each card reveals hidden truths and illuminates your path forward.',
    icon: 'cards'
  },
  {
    id: 'numerology',
    name: 'Numerology Reading',
    description: 'Unlock the meaning behind your personal numbers. Analyze your birth date and name to reveal life path, destiny, and soul urge numbers.',
    icon: 'numbers'
  },
  {
    id: 'astrology',
    name: 'Astrology Reading',
    description: 'Examine celestial influences through your sun sign, moon sign, rising sign, and planetary aspects for deep personal insights.',
    icon: 'stars'
  },
  {
    id: 'oracle',
    name: 'Oracle Cards Reading',
    description: 'Receive divine guidance through beautifully illustrated cards. Perfect for both beginners and experienced seekers of wisdom.',
    icon: 'oracle'
  },
  {
    id: 'runes',
    name: 'Runes Reading',
    description: 'Ancient Norse symbols offering guidance and insight. Each of the 24 runes carries powerful meanings from Nordic wisdom.',
    icon: 'runes'
  },
  {
    id: 'iching',
    name: 'I Ching Reading',
    description: 'The ancient Chinese Book of Changes provides profound wisdom through hexagrams, drawing on over 3,000 years of Taoist philosophy.',
    icon: 'iching'
  },
  {
    id: 'angels',
    name: 'Angel Numbers',
    description: 'Interpret divine messages through recurring number sequences. Receive guidance and support from your guardian angels.',
    icon: 'numbers'
  },
  {
    id: 'horoscope',
    name: 'Daily Horoscope',
    description: 'Get personalized astrological guidance based on your zodiac sign and current planetary positions.',
    icon: 'stars'
  },
  {
    id: 'dreams',
    name: 'Dream Analysis',
    description: 'Explore the symbolic meanings within your dreams. Uncover subconscious insights and receive guidance from your inner wisdom.',
    icon: 'moon'
  },
  {
    id: 'magic8',
    name: 'Magic 8 Ball',
    description: 'Get quick, mystical answers to your yes/no questions. A playful way to tap into your intuition.',
    icon: 'ball'
  },
  {
    id: 'aura',
    name: 'Aura Reading',
    description: 'Reveal the colors and energies of your personal energy field. Gain insights into your spiritual, emotional, and physical well-being.',
    icon: 'aura'
  },
  {
    id: 'pastlife',
    name: 'Past Life Reading',
    description: 'Explore your soul\'s previous incarnations. Understand how past life experiences influence your present journey.',
    icon: 'history'
  }
];

const App: FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedReading, setSelectedReading] = useState<ReadingType | null>(null);
  const [hasCompletedReading, setHasCompletedReading] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'privacy' | 'terms'>('home');
  const [stepSize, setStepSize] = useState<'small' | 'medium' | 'large'>('medium');
  
  const { user, loading: authLoading } = useAuth();
  const { usage } = useUsageTracking(user?.id ?? null);
  const { isTutorialOpen, completeTutorial, startTutorial } = useTutorial();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);

  // Handle initial loading
  useEffect(() => {
    const handleInitialLoad = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setIsLoginModalOpen(true);
      }
    };

    handleInitialLoad();
  }, []);

  const handleDarkModeToggle = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleStepClick = (step: Step) => {
    setSelectedStep(step);
    if (step.size) {
      setStepSize(step.size);
    }
  };

  const handleSubscribe = async (plan: PaymentPlan) => {
    // Handle subscription logic
  };

  // Show loading spinner during authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-blue-950">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-blue-950 text-white">
        <Header
          user={user}
          isDarkMode={isDarkMode}
          onDarkModeToggle={handleDarkModeToggle}
          onLoginClick={() => setIsLoginModalOpen(true)}
          onLogoutClick={() => supabase.auth.signOut()}
        />

        <main className="container mx-auto px-4 py-8">
          {currentPage === 'home' && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-4">
                  Welcome to Mystic Balls
                </h1>
                <p className="text-lg text-indigo-200">
                  {user ? `Welcome back, ${user.email}` : 'Sign in to start your journey'}
                </p>
                {usage && (
                  <p className="text-sm text-indigo-300 mt-2">
                    Readings remaining: {usage.readingsRemaining}
                  </p>
                )}
              </div>

              {!selectedReading ? (
                <ReadingSelector
                  readingTypes={READING_TYPES}
                  onSelect={setSelectedReading}
                  isDarkMode={isDarkMode}
                />
              ) : (
                <div className="space-y-6">
                  <button
                    onClick={() => setSelectedReading(null)}
                    className="mb-6 px-4 py-2 rounded-lg bg-indigo-800 text-white hover:bg-indigo-700 transition-colors"
                  >
                    ← Back to Reading Types
                  </button>
                  
                  <ReadingForm
                    readingType={selectedReading}
                    isDarkMode={isDarkMode}
                    onReadingComplete={() => setHasCompletedReading(true)}
                    onReadingRequest={() => {
                      if (!user) {
                        setIsLoginModalOpen(true);
                        return false;
                      }
                      if (hasCompletedReading) {
                        setIsPaymentModalOpen(true);
                        return false;
                      }
                      return true;
                    }}
                  />

                  <ReadingOutput
                    readingType={selectedReading}
                    isDarkMode={isDarkMode}
                  />
                </div>
              )}

              {selectedStep && (
                <TourGuide
                  steps={[selectedStep]}
                  currentStep={selectedStep}
                  onClose={() => setSelectedStep(null)}
                  size={stepSize}
                />
              )}
            </>
          )}

          {currentPage === 'privacy' && (
            <>
              <button
                onClick={() => setCurrentPage('home')}
                className="mb-6 px-4 py-2 rounded-lg bg-indigo-800 text-white hover:bg-indigo-700 transition-colors"
              >
                ← Back to Home
              </button>
              <PrivacyPolicy />
            </>
          )}

          {currentPage === 'terms' && (
            <>
              <button
                onClick={() => setCurrentPage('home')}
                className="mb-6 px-4 py-2 rounded-lg bg-indigo-800 text-white hover:bg-indigo-700 transition-colors"
              >
                ← Back to Home
              </button>
              <TermsOfService />
            </>
          )}
        </main>

        <Footer 
          isDarkMode={isDarkMode} 
          onPrivacyClick={() => setCurrentPage('privacy')}
          onTermsClick={() => setCurrentPage('terms')}
        />

        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          isDarkMode={isDarkMode}
        />

        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          user={user}
          isDarkMode={isDarkMode}
          onLoginRequired={() => setIsLoginModalOpen(true)}
        />
      </div>
    </div>
  );
};

export default App;