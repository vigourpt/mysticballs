import React from 'react';
import { ReadingType } from '../types';

interface Props {
  readingType: ReadingType;
  selected: boolean;
  onClick: () => void;
  isDarkMode: boolean;
}

const ReadingTypeCard: React.FC<Props> = ({ readingType, selected, onClick, isDarkMode }) => {
  const Icon = readingType.icon;
  
  return (
    <div
      onClick={onClick}
      className={`p-6 rounded-lg cursor-pointer transition-all transform hover:scale-105
        ${selected
          ? isDarkMode
            ? 'bg-purple-900 ring-2 ring-purple-400'
            : 'bg-purple-100 ring-2 ring-purple-500'
          : isDarkMode
            ? 'bg-gray-800 hover:bg-gray-700'
            : 'bg-white hover:bg-gray-50'
        }
        ${isDarkMode ? 'text-white' : 'text-gray-900'}
      `}
    >
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-full ${
          selected
            ? isDarkMode
              ? 'bg-purple-800 text-purple-200'
              : 'bg-purple-200 text-purple-700'
            : isDarkMode
              ? 'bg-gray-700 text-gray-300'
              : 'bg-gray-100 text-gray-600'
        }`}>
          <Icon size={24} strokeWidth={2} />
        </div>
        <div>
          <h3 className="font-semibold">{readingType.name}</h3>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {readingType.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReadingTypeCard;
