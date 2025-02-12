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
    <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Mystic Balls
          </h1>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={onDarkModeToggle}
              className={`theme-toggle p-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } transition-colors`}
            >
              {isDarkMode ? '🌞' : '🌙'}
            </button>

            {user ? (
              <div className="flex items-center space-x-4">
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {user.email}
                </span>
                <button
                  onClick={onSignOut}
                  className={`px-4 py-2 rounded-lg ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } transition-colors`}
                >
                  Sign Out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
