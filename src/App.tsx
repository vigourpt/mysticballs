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
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950 text-white">
      <Header
        isDarkMode={isDarkMode}
        onDarkModeToggle={handleDarkModeToggle}
        user={user}
        onSignOut={signOut}
      />
      
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Welcome to Your Spiritual Journey</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Explore ancient wisdom through our diverse collection of spiritual readings. Whether you
            seek guidance, clarity, or deeper understanding, our AI-powered insights combine traditional
            knowledge with modern technology to illuminate your path forward.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {READING_TYPES.map((type) => (
            <ReadingTypeCard
              key={type.id}
              readingType={type}
              selected={selectedReadingType === type.id}
              onClick={() => setSelectedReadingType(type.id)}
              isDarkMode={isDarkMode}
            />
          ))}
        </div>

        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center mb-12">How to Get the Best From Your Reading</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-indigo-900/40 rounded-xl p-8">
              <h3 className="text-xl font-semibold mb-4">Set Your Intention</h3>
              <p className="text-gray-300">Take a moment to center yourself and clearly focus on your question or area of concern. The more specific your intention, the more focused your reading will be.</p>
            </div>
            <div className="bg-indigo-900/40 rounded-xl p-8">
              <h3 className="text-xl font-semibold mb-4">Create Sacred Space</h3>
              <p className="text-gray-300">Find a quiet, comfortable place where you won't be disturbed. This helps create the right environment for receiving spiritual insights.</p>
            </div>
            <div className="bg-indigo-900/40 rounded-xl p-8">
              <h3 className="text-xl font-semibold mb-4">Stay Open</h3>
              <p className="text-gray-300">Approach your reading with an open mind and heart. Sometimes the guidance we receive isn't what we expect, but it's often what we need.</p>
            </div>
          </div>
        </div>

        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-indigo-900/40 rounded-xl p-8">
              <h3 className="text-xl font-semibold mb-4">How accurate are the readings?</h3>
              <p className="text-gray-300">Our readings combine traditional spiritual wisdom with advanced AI technology. While they provide valuable insights and guidance, remember that you have free will and the power to shape your path.</p>
            </div>
            <div className="bg-indigo-900/40 rounded-xl p-8">
              <h3 className="text-xl font-semibold mb-4">How often should I get a reading?</h3>
              <p className="text-gray-300">This varies by individual. Some find daily guidance helpful, while others prefer weekly or monthly readings. Listen to your intuition and seek guidance when you feel called to do so.</p>
            </div>
            <div className="bg-indigo-900/40 rounded-xl p-8">
              <h3 className="text-xl font-semibold mb-4">What if I don't understand my reading?</h3>
              <p className="text-gray-300">Take time to reflect on the messages received. Sometimes insights become clearer with time. You can also try journaling about your reading or discussing it with a trusted friend.</p>
            </div>
          </div>
        </div>
      </main>

      {selectedReadingType && (
        <ReadingForm
          readingType={READING_TYPES.find(rt => rt.id === selectedReadingType)!}
          onSubmit={handleReadingSubmit}
          onClose={() => setSelectedReadingType(null)}
          isDarkMode={isDarkMode}
        />
      )}

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