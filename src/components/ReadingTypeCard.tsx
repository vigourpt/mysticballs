import React from 'react';
import { ReadingType } from '../types';

interface Props {
  readingType: ReadingType;
  onClick: () => void;
}

const ReadingTypeCard: React.FC<Props> = ({ readingType, onClick }) => {
  const Icon = readingType.icon;
  
  return (
    <button
      onClick={onClick}
      className="w-full h-full flex flex-col items-center text-center p-8 bg-indigo-900/40 rounded-xl transition-all duration-300 hover:bg-indigo-800/40 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 group"
    >
      <div className="p-4 mb-4 bg-indigo-800/40 rounded-xl group-hover:bg-indigo-700/40">
        <Icon className="w-8 h-8 text-purple-200" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{readingType.name}</h3>
      <p className="text-sm text-gray-300">{readingType.description}</p>
    </button>
  );
};

export default ReadingTypeCard;
