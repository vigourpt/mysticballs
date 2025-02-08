import React from 'react';
import { Step } from '../types';

interface TourGuideProps {
  steps: Step[];
  currentStep: Step;
  onClose: () => void;
  size?: 'small' | 'medium' | 'large';
}

const TourGuide: React.FC<TourGuideProps> = ({
  steps,
  currentStep,
  onClose,
  size = 'medium'
}) => {
  const getPositionStyles = (position: Step['position']) => {
    switch (position) {
      case 'top':
        return 'bottom-full mb-2';
      case 'bottom':
        return 'top-full mt-2';
      case 'left':
        return 'right-full mr-2';
      case 'right':
        return 'left-full ml-2';
      default:
        return 'top-full mt-2';
    }
  };

  const getSizeStyles = (size: 'small' | 'medium' | 'large') => {
    switch (size) {
      case 'small':
        return 'w-64';
      case 'large':
        return 'w-96';
      default:
        return 'w-80';
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="relative w-full h-full">
        {currentStep && (
          <div
            className={`absolute ${getPositionStyles(currentStep.position)} ${getSizeStyles(size)} bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 pointer-events-auto`}
            style={{
              left: currentStep.target ? document.querySelector(currentStep.target)?.getBoundingClientRect().left : 0,
              top: currentStep.target ? document.querySelector(currentStep.target)?.getBoundingClientRect().top : 0,
            }}
          >
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <div className="mt-1">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {currentStep.title}
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {currentStep.content}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TourGuide;
