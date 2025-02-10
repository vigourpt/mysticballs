import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useAuthState } from './hooks/useAuthState';
import { READING_TYPES } from './data/readingTypes';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import PaymentModal from './components/PaymentModal';
import ReadingTypeCard from './components/ReadingTypeCard';
import ReadingForm from './components/ReadingForm';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import { PricingPlan } from './types';

interface AppProps {}

const App: React.FC<AppProps> = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : true;
  });

  const [selectedReadingType, setSelectedReadingType] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'privacy' | 'terms'>('home');
  const { user, loading: authLoading } = useAuthState();
  const { signOut } = useAuth();

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const handleDarkModeToggle = () => {
    setIsDarkMode((prev: boolean) => !prev);
  };

  const handleSubscribe = async (plan: PricingPlan) => {
    // Implementation will be added later
    console.log('Subscribing to plan:', plan);
  };

  const handleReadingSubmit = async (formData: Record<string, string>) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    try {
      const response = await fetch('/.netlify/functions/getReading', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}`,
        },
        body: JSON.stringify({
          readingType: selectedReadingType,
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
      // Handle the reading response
      console.log(data);
    } catch (error) {
      console.error('Error getting reading:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      isDarkMode
        ? 'bg-gradient-to-b from-gray-900 via-purple-900 to-violet-900 text-white'
        : 'bg-gradient-to-b from-gray-50 via-purple-50 to-violet-50 text-gray-900'
    }`}>
      <Header
        isDarkMode={isDarkMode}
        onDarkModeToggle={handleDarkModeToggle}
        user={user}
        onSignOut={signOut}
      />

      <main className="container mx-auto px-4 py-8">
        {currentPage === 'home' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {READING_TYPES.map(readingType => (
                <ReadingTypeCard
                  key={readingType.id}
                  readingType={readingType}
                  selected={selectedReadingType === readingType.id}
                  onClick={() => setSelectedReadingType(readingType.id)}
                  isDarkMode={isDarkMode}
                />
              ))}
            </div>

            {selectedReadingType && (
              <div className="max-w-2xl mx-auto">
                <ReadingForm
                  readingType={READING_TYPES.find(rt => rt.id === selectedReadingType)!}
                  onSubmit={handleReadingSubmit}
                  isDarkMode={isDarkMode}
                />
              </div>
            )}
          </>
        ) : currentPage === 'privacy' ? (
          <PrivacyPolicy isDarkMode={isDarkMode} />
        ) : (
          <TermsOfService isDarkMode={isDarkMode} />
        )}
      </main>

      <Footer
        onPrivacyClick={() => setCurrentPage('privacy')}
        onTermsClick={() => setCurrentPage('terms')}
        isDarkMode={isDarkMode}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        isDarkMode={isDarkMode}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        isDarkMode={isDarkMode}
        user={user}
        onSubscribe={handleSubscribe}
        remainingReadings={0}
      />
    </div>
  );
};

export default App;