/** @jsxImportSource react */
import { useState, useEffect } from 'react';
import type { FC } from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  showSlowLoadingMessage?: boolean;
  className?: string;
}

const LoadingSpinner: FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  size = 'medium',
  showSlowLoadingMessage = true,
  className = ''
}) => {
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (!showSlowLoadingMessage) return;

    const timer = setTimeout(() => {
      setShowMessage(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [showSlowLoadingMessage]);

  const sizeClasses = {
    small: 'w-6 h-6 border-2',
    medium: 'w-12 h-12 border-4',
    large: 'w-16 h-16 border-4'
  };

  return (
    <div className={`fixed inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-90 z-50 ${className}`}>
      <div className={`${sizeClasses[size]} border-white border-b-transparent rounded-full animate-spin mb-4`}></div>
      <div className="text-white text-center">
        <p className="mb-2">{message}</p>
        {showMessage && showSlowLoadingMessage && (
          <p className="text-gray-400 text-sm">
            This is taking longer than expected.<br />
            Please wait a moment...
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;