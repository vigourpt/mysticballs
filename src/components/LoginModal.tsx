import React, { useState } from 'react';
import { LogIn, Mail, Lock } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onLogin: (email?: string, password?: string) => Promise<void>;
  onSignUp: (email: string, password: string) => Promise<void>;
}

const LoginModal: React.FC<Props> = ({ isOpen, onClose, isDarkMode, onLogin, onSignUp }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'google'>('email');
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setShowVerificationMessage(false);
      setIsLoading(true);
      
      if (isSignUp) {
        await onSignUp(email, password);
        setShowVerificationMessage(true);
      } else {
        await onLogin(email, password);
        onClose();
      }
    } catch (err: any) {
      if (err?.name === 'EmailNotConfirmedError' || err?.name === 'EmailConfirmationRequired') {
        setShowVerificationMessage(true);
      } else {
        setError(err?.message || 'Authentication failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      setShowVerificationMessage(false);
      setIsLoading(true);
      await onLogin();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMethod = (method: 'email' | 'google') => {
    setAuthMethod(method);
    setError(null);
    setShowVerificationMessage(false);
  };

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setShowVerificationMessage(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`${
        isDarkMode ? 'bg-indigo-900 text-white' : 'bg-white text-gray-800'
      } rounded-xl p-6 max-w-md w-full shadow-xl`}>
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <LogIn className={`w-12 h-12 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`} />
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
          <p className={`mb-6 ${isDarkMode ? 'text-indigo-200' : 'text-gray-600'}`}>
            {isSignUp ? 'Create your account' : 'Sign in to access your readings'}
          </p>

          {showVerificationMessage && (
            <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 text-yellow-500 text-sm">
              Please check your email to verify your account before signing in.
              <br />
              <button 
                onClick={() => setShowVerificationMessage(false)}
                className="text-yellow-600 hover:text-yellow-700 underline mt-2"
              >
                Dismiss
              </button>
            </div>
          )}

          {error && !showVerificationMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => toggleAuthMethod('email')}
              className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                authMethod === 'email'
                  ? isDarkMode
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-500 text-white'
                  : isDarkMode
                    ? 'bg-indigo-800/50 text-indigo-200'
                    : 'bg-gray-100 text-gray-600'
              }`}
            >
              Email
            </button>
            <button
              onClick={() => toggleAuthMethod('google')}
              className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                authMethod === 'google'
                  ? isDarkMode
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-500 text-white'
                  : isDarkMode
                    ? 'bg-indigo-800/50 text-indigo-200'
                    : 'bg-gray-100 text-gray-600'
              }`}
            >
              Google
            </button>
          </div>

          {authMethod === 'email' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="relative">
                  <Mail className={`absolute left-3 top-3 w-5 h-5 ${
                    isDarkMode ? 'text-indigo-400' : 'text-indigo-500'
                  }`} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                      isDarkMode
                        ? 'bg-indigo-800/50 text-white placeholder:text-indigo-300'
                        : 'bg-gray-100 text-gray-900 placeholder:text-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    required
                  />
                </div>
              </div>
              <div>
                <div className="relative">
                  <Lock className={`absolute left-3 top-3 w-5 h-5 ${
                    isDarkMode ? 'text-indigo-400' : 'text-indigo-500'
                  }`} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    minLength={6}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                      isDarkMode
                        ? 'bg-indigo-800/50 text-white placeholder:text-indigo-300'
                        : 'bg-gray-100 text-gray-900 placeholder:text-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg ${
                  isDarkMode
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-indigo-500 hover:bg-indigo-600'
                } text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2`}
              >
                {isLoading ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <>
                    {isSignUp ? 'Sign Up' : 'Sign In'}
                  </>
                )}
              </button>
            </form>
          ) : (
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 ${
                isDarkMode
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'bg-indigo-500 hover:bg-indigo-600'
              } text-white transition-colors disabled:opacity-50`}
            >
              {isLoading ? (
                <LoadingSpinner size="small" />
              ) : (
                <>
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                  Continue with Google
                </>
              )}
            </button>
          )}
          
          <div className="mt-4">
            <button
              onClick={toggleSignUp}
              className={`text-sm ${
                isDarkMode ? 'text-indigo-300 hover:text-indigo-200' : 'text-indigo-600 hover:text-indigo-700'
              }`}
            >
              {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
            </button>
          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            className={`mt-4 w-full py-2 px-4 rounded-lg ${
              isDarkMode
                ? 'bg-gray-800 hover:bg-gray-700'
                : 'bg-gray-200 hover:bg-gray-300'
            } transition-colors disabled:opacity-50`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;