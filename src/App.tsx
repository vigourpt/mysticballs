import { FC, useState } from 'react';
import { ReadingType, Step, PaymentPlan } from './types';
import { useAuth } from './hooks/useAuth';
import { useUsageTracking } from './hooks/useUsageTracking';
import { useTutorial } from './hooks/useTutorial';
import { getReading } from './services/openai';

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
    id: 'magic8ball',
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
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [readingOutput, setReadingOutput] = useState('');

  const { user, signOut } = useAuth();
  const { usage, updateUsage } = useUsageTracking(user?.id);
  const { currentStep, setCurrentStep, isTutorialOpen, completeTutorial, startTutorial } = useTutorial();

  const handleStepClick = (step: Step) => {
    setCurrentStep(step);
  };

  const handleSubscribe = async (plan: PaymentPlan) => {
    // Implementation will be added later
    console.log('Subscribing to plan:', plan);
  };

  const handleLoginRequired = () => {
    setShowLoginModal(true);
  };

  // Handle initial loading
  useEffect(() => {
    const handleInitialLoad = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setShowLoginModal(true);
      }
    };

    handleInitialLoad();
  }, []);

  useEffect(() => {
    // Test OpenAI connection on mount
    const testOpenAIConnection = async () => {
      try {
        const testResponse = await getReading('numerology', {
          name: 'Test User',
          birthdate: '2000-01-01'
        });
        console.log('OpenAI Connection Test Success:', testResponse);
      } catch (error) {
        console.error('OpenAI Connection Test Failed:', error);
      }
    };
    testOpenAIConnection();
  }, []);

  const handleDarkModeToggle = () => {
    setIsDarkMode(prev => !prev);
  };

  // Show loading spinner during authentication
  if (user === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-blue-950">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-blue-950 text-white">
        <Header
          user={user}
          isDarkMode={isDarkMode}
          onDarkModeToggle={handleDarkModeToggle}
          onLoginClick={() => setShowLoginModal(true)}
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
                        setShowLoginModal(true);
                        return false;
                      }
                      if (hasCompletedReading) {
                        setShowPaymentModal(true);
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

              {currentStep && (
                <TourGuide
                  steps={[currentStep]}
                  currentStep={currentStep}
                  onClose={() => setCurrentStep(null)}
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
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          isDarkMode={isDarkMode}
        />

        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          user={user}
          isDarkMode={isDarkMode}
          onLoginRequired={handleLoginRequired}
          onSubscribe={handleSubscribe}
          remainingReadings={usage?.readingsRemaining || 0}
        />
      </div>
    </div>
  );
};

export default App;