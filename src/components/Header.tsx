import React from 'react';
import { User } from '@supabase/supabase-js';

interface HeaderProps {
  user: User | null;
  isDarkMode: boolean;
  onDarkModeToggle: () => void;
  onSignOut: () => Promise<{ success: boolean }>;
}

const Header: React.FC<HeaderProps> = ({
  user,
  isDarkMode,
  onDarkModeToggle,
  onSignOut
}) => {
  return (
    <header className={`${isDarkMode ? 'bg-gray-800/20' : 'bg-white/10'} shadow-sm`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-white relative group">
            <span className="absolute -inset-1 bg-fuchsia-500/20 blur-xl rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
            <span className="absolute -inset-1 bg-fuchsia-500/20 blur-lg rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
            <span className="absolute -inset-1 bg-fuchsia-500/20 blur-md rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
            <span className="relative glow-text">Mystic Balls</span>
          </h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={onDarkModeToggle}
              className={`theme-toggle p-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-700/50 text-gray-200 hover:bg-gray-600/50' 
                  : 'bg-gray-100/50 text-gray-600 hover:bg-gray-200/50'
              } transition-colors`}
            >
              {isDarkMode ? '🌞' : '🌙'}
            </button>

            {user && (
              <div className="flex items-center space-x-4">
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {user.email}
                </span>
                <button
                  onClick={onSignOut}
                  className={`px-4 py-2 rounded-lg ${
                    isDarkMode
                      ? 'bg-gray-700/50 text-gray-200 hover:bg-gray-600/50'
                      : 'bg-gray-100/50 text-gray-600 hover:bg-gray-200/50'
                  } transition-colors`}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
