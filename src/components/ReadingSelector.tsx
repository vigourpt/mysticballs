import React from 'react';
import type { ReadingType } from '../types';

interface Props {
  READING_TYPES: ReadingType[];
  handleReadingTypeSelect: (reading: ReadingType) => void;
  isDarkMode: boolean;
  isPremium?: boolean;
  freeReadingsRemaining?: number;
}

const ReadingSelector: React.FC<Props> = ({ 
  READING_TYPES, 
  handleReadingTypeSelect, 
  isDarkMode, 
  isPremium = false,
  freeReadingsRemaining = 0
}) => {
  return (
    <section id="reading-types">
      <h2 className="text-2xl md:text-3xl font-bold text-white relative group mb-12">
        <span className="absolute -inset-2 bg-fuchsia-500/20 blur-xl rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
        <span className="absolute -inset-2 bg-fuchsia-500/20 blur-lg rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
        <span className="absolute -inset-2 bg-fuchsia-500/20 blur-md rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
        <span className="relative glow-text text-center block">Discover Our Reading Types</span>
      </h2>
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {READING_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => {
                  // Allow premium readings if user is premium OR has free readings remaining
                  if (!type.premiumOnly || isPremium || freeReadingsRemaining > 0) {
                    handleReadingTypeSelect(type);
                  } else {
                    // Only show alert if user has no free readings and is not premium
                    alert('This reading type requires a premium subscription');
                  }
                }}
                className={`group relative p-6 rounded-xl text-left transition-all duration-300 transform ${
                  type.premiumOnly && !isPremium ? 'cursor-not-allowed opacity-75' : 'hover:scale-105 cursor-pointer'
                } ${
                  isDarkMode
                    ? 'bg-gradient-to-br from-indigo-800/50 to-purple-800/50 hover:from-indigo-700/50 hover:to-purple-700/50'
                    : 'bg-gradient-to-br from-white to-indigo-50 hover:from-indigo-50 hover:to-white'
              } backdrop-blur-sm shadow-xl`}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  {type.premiumOnly && (
                    <div className="absolute top-2 right-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isPremium 
                          ? 'bg-gradient-to-r from-green-500 to-green-300 text-green-900'
                          : freeReadingsRemaining > 0
                          ? 'bg-gradient-to-r from-blue-500 to-blue-300 text-blue-900'
                          : 'bg-gradient-to-r from-amber-500 to-amber-300 text-amber-900'
                      }`}>
                        {isPremium 
                          ? 'Premium' 
                          : freeReadingsRemaining > 0
                          ? `Free (${freeReadingsRemaining} left)`
                          : 'Premium Only'}
                      </span>
                    </div>
                  )}
                  <Icon
                    size={48}
                    className={`${
                      isDarkMode ? 'text-indigo-300' : 'text-indigo-600'
                    } transition-transform group-hover:scale-110`}
                  />
                  <h3 className={`text-xl font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    {type.name}
                  </h3>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-indigo-200' : 'text-gray-600'
                  }`}>
                    {type.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ReadingSelector;
