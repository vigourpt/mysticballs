import React from 'react';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '../services/supabase';
import { Moon, Sun } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  isDarkMode: boolean;
  onDarkModeToggle: () => void;
  onSignOut: () => Promise<{ success: boolean }>;
  userProfile?: UserProfile;
}

const Header: React.FC<HeaderProps> = ({
  user,
  isDarkMode,
  onDarkModeToggle,
  onSignOut,
  userProfile
}) => {
  return (
    <header className={`${isDarkMode ? 'bg-gray-800/20' : 'bg-white/10'} shadow-sm`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-start">
          <h1 className="text-4xl font-bold text-white relative group">
            <span className="absolute inset-0 -left-8 -right-8 bg-fuchsia-500/20 blur-xl rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
            <span className="absolute inset-0 -left-8 -right-8 bg-fuchsia-500/20 blur-lg rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
            <span className="absolute inset-0 -left-8 -right-8 bg-fuchsia-500/20 blur-md rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
            <span className="relative glow-text">Mystic Balls</span>
          </h1>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={onDarkModeToggle}
              className="p-2 rounded-lg bg-indigo-900/40 hover:bg-indigo-900/60 transition-colors"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-white" />
              ) : (
                <Moon className="w-5 h-5 text-white" />
              )}
            </button>

            {user && (
              <div className="flex flex-col items-end space-y-1">
                <span className="text-sm text-white">
                  {user.email}
                </span>
                {userProfile && (
                  <span className="text-sm text-fuchsia-300">
                    {userProfile.is_premium ? 'Premium Member' : `${10 - (userProfile.readings_count || 0)} free readings remaining`}
                  </span>
                )}
                <button
                  onClick={onSignOut}
                  className="text-sm text-gray-300 hover:text-white transition-colors"
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
