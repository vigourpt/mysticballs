import type { ReadingType } from '../types';

interface Props {
  readingType: ReadingType;
  onClick: () => void;
  selected?: boolean;
  isDarkMode?: boolean;
}

export const ReadingTypeCard = ({ readingType, onClick, selected, isDarkMode }: Props) => {
  const Icon = readingType.icon;

  return (
    <button
      onClick={onClick}
      className={`w-full h-full flex flex-col items-center text-center p-8 rounded-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 group ${
        isDarkMode 
          ? 'bg-indigo-900/40 hover:bg-indigo-800/40' 
          : 'bg-white/90 hover:bg-white'
      } ${selected ? 'ring-2 ring-purple-400' : ''}`}
    >
      <div className={`p-4 mb-4 rounded-xl group-hover:bg-opacity-80 ${
        isDarkMode 
          ? 'bg-indigo-800/40 group-hover:bg-indigo-700/40' 
          : 'bg-indigo-100'
      }`}>
        <Icon className={`w-8 h-8 ${isDarkMode ? 'text-purple-200' : 'text-indigo-600'}`} />
      </div>
      <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {readingType.name}
      </h3>
      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        {readingType.description}
      </p>
    </button>
  );
};

export default ReadingTypeCard;
