import React from 'react';
import { Heart } from 'lucide-react';

interface Props {
  isDarkMode: boolean;
  onPrivacyClick: () => void;
  onTermsClick: () => void;
}

const Footer: React.FC<Props> = ({ isDarkMode, onPrivacyClick, onTermsClick }) => {
  return (
    <footer className={`mt-16 py-8 border-t ${
      isDarkMode ? 'border-indigo-800/50 text-indigo-200' : 'border-indigo-100 text-gray-600'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500" />
            <span>by Mystic Insights</span>
          </div>
          
          <nav className="flex items-center gap-6 text-sm">
            <button
              onClick={onPrivacyClick}
              className={`hover:${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors`}
            >
              Privacy Policy
            </button>
            <button
              onClick={onTermsClick}
              className={`hover:${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors`}
            >
              Terms of Service
            </button>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;