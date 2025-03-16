import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Step } from '../types';

interface Props {
  steps: Step[];
  isOpen: boolean;
  onComplete: () => void;
  isDarkMode: boolean;
}

const OnboardingOverlay: React.FC<Props> = ({ steps, isOpen, onComplete, isDarkMode }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && steps[currentStep]) {
      const element = document.querySelector(steps[currentStep].target);
      if (element) {
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const tooltipHeight = 160; // Approximate height of tooltip
        const tooltipWidth = 300; // Width of tooltip
        
        // Position in the middle left of the screen by default
        let top = Math.max(20, (viewportHeight - tooltipHeight) / 2);
        let left = 50; // Position on the left side with some margin

        if (rect.height > 0) {
          // If element exists and is visible, position relative to it
          switch (steps[currentStep].placement) {
            case 'top':
              top = rect.top - tooltipHeight - 10;
              left = rect.left + (rect.width - tooltipWidth) / 2;
              break;
            case 'bottom':
              top = rect.bottom + 10;
              left = rect.left + (rect.width - tooltipWidth) / 2;
              break;
            case 'left':
              top = rect.top + (rect.height - tooltipHeight) / 2;
              left = rect.left - tooltipWidth - 10;
              break;
            case 'right':
              top = rect.top + (rect.height - tooltipHeight) / 2;
              left = rect.right + 10;
              break;
          }
        }

        // Ensure tooltip stays within viewport
        top = Math.max(20, Math.min(top, viewportHeight - tooltipHeight - 20));
        left = Math.max(20, Math.min(left, window.innerWidth - tooltipWidth - 20));

        setPosition({ 
          top: top + window.scrollY,
          left: left + window.scrollX
        });
      }
    }
  }, [currentStep, isOpen, steps]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const step = steps[currentStep];

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[999]" />
      
      <div
        className={`fixed z-[1000] p-4 rounded-lg shadow-xl w-[300px] ${
          isDarkMode
            ? 'bg-indigo-900 text-white'
            : 'bg-white text-gray-800'
        }`}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`
        }}
      >
        <button
          onClick={onComplete}
          className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
          aria-label="Close tutorial"
        >
          <X size={16} />
        </button>
        
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">{step?.title}</h3>
          <p className={isDarkMode ? 'text-indigo-200' : 'text-gray-600'}>
            {step?.content}
          </p>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="space-x-1">
            {steps.map((_, index) => (
              <span
                key={index}
                className={`inline-block w-2 h-2 rounded-full ${
                  index === currentStep
                    ? 'bg-indigo-500'
                    : isDarkMode
                      ? 'bg-indigo-700'
                      : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={handleNext}
            className={`px-4 py-2 rounded-lg ${
              isDarkMode
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-indigo-500 hover:bg-indigo-600'
            } text-white transition-colors`}
          >
            {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </>
  );
};

export default OnboardingOverlay;