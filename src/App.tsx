/** @jsxImportSource react */
import { useState, useEffect, lazy, Suspense } from 'react';
import type { FC } from 'react';
import LoadingSpinner from './components/LoadingSpinner';
import { ReadingType, PaymentPlan } from './types';
import { useAuth } from './hooks/useAuth';
import { useUsageTracking } from './hooks/useUsageTracking';
import useTutorial from './hooks/useTutorial';
import { FREE_READINGS_LIMIT } from './config/constants';
import { ONBOARDING_STEPS, TOOLTIPS } from './config/tutorial';
import useAuthState from './hooks/useAuthState';

// Import icons individually to reduce bundle size
import { 
  Moon, Sun, ScrollText, Hash, Stars, 
  Scroll, Dice3, BookHeart, LogOut, 
  Calculator, Sparkles, Cloud, CircleDot, 
  Palette, Clock 
} from 'lucide-react';

// Lazy load components
const ErrorBoundary = lazy(() => import('./components/ErrorBoundary'));
const AsyncComponent = lazy(() => import('./components/AsyncComponent'));
const Tooltip = lazy(() => import('./components/Tooltip'));
const OnboardingOverlay = lazy(() => import('./components/OnboardingOverlay'));
const TutorialButton = lazy(() => import('./components/TutorialButton'));
const Footer = lazy(() => import('./components/Footer'));
const ReadingSelector = lazy(() => import('./components/ReadingSelector'));
const ReadingForm = lazy(() => import('./components/ReadingForm'));
const ReadingOutput = lazy(() => import('./components/ReadingOutput'));
const PaymentModal = lazy(() => import('./components/PaymentModal'));
const LoginModal = lazy(() => import('./components/LoginModal'));
const Advertisement = lazy(() => import('./components/Advertisement'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./components/TermsOfService'));

interface AuthCredentials {
  email: string;
  password: string;
}

const App: FC = () => {
  const [selectedReading, setSelectedReading] = useState<ReadingType | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [hasCompletedReading, setHasCompletedReading] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'privacy' | 'terms'>('home');

  useAuthState();
  
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const { usage, incrementUsage } = useUsageTracking();
  const { isTutorialOpen, completeTutorial, startTutorial } = useTutorial();

  // Handle initial loading
  useEffect(() => {
    const handleInitialLoad = async () => {
      try {
        // Initialize app state from URL if needed
        const params = new URLSearchParams(window.location.search);
        if (params.get('showPayment') === 'true' && user) {
          setIsPaymentModalOpen(true);
        }
      } catch (error) {
        console.error('Error during initial load:', error);
      }
    };

    handleInitialLoad();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/'; // Redirect to home after sign out
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      await signIn(email, password);
      setIsLoginModalOpen(false);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    try {
      await signUp(email, password);
      setIsLoginModalOpen(false);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const handleSubscribe = async (plan: PaymentPlan) => {
    try {
      // Implement subscription logic
      console.log('Subscribing to plan:', plan);
      setIsPaymentModalOpen(false);
    } catch (error) {
      console.error('Subscription error:', error);
      throw error;
    }
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // Show loading spinner during authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <LoadingSpinner message="Authenticating..." size="medium" showSlowLoadingMessage={false} />
      </div>
    );
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'privacy':
        return (
          <ErrorBoundary>
            <AsyncComponent>
              <PrivacyPolicy isDarkMode={isDarkMode} />
            </AsyncComponent>
          </ErrorBoundary>
        );
      case 'terms':
        return (
          <ErrorBoundary>
            <AsyncComponent>
              <TermsOfService isDarkMode={isDarkMode} />
            </AsyncComponent>
          </ErrorBoundary>
        );
      default:
        return (
          <ErrorBoundary>
            <main className="max-w-4xl mx-auto relative">
              {!selectedReading ? (
                <AsyncComponent>
                  <ReadingSelector
                    readingTypes={[
                      { id: 'tarot', name: 'Tarot', icon: ScrollText, description: 'Discover insights through the ancient wisdom of tarot cards' },
                      { id: 'numerology', name: 'Numerology', icon: Hash, description: 'Unlock the meaning behind your personal numbers' },
                      { id: 'astrology', name: 'Astrology', icon: Stars, description: 'Explore your celestial connections and cosmic path' },
                      { id: 'oracle', name: 'Oracle Cards', icon: BookHeart, description: 'Receive guidance through mystical oracle messages' },
                      { id: 'runes', name: 'Runes', icon: Scroll, description: 'Ancient Norse wisdom for modern guidance' },
                      { id: 'iching', name: 'I Ching', icon: Dice3, description: 'Connect with ancient Chinese divination wisdom' },
                      { id: 'angelNumbers', name: 'Angel Numbers', icon: Calculator, description: 'Decode divine messages in recurring numbers' },
                      { id: 'horoscope', name: 'Daily Horoscope', icon: Sparkles, description: 'Your personalized daily celestial guidance' },
                      { id: 'dreams', name: 'Dream Analysis', icon: Cloud, description: 'Uncover the hidden meanings in your dreams' },
                      { id: 'magic8ball', name: 'Magic 8 Ball', icon: CircleDot, description: 'Quick answers to yes/no questions' },
                      { id: 'aura', name: 'Aura Reading', icon: Palette, description: 'Discover your energy field\'s colors and meanings' },
                      { id: 'pastLife', name: 'Past Life Reading', icon: Clock, description: 'Explore your soul\'s previous incarnations' }
                    ]}
                    onSelect={setSelectedReading}
                    isDarkMode={isDarkMode}
                  />
                </AsyncComponent>
              ) : (
                <div className="space-y-6">
                  <button
                    onClick={() => {
                      setSelectedReading(null);
                    }}
                    className={`mb-6 px-4 py-2 rounded-lg ${
                      isDarkMode ? 'bg-indigo-800 text-white' : 'bg-indigo-200 text-gray-800'
                    } hover:opacity-80 transition-opacity`}
                  >
                    ← Back to Reading Types
                  </button>
                  <AsyncComponent>
                    <ReadingForm
                      readingType={selectedReading}
                      isDarkMode={isDarkMode}
                      onReadingComplete={() => setHasCompletedReading(true)}
                      onReadingRequest={() => {
                        if (hasCompletedReading) {
                          setIsPaymentModalOpen(true);
                          return false;
                        }
                        return true;
                      }}
                    />
                  </AsyncComponent>
                  <AsyncComponent>
                    <ReadingOutput
                      readingType={selectedReading}
                      isDarkMode={isDarkMode}
                    />
                  </AsyncComponent>
                </div>
              )}
            </main>
          </ErrorBoundary>
        );
    }
  };

  return (
    <ErrorBoundary>
      <Suspense fallback={
        <div className="fixed inset-0 flex items-center justify-center bg-indigo-900 bg-opacity-50">
          <LoadingSpinner size={48} />
        </div>
      }>
        <div className={`min-h-screen transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-indigo-950 via-purple-900 to-blue-950' 
            : 'bg-gradient-to-br from-indigo-100 via-purple-100 to-blue-100'
        }`}>
          <div className="container mx-auto px-4 py-8 relative">
            <header className="flex justify-between items-center mb-8">
              <h1 
                className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} relative cursor-pointer`}
                onClick={() => setCurrentPage('home')}
              >
                <span className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 blur"></span>
                <span className="relative">Mystic Insights</span>
              </h1>
              <div className="flex items-center gap-4">
                {user ? (
                  <>
                    <Tooltip content={TOOLTIPS.actions.premium}>
                      <button
                        onClick={() => setIsPaymentModalOpen(true)}
                        className={`px-4 py-2 rounded-lg ${
                          isDarkMode 
                            ? 'bg-indigo-600 hover:bg-indigo-700' 
                            : 'bg-indigo-500 hover:bg-indigo-600'
                        } text-white transition-colors`}
                      >
                        Upgrade to Premium
                      </button>
                    </Tooltip>
                    <Tooltip content="Sign out">
                      <button
                        onClick={handleSignOut}
                        className={`p-2 rounded-full ${
                          isDarkMode ? 'bg-indigo-800 text-white' : 'bg-indigo-200 text-gray-800'
                        } hover:opacity-80 transition-opacity`}
                      >
                        <LogOut size={24} />
                      </button>
                    </Tooltip>
                  </>
                ) : (
                  <Tooltip content={TOOLTIPS.actions.signIn}>
                    <button
                      onClick={() => setIsLoginModalOpen(true)}
                      className={`px-4 py-2 rounded-lg ${
                        isDarkMode 
                          ? 'bg-indigo-600 hover:bg-indigo-700' 
                          : 'bg-indigo-500 hover:bg-indigo-600'
                      } text-white transition-colors`}
                    >
                      Sign In
                    </button>
                  </Tooltip>
                )}
                <Tooltip content={TOOLTIPS.actions.darkMode}>
                  <button
                    onClick={handleToggleDarkMode}
                    className={`p-2 rounded-full theme-toggle ${
                      isDarkMode ? 'bg-indigo-800 text-white' : 'bg-indigo-200 text-gray-800'
                    } hover:opacity-80 transition-opacity`}
                  >
                    {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
                  </button>
                </Tooltip>
              </div>
            </header>

            <AsyncComponent>
              <Advertisement isDarkMode={isDarkMode} />
            </AsyncComponent>

            {renderContent()}

            <AsyncComponent>
              <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                isDarkMode={isDarkMode}
                onSubscribe={handleSubscribe}
                remainingReadings={usage?.remainingReadings ?? 0}
              />
            </AsyncComponent>

            <AsyncComponent>
              <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                isDarkMode={isDarkMode}
                onLogin={handleSignIn}
                onSignUp={handleSignUp}
              />
            </AsyncComponent>

            <TutorialButton isDarkMode={isDarkMode} onStartTutorial={startTutorial} />

            <OnboardingOverlay
              steps={ONBOARDING_STEPS}
              isOpen={isTutorialOpen}
              onComplete={completeTutorial}
              isDarkMode={isDarkMode}
            />

            <Footer 
              isDarkMode={isDarkMode} 
              onPrivacyClick={() => setCurrentPage('privacy')}
              onTermsClick={() => setCurrentPage('terms')}
            />
          </div>
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;