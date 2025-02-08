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

const App: FC = () => {
  const [selectedReading, setSelectedReading] = useState<ReadingType | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
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
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Welcome to Mystic Balls
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  {user ? `Welcome back, ${user.email}` : 'Sign in to start your journey'}
                </p>
                {usage && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Readings remaining: {usage.readingsRemaining}
                  </p>
                )}
              </div>

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
        </main>

        <Footer 
          isDarkMode={isDarkMode} 
          onPrivacyClick={() => setCurrentPage('privacy')}
          onTermsClick={() => setCurrentPage('terms')}
        />

        {isLoginModalOpen && (
          <LoginModal
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
            isDarkMode={isDarkMode}
          />
        )}

        {isPaymentModalOpen && (
          <PaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            user={user}
            isDarkMode={isDarkMode}
            onLoginRequired={() => setIsLoginModalOpen(true)}
          />
        )}
      </div>
    </div>
  );
};

export default App;