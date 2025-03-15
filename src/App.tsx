import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Routes, Route, useLocation, Navigate } from 'react-router-dom';
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
  const location = useLocation();
  const { user, profile, refreshUserData, signOut } = useContext(UserContext);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedReadingType, setSelectedReadingType] = useState<ReadingType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Set initial reading type only if we're on the home page
  useEffect(() => {
    // If we're on the pricing page but showing a reading, redirect to actual pricing
    if (location.pathname === '/pricing') {
      // Reset selected reading type to ensure pricing page shows correctly
      setSelectedReadingType(null);
    }
    
    // Only set initial reading type on home page
    if (location.pathname === '/' && READING_TYPES && READING_TYPES.length > 0) {
      const firstReadingType = READING_TYPES[0];
      if (firstReadingType) {
        setSelectedReadingType(firstReadingType);
      }
    }
  }, [location.pathname]);

  // Set reading type based on URL parameter
  useEffect(() => {
    const match = location.pathname.match(/\/reading\/([^/]+)/);
    if (match && match[1]) {
      const readingTypeId = match[1];
      const foundReadingType = READING_TYPES.find(rt => rt.id === readingTypeId);
      if (foundReadingType) {
        setSelectedReadingType(foundReadingType);
      }
    }
  }, [location.pathname]);

  // Apply dark mode styles to body
  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
    document.body.classList.toggle('light-mode', !isDarkMode);
    
    // Force re-render of styles
    document.body.style.backgroundColor = isDarkMode ? '#111827' : '#f3f4f6';
    document.body.style.color = isDarkMode ? '#ffffff' : '#111827';
    
    return () => {
      document.body.classList.remove('dark-mode', 'light-mode');
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    };
  }, [isDarkMode]);

  // Toggle dark mode
  const handleDarkModeToggle = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('darkMode', (!isDarkMode).toString());
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      if (signOut) {
        await signOut();
      }
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
    navigate('/history');
  };

  // Render pricing page
  const renderPricingPage = () => {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Subscription Plans</h1>
        <div className="grid md:grid-cols-2 gap-8">
          <div className={`relative rounded-lg p-6 ${isDarkMode ? 'bg-indigo-900/40' : 'bg-indigo-100'}`}>
            <h2 className="text-2xl font-bold mb-4">Basic Plan</h2>
            <p className="text-xl mb-2">$9.99/month</p>
            <ul className="list-disc pl-5 mb-6">
              <li>10 readings per month</li>
              <li>Access to basic reading types</li>
              <li>Email support</li>
            </ul>
            <button 
              className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              onClick={() => navigate('/subscribe/basic')}
            >
              Subscribe
            </button>
          </div>
          <div className={`relative rounded-lg p-6 ${isDarkMode ? 'bg-purple-900/40' : 'bg-purple-100'} border-2 border-yellow-400`}>
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-bold">
              RECOMMENDED
            </div>
            <h2 className="text-2xl font-bold mb-4">Premium Plan</h2>
            <p className="text-xl mb-2">$19.99/month</p>
            <ul className="list-disc pl-5 mb-6">
              <li>Unlimited readings</li>
              <li>Access to all reading types</li>
              <li>Priority support</li>
              <li>Personalized insights</li>
            </ul>
            <button 
              className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              onClick={() => navigate('/subscribe/premium')}
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>
    );
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
        <Routes>
          {/* Redirect from root to home if needed */}
          <Route path="/" element={
            <ReadingSelector
              READING_TYPES={READING_TYPES}
              handleReadingTypeSelect={handleReadingTypeSelect}
              isDarkMode={isDarkMode}
              isPremium={profile?.is_premium || false}
              freeReadingsRemaining={profile?.readings_remaining || 0}
            />
          } />
          
          <Route path="/reading/:readingTypeId" element={
            selectedReadingType ? (
              <div className="max-w-4xl mx-auto">
                <button
                  onClick={() => navigate('/')}
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
            ) : <Navigate to="/" replace />
          } />
          
          <Route path="/history" element={
            <ReadingHistory
              isDarkMode={isDarkMode}
              onBack={() => navigate('/')}
            />
          } />
          
          <Route path="/pricing" element={renderPricingPage()} />
          
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
          
          {/* Catch-all redirect to home page */}
          <Route path="*" element={<Navigate to="/" replace />} />
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
