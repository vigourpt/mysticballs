import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from './components/Header';
import Footer from './components/Footer';
import ReadingSelector from './components/ReadingSelector';
import ReadingForm from './components/ReadingForm';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentCancel from './components/PaymentCancel';
import ReadingHistory from './components/ReadingHistory';
import { UserContext } from './context/UserContext';

import { READING_TYPES } from './data/readingTypes';
import { ReadingType } from './types';

const App: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, refreshUserData } = useContext(UserContext);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedReadingType, setSelectedReadingType] = useState<ReadingType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showReadingHistory, setShowReadingHistory] = useState(false);

  // Set initial reading type
  useEffect(() => {
    if (READING_TYPES && READING_TYPES.length > 0) {
      const firstReadingType = READING_TYPES[0];
      if (firstReadingType) {
        setSelectedReadingType(firstReadingType);
      }
    }
  }, []);

  // Toggle dark mode
  const handleDarkModeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      navigate('/');
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  // Handle login
  const handleLogin = () => {
    navigate('/');
  };

  // Handle subscription management
  const handleManageSubscription = () => {
    navigate('/pricing');
  };

  // Handle subscribe button
  const handleSubscribe = () => {
    navigate('/pricing');
  };

  // Handle reading type selection
  const handleReadingTypeSelect = (readingType: ReadingType) => {
    setSelectedReadingType(readingType);
    navigate(`/reading/${readingType.id}`);
  };

  // Handle reading submission
  const handleReadingSubmit = async (formInputs: Record<string, string>) => {
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      if (selectedReadingType) {
        // Generate a reading result based on the reading type and form data
        toast.success(`Your ${selectedReadingType.name} reading has been generated!`);
        
        // Log the form inputs for debugging
        console.log('Form inputs:', formInputs);
      }
    } catch (error) {
      console.error('Error submitting reading:', error);
      toast.error('Failed to generate reading');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle view reading history
  const handleViewReadingHistory = () => {
    setShowReadingHistory(true);
    navigate('/history');
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <Header
        user={user}
        isDarkMode={isDarkMode}
        onDarkModeToggle={handleDarkModeToggle}
        onSignOut={handleSignOut}
        onLogin={handleLogin}
        onManageSubscription={handleManageSubscription}
        onSubscribe={handleSubscribe}
        onViewReadingHistory={handleViewReadingHistory}
      />
      
      <main className="flex-grow container mx-auto px-4 py-8 mt-16">
        {showReadingHistory ? (
          <ReadingHistory
            isDarkMode={isDarkMode}
            onBack={() => setShowReadingHistory(false)}
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
          </div>
        ) : (
          <ReadingSelector
            READING_TYPES={READING_TYPES}
            handleReadingTypeSelect={handleReadingTypeSelect}
            isDarkMode={isDarkMode}
            isPremium={profile?.is_premium || false}
            freeReadingsRemaining={10}
          />
        )}

        <Routes>
          <Route
            path="/payment/success"
            element={<PaymentSuccess onComplete={() => {
              if (refreshUserData) {
                refreshUserData();
              }
            }} />}
          />
          <Route
            path="/payment/cancel"
            element={<PaymentCancel />}
          />
        </Routes>
      </main>
      
      <Footer 
        isDarkMode={isDarkMode}
        onPrivacyClick={() => {}}
        onTermsClick={() => {}}
        currentPage={null}
        setCurrentPage={() => {}}
      />
      
      <ToastContainer position="bottom-right" theme={isDarkMode ? 'dark' : 'light'} />
    </div>
  );
};

export default App;
