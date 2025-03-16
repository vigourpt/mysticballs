import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from './components/Header';
import Footer from './components/Footer';
import ReadingSelector from './components/ReadingSelector';
import ReadingForm from './components/ReadingForm';
import ReadingHistory from './components/ReadingHistory';
import LoginModal from './components/LoginModal';
import BackgroundEffects from './components/BackgroundEffects';
import SubscriptionManager from './components/SubscriptionManager';
import AdminDashboard from './components/AdminDashboard';
import { UserContext } from './context/UserContext';
import { incrementReadingCount, incrementFreeReadingUsed } from './services/supabase';

import { READING_TYPES } from './data/readingTypes';
import { ReadingType } from './types';

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut, refreshUserData, readingsRemaining } = useContext(UserContext);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedReadingType, setSelectedReadingType] = useState<ReadingType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<string | null>(null);

  // Set initial reading type only if we're on the home page
  useEffect(() => {
    if (location.pathname === '/' && !selectedReadingType) {
      setSelectedReadingType(READING_TYPES[0] || null);
    }
    
    // Set current page for tracking
    setCurrentPage(location.pathname);
  }, [location.pathname, selectedReadingType]);

  // Handle subscription selection
  const handleSubscriptionSelection = (plan: string) => {
    // Check if user is logged in
    if (!user) {
      // Show login modal if not logged in
      setIsLoginModalOpen(true);
      // Store the selected plan to redirect after login
      localStorage.setItem('selectedSubscriptionPlan', plan);
      toast.info('Please sign in to subscribe to this plan');
      return;
    }

    // Simulate API call to create checkout session
    try {
      toast.info(`Redirecting to checkout for ${plan} plan...`);
      
      // In a real app, we would call an API endpoint to create a checkout session
      // For now, we'll simulate this with a timeout and redirect
      setTimeout(() => {
        // Redirect to a payment success page for demo purposes
        setCurrentPage('payment-success');
        navigate(`/payment/success?plan=${plan}`);
        
        // Update subscription in database
        if (refreshUserData) {
          refreshUserData();
        }
      }, 2000);
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to create checkout session');
    }
  };

  // Check for stored subscription plan after login
  useEffect(() => {
    const checkStoredSubscriptionPlan = () => {
      const storedPlan = localStorage.getItem('selectedSubscriptionPlan');
      if (user && storedPlan) {
        // Clear the stored plan
        localStorage.removeItem('selectedSubscriptionPlan');
        // Redirect to checkout with the stored plan
        handleSubscriptionSelection(storedPlan);
      }
    };

    checkStoredSubscriptionPlan();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Intentionally omitting handleSubscriptionSelection to avoid circular dependency

  // Render pricing page
  const renderPricingPage = () => {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 px-4 py-2 text-white bg-indigo-900/40 hover:bg-indigo-900/60 rounded-lg transition-colors"
        >
          <span>←</span>
          Back to Home
        </button>
        <h1 className="text-3xl font-bold mb-8">Subscription Plans</h1>
        <div className="grid md:grid-cols-2 gap-8">
          <div className={`relative rounded-lg p-6 ${isDarkMode ? 'bg-indigo-900/40' : 'bg-indigo-100'}`}>
            <h2 className="text-2xl font-bold mb-4">Basic Plan</h2>
            <p className="text-xl mb-2">$9.99/month</p>
            <ul className="list-disc pl-5 mb-6">
              <li>50 readings per month</li>
              <li>Access to basic reading types</li>
              <li>Email support</li>
            </ul>
            <button 
              className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              onClick={() => handleSubscriptionSelection('basic')}
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
              onClick={() => handleSubscriptionSelection('premium')}
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render payment success page
  const renderPaymentSuccessPage = () => {
    // Get the plan from URL parameters
    const searchParams = new URLSearchParams(location.search);
    const plan = searchParams.get('plan');
    const planName = plan === 'premium' ? 'Premium' : 'Basic';

    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className={`p-8 rounded-lg ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'} mt-8`}>
          <div className="text-green-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
          <p className="text-xl mb-6">Thank you for subscribing to our {planName} Plan.</p>
          <p className="mb-8">Your subscription is now active and you can start enjoying all the features of your plan immediately.</p>
          <button 
            onClick={() => navigate('/')} 
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  };

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

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900 text-white bg-gradient-dark' : 'bg-gray-100 text-gray-900 bg-gradient-light'}`}>
      <BackgroundEffects isDarkMode={isDarkMode} />
      <Header
        user={user}
        isDarkMode={isDarkMode}
        onDarkModeToggle={() => setIsDarkMode(!isDarkMode)}
        onSignOut={() => {
          if (user) {
            signOut().then((success) => {
              if (success) {
                navigate('/');
                toast.success('Signed out successfully');
              } else {
                toast.error('Failed to sign out');
              }
            });
          }
        }}
        onLogin={() => setIsLoginModalOpen(true)}
        onManageSubscription={() => setIsSubscriptionModalOpen(true)}
        onSubscribe={() => navigate('/pricing')}
        onViewReadingHistory={() => navigate('/history')}
        onViewAdminDashboard={() => navigate('/admin')}
      />
      
      <main className="flex-grow container mx-auto px-4 py-8 mt-16">
        <Routes>
          {/* Redirect from root to home if needed */}
          <Route path="/" element={
            <div className="max-w-6xl mx-auto">
              {/* Welcome Section */}
              <section className="mb-16 text-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-6 relative group">
                  <span className="absolute -inset-2 bg-fuchsia-500/20 blur-xl rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
                  <span className="absolute -inset-2 bg-fuchsia-500/20 blur-lg rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
                  <span className="absolute -inset-2 bg-fuchsia-500/20 blur-md rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
                  <span className="relative glow-text">Welcome to Your Spiritual Journey</span>
                </h1>
                <p className="text-lg max-w-3xl mx-auto">
                  Explore ancient wisdom through our innovative collection of spiritual readings.
                  Whether you seek guidance on love, career, decisions, or understanding your AI-
                  powered insights combine traditional knowledge with modern technology
                  to illuminate your path forward.
                </p>
              </section>

              {/* Reading Types Section */}
              <ReadingSelector
                READING_TYPES={READING_TYPES}
                handleReadingTypeSelect={(readingType) => {
                  setSelectedReadingType(readingType);
                  navigate(`/reading/${readingType.id}`);
                }}
                isDarkMode={isDarkMode}
                isPremium={profile?.is_premium || false}
                freeReadingsRemaining={readingsRemaining}
              />

              {/* How to Get the Best From Your Reading */}
              <section className="mt-20 mb-16">
                <h2 className="text-2xl md:text-3xl font-bold text-center relative group mb-12">
                  <span className="absolute -inset-2 bg-fuchsia-500/20 blur-xl rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
                  <span className="absolute -inset-2 bg-fuchsia-500/20 blur-lg rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
                  <span className="absolute -inset-2 bg-fuchsia-500/20 blur-md rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
                  <span className="relative glow-text">How to Get the Best From Your Reading</span>
                </h2>

                <div className="grid md:grid-cols-3 gap-8">
                  <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                    <h3 className="text-xl font-semibold mb-4">Set Your Intention</h3>
                    <p>
                      Take a moment to center yourself and clearly focus on your question or area of
                      concern. The more specific your intention, the more focused your reading will be.
                    </p>
                  </div>

                  <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                    <h3 className="text-xl font-semibold mb-4">Create Sacred Space</h3>
                    <p>
                      Find a quiet, comfortable place where you won't be disturbed. This helps create the
                      right environment for receiving spiritual insights.
                    </p>
                  </div>

                  <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                    <h3 className="text-xl font-semibold mb-4">Stay Open</h3>
                    <p>
                      Approach your reading with an open mind and heart. Sometimes the guidance we
                      receive isn't what we expect, but it's often what we need.
                    </p>
                  </div>
                </div>
              </section>

              {/* FAQ Section */}
              <section className="mt-20 mb-16">
                <h2 className="text-2xl md:text-3xl font-bold text-center relative group mb-12">
                  <span className="absolute -inset-2 bg-fuchsia-500/20 blur-xl rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
                  <span className="absolute -inset-2 bg-fuchsia-500/20 blur-lg rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
                  <span className="absolute -inset-2 bg-fuchsia-500/20 blur-md rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
                  <span className="relative glow-text">Frequently Asked Questions</span>
                </h2>

                <div className="space-y-6">
                  <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                    <h3 className="text-xl font-semibold mb-3">How accurate are the readings?</h3>
                    <p>
                      Our readings combine traditional spiritual wisdom with advanced AI technology. While they provide
                      valuable insights and guidance, remember that you have free will and the power to shape your
                      path.
                    </p>
                  </div>

                  <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                    <h3 className="text-xl font-semibold mb-3">How often should I get a reading?</h3>
                    <p>
                      This varies by individual. Some find daily guidance helpful, while others prefer weekly or monthly
                      readings. Listen to your intuition and seek guidance when you feel called to do so.
                    </p>
                  </div>

                  <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                    <h3 className="text-xl font-semibold mb-3">What if I don't understand my reading?</h3>
                    <p>
                      Take time to reflect on the messages received. Sometimes insights become clearer with time. You
                      can also try journaling about your reading or discussing it with a trusted friend.
                    </p>
                  </div>
                </div>
              </section>
            </div>
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
                  onSubmit={async (formInputs) => {
                    try {
                      setIsLoading(true);
                      
                      // Check if user has readings remaining
                      if (user) {
                        // For signed-in users, increment reading count in database
                        if (profile && !profile.is_premium) {
                          // Only increment for non-premium users
                          await incrementReadingCount(user.id);
                          // Refresh user data to update readings count
                          await refreshUserData();
                        }
                      } else {
                        // For non-signed-in users, increment local storage count
                        const remaining = incrementFreeReadingUsed();
                        if (remaining <= 0) {
                          toast.info('You have used all your free readings. Sign in for more!', {
                            autoClose: 5000
                          });
                        }
                      }
                      
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
                  }}
                  isDarkMode={isDarkMode}
                  isLoading={isLoading}
                />
              </div>
            ) : <Navigate to="/" replace />
          } />

          <Route path="/history" element={
            user ? <ReadingHistory isDarkMode={isDarkMode} onBack={() => navigate('/')} /> : <Navigate to="/" replace />
          } />
          
          {/* Admin Dashboard Route - Only accessible to admin users */}
          <Route path="/admin" element={
            user && profile?.is_admin ? <AdminDashboard /> : <Navigate to="/" replace />
          } />
          
          <Route path="/pricing" element={renderPricingPage()} />

          <Route
            path="/payment/success"
            element={renderPaymentSuccessPage()}
          />

          <Route
            path="/payment/cancel"
            element={
              <div className="max-w-4xl mx-auto text-center">
                <div className={`p-8 rounded-lg ${isDarkMode ? 'bg-red-900/30' : 'bg-red-100'} mt-8`}>
                  <div className="text-red-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h1 className="text-3xl font-bold mb-4">Payment Cancelled</h1>
                  <p className="text-xl mb-6">Your subscription payment was cancelled.</p>
                  <p className="mb-8">No charges have been made to your account.</p>
                  <button 
                    onClick={() => navigate('/pricing')} 
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors mr-4"
                  >
                    Return to Plans
                  </button>
                  <button 
                    onClick={() => navigate('/')} 
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                  >
                    Go Home
                  </button>
                </div>
              </div>
            }
          />

          {/* Privacy Policy Route */}
          <Route path="/privacy" element={
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                <h2 className="text-xl font-semibold mb-4">Information Collection and Use</h2>
                <p className="mb-4">
                  Mystic Balls collects personal information when you create an account, including your email address and authentication details. 
                  We also collect information about your readings and preferences to provide a personalized experience.
                </p>
                <p className="mb-4">
                  We use this information to:
                </p>
                <ul className="list-disc pl-5 mb-4">
                  <li>Provide and improve our services</li>
                  <li>Personalize your experience</li>
                  <li>Process payments and manage subscriptions</li>
                  <li>Communicate with you about your account and updates</li>
                </ul>
              </div>

              <div className={`p-6 rounded-xl mt-6 ${isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                <h2 className="text-xl font-semibold mb-4">Data Protection</h2>
                <p className="mb-4">
                  We implement appropriate security measures to protect your personal information from unauthorized access, 
                  alteration, disclosure, or destruction. Your data is stored securely using industry-standard encryption.
                </p>
              </div>

              <div className={`p-6 rounded-xl mt-6 ${isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                <h2 className="text-xl font-semibold mb-4">Cookies and Tracking</h2>
                <p className="mb-4">
                  Mystic Balls uses cookies to enhance your experience and analyze usage patterns. 
                  You can control cookie settings through your browser preferences.
                </p>
              </div>

              <div className={`p-6 rounded-xl mt-6 ${isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
                <p className="mb-4">
                  If you have questions about our privacy practices, please contact us at privacy@mysticballs.com.
                </p>
              </div>

              <button
                onClick={() => navigate('/')}
                className="mt-8 flex items-center gap-2 px-4 py-2 text-white bg-indigo-900/40 hover:bg-indigo-900/60 rounded-lg transition-colors"
              >
                <span>←</span>
                Back to Home
              </button>
            </div>
          } />

          {/* Terms of Service Route */}
          <Route path="/terms" element={
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                <h2 className="text-xl font-semibold mb-4">Acceptance of Terms</h2>
                <p className="mb-4">
                  By accessing or using Mystic Balls, you agree to be bound by these Terms of Service. 
                  If you do not agree to these terms, please do not use our services.
                </p>
              </div>

              <div className={`p-6 rounded-xl mt-6 ${isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                <h2 className="text-xl font-semibold mb-4">User Accounts</h2>
                <p className="mb-4">
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities 
                  that occur under your account. You must immediately notify us of any unauthorized use of your account.
                </p>
              </div>

              <div className={`p-6 rounded-xl mt-6 ${isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                <h2 className="text-xl font-semibold mb-4">Subscription and Payments</h2>
                <p className="mb-4">
                  Subscription fees are charged in advance on a monthly basis. You can cancel your subscription at any time, 
                  and your access will continue until the end of your current billing period.
                </p>
              </div>

              <div className={`p-6 rounded-xl mt-6 ${isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                <h2 className="text-xl font-semibold mb-4">Disclaimer</h2>
                <p className="mb-4">
                  Mystic Balls provides readings for entertainment purposes only. We do not guarantee the accuracy of readings, 
                  and they should not be used as a substitute for professional advice.
                </p>
              </div>

              <button
                onClick={() => navigate('/')}
                className="mt-8 flex items-center gap-2 px-4 py-2 text-white bg-indigo-900/40 hover:bg-indigo-900/60 rounded-lg transition-colors"
              >
                <span>←</span>
                Back to Home
              </button>
            </div>
          } />

          {/* Catch-all redirect to home page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer 
        isDarkMode={isDarkMode}
        onPrivacyClick={() => {
          setCurrentPage('privacy');
          navigate('/privacy');
        }}
        onTermsClick={() => {
          setCurrentPage('terms');
          navigate('/terms');
        }}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      {/* Login Modal */}
      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}
      
      {/* Subscription Manager Modal */}
      {isSubscriptionModalOpen && user && (
        <SubscriptionManager
          user={user}
          isDarkMode={isDarkMode}
          onClose={() => setIsSubscriptionModalOpen(false)}
        />
      )}
      
      <ToastContainer position="bottom-right" theme={isDarkMode ? 'dark' : 'light'} />
    </div>
  );
};

export default App;
