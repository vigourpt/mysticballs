import React from 'react';
import { HelpCircle } from 'lucide-react';
import Tooltip from './Tooltip';

interface Props {
  isDarkMode: boolean;
  onStartTutorial: () => void;
}

const TutorialButton: React.FC<Props> = ({ isDarkMode, onStartTutorial }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[998]">
      <Tooltip content="Start Tutorial" position="left">
        <button
          onClick={onStartTutorial}
          className={`p-3 rounded-full shadow-lg ${
            isDarkMode
              ? 'bg-indigo-600 hover:bg-indigo-700'
              : 'bg-indigo-500 hover:bg-indigo-600'
          } text-white transition-colors`}
        >
          <HelpCircle size={24} />
        </button>
      </Tooltip>
    </div>
  );
};

export default TutorialButton;