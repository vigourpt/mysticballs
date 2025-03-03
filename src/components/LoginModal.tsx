import React, { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useAuth } from '../hooks/useAuth';
import { signInWithGoogle, supabase, updateUserReadingsCount } from '../services/supabase';
import { FREE_READINGS_LIMIT } from '../config/constants';
import ReactConfetti from 'react-confetti';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: FC<Props> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  const { signIn, signUp, loading: authLoading, confirmEmail, user } = useAuth();

  // Update window dimensions when window is resized
  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Function to transfer anonymous readings to user account
  const transferAnonymousReadings = async (userId: string) => {
    try {
      const storedReadings = localStorage.getItem('freeReadingsUsed');
      if (storedReadings) {
        const readingsCount = parseInt(storedReadings, 10);
        if (readingsCount > 0) {
          await updateUserReadingsCount(userId, readingsCount);
          // Clear anonymous readings from localStorage
          localStorage.removeItem('freeReadingsUsed');
        }
      }
    } catch (err) {
      console.error('Error transferring anonymous readings:', err);
      // Don't throw error here, just log it - we don't want to block sign-in
    }
  };

  // Watch for user changes to transfer readings
  useEffect(() => {
    if (user) {
      transferAnonymousReadings(user.id);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || authLoading) return;
    
    setError(null);
    setIsLoading(true);
    
    try {
      if (!email || !password) {
        throw new Error('Please enter both email and password');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      if (isSignUp) {
        await signUp(email, password);
        // Don't close modal, wait for confirmation screen
      } else {
        await signIn(email, password);
        // Show confetti on successful sign in
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
        // Close modal on successful sign in
        onClose();
      }
    } catch (err: unknown) {
      console.error('Auth error:', err);
      const authErrorMessage = 'An error occurred during authentication';
      if (err instanceof Error) {
        if (err.message?.toLowerCase().includes('already registered')) {
          setError('This email is already registered. Please sign in instead.');
          setIsSignUp(false); // Switch to sign in mode
        } else if (err.message?.toLowerCase().includes('invalid login credentials')) {
          setError('Invalid email or password. Please try again.');
        } else if (err.message?.toLowerCase().includes('email link is invalid or has expired')) {
          setError('The confirmation link is invalid or has expired. Please try signing up again.');
        } else {
          setError(err.message);
        }
      } else {
        console.error('Unknown error:', err);
        setError(authErrorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isLoading || authLoading) return;
    
    setError(null);
    setIsLoading(true);
    
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
      
      // Show confetti on successful sign in
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      
      // Close modal on successful Google sign in
      onClose();
    } catch (err: unknown) {
      console.error('Google sign in error:', err);
      const googleErrorMessage = 'Failed to sign in with Google';
      if (err instanceof Error) {
        setError(err.message || googleErrorMessage);
      } else {
        console.error('Unknown error:', err);
        setError(googleErrorMessage);
      }
      setIsLoading(false);
    }
  };

  // Close modal if user is authenticated
  React.useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      // Only close if we have a successful auth AND no errors
      if (!isLoading && !error && !confirmEmail && user) {
        onClose();
      }
    };
    
    checkUser();
  }, [isLoading, error, confirmEmail, onClose]);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setEmail('');
      setPassword('');
      setError(null);
      setIsLoading(false);
      setIsSignUp(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {showConfetti && (
        <ReactConfetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.1}
          colors={['#f472b6', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b']}
        />
      )}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-gradient-to-br from-indigo-950 via-purple-900 to-blue-950 rounded-lg shadow-xl max-w-md w-full p-8 border border-indigo-800/30">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-indigo-300 hover:text-white"
          aria-label="Close"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-indigo-200">
            {isSignUp ? 'Sign up to start your mystical journey' : 'Sign in to continue your journey'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 text-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-indigo-200 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-indigo-900/50 border border-indigo-700 text-white placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-indigo-200 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-indigo-900/50 border border-indigo-700 text-white placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || authLoading}
            className={`w-full py-3 px-4 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              (isLoading || authLoading) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading || authLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setError(null);
              setIsSignUp(!isSignUp);
            }}
            className="text-indigo-300 hover:text-white text-sm"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-indigo-800/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-br from-indigo-950 via-purple-900 to-blue-950 text-indigo-300">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center py-3 px-4 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span className="ml-2 text-gray-900">Continue with Google</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
