import React from 'react';
import { Sparkles, X } from 'lucide-react';
import { PAYMENT_PLANS } from '../config/plans';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStartTrial: () => void;
  isDarkMode: boolean;
}

const FreeTrialPrompt: React.FC<Props> = ({ isOpen, onClose, onStartTrial, isDarkMode }) => {
  if (!isOpen) return null;

  const premiumPlan = PAYMENT_PLANS.find(plan => plan.id === 'premium');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`${
        isDarkMode ? 'bg-indigo-900' : 'bg-white'
      } rounded-2xl p-8 max-w-lg w-full shadow-2xl relative overflow-hidden`}>
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-black/10 transition-colors"
        >
          <X className={isDarkMode ? 'text-white/70' : 'text-gray-600'} />
        </button>

        <div className="relative">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 animate-pulse">
                  <Sparkles className={`w-12 h-12 ${
                    isDarkMode ? 'text-indigo-400' : 'text-indigo-500'
                  }`} />
                </div>
                <Sparkles className={`w-12 h-12 ${
                  isDarkMode ? 'text-indigo-300' : 'text-indigo-600'
                }`} />
              </div>
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Unlock Unlimited Readings
            </h2>
            <p className={`${isDarkMode ? 'text-indigo-200' : 'text-gray-600'}`}>
              You've used all your free readings. Continue your spiritual journey with our premium features!
            </p>
          </div>

          {/* Features */}
          <div className={`mb-6 p-4 rounded-xl ${
            isDarkMode ? 'bg-indigo-800/50' : 'bg-indigo-50'
          }`}>
            <ul className="space-y-3">
              {premiumPlan?.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Sparkles className={`w-5 h-5 ${
                    isDarkMode ? 'text-indigo-300' : 'text-indigo-600'
                  }`} />
                  <span className={isDarkMode ? 'text-white' : 'text-gray-800'}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Trial offer */}
          <div className="text-center mb-6">
            <div className={`text-3xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              24 Hours Free
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-indigo-200' : 'text-gray-600'}`}>
              Then ${premiumPlan?.price}/month. Cancel anytime.
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={onStartTrial}
              className={`w-full py-3 px-6 rounded-lg ${
                isDarkMode
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'bg-indigo-500 hover:bg-indigo-600'
              } text-white font-semibold transition-colors flex items-center justify-center gap-2`}
            >
              <Sparkles className="w-5 h-5" />
              Start Free Trial
            </button>
            <button
              onClick={onClose}
              className={`w-full py-3 px-6 rounded-lg ${
                isDarkMode
                  ? 'bg-indigo-800/50 hover:bg-indigo-700/50'
                  : 'bg-gray-100 hover:bg-gray-200'
              } transition-colors`}
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreeTrialPrompt;