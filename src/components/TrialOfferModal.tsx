import React from 'react';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

const TrialOfferModal: React.FC<Props> = ({ isOpen, onClose, isDarkMode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${
        isDarkMode
          ? 'bg-indigo-900 text-white'
          : 'bg-white text-gray-800'
      } rounded-xl p-6 max-w-md w-full shadow-xl relative`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-opacity-10 hover:bg-white transition-colors"
        >
          <X className={isDarkMode ? 'text-indigo-200' : 'text-gray-600'} />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">🌟 Special Offer!</h2>
          <p className={`${isDarkMode ? 'text-indigo-200' : 'text-gray-600'} mb-4`}>
            Try Premium Features FREE for 24 Hours
          </p>
          <div className={`${
            isDarkMode ? 'bg-indigo-800/50' : 'bg-indigo-50'
          } p-4 rounded-lg mb-6`}>
            <ul className="space-y-2 text-left">
              <li className="flex items-center">
                <span className="mr-2">✨</span>
                Unlimited readings
              </li>
              <li className="flex items-center">
                <span className="mr-2">🎯</span>
                Access to all reading types
              </li>
              <li className="flex items-center">
                <span className="mr-2">💫</span>
                Detailed interpretations
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top" className="w-full">
            <input type="hidden" name="cmd" value="_s-xclick" />
            <input type="hidden" name="hosted_button_id" value="YOUR_BUTTON_ID" />
            <input type="hidden" name="custom" value="trial_subscription" />
            <input type="hidden" name="a3" value="19.99" />
            <input type="hidden" name="p3" value="1" />
            <input type="hidden" name="t3" value="M" />
            <input type="hidden" name="src" value="1" />
            <input type="hidden" name="trial_period" value="1" />
            <input type="hidden" name="trial_amount" value="0" />
            <button
              type="submit"
              className={`w-full py-3 px-6 rounded-lg ${
                isDarkMode
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'bg-indigo-500 hover:bg-indigo-600'
              } text-white transition-colors duration-300 flex items-center justify-center gap-2`}
            >
              <img src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_100x26.png" alt="PayPal" className="h-4" />
              Start Free Trial
            </button>
          </form>
          
          <p className={`text-xs ${isDarkMode ? 'text-indigo-300' : 'text-gray-500'}`}>
            After trial ends, subscription continues at $19.99/month unless cancelled
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrialOfferModal;