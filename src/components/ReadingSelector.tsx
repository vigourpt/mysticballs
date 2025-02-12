import React from 'react';
import type { ReadingType } from '../types';

interface Props {
  READING_TYPES: ReadingType[];
  handleReadingTypeSelect: (reading: ReadingType) => void;
  isDarkMode: boolean;
}

const ReadingSelector: React.FC<Props> = ({ READING_TYPES, handleReadingTypeSelect, isDarkMode }) => {
  return (
    <section id="reading-types">
      <h2 className="text-3xl font-bold text-center mb-12">Discover Our Reading Types</h2>
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {READING_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => handleReadingTypeSelect(type)}
                className={`group relative p-6 rounded-xl text-left transition-all duration-300 transform hover:scale-105 ${
                  isDarkMode
                    ? 'bg-gradient-to-br from-indigo-800/50 to-purple-800/50 hover:from-indigo-700/50 hover:to-purple-700/50'
                    : 'bg-gradient-to-br from-white to-indigo-50 hover:from-indigo-50 hover:to-white'
              } backdrop-blur-sm shadow-xl`}
              >
                <div className="flex flex-col items-center text-center space-y-4">
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
