/** @jsxImportSource react */
import { useState, useEffect } from 'react';
import type { FC } from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: FC<LoadingSpinnerProps> = ({ message = 'Loading...' }) => {
  const [showSlowLoadingMessage, setShowSlowLoadingMessage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSlowLoadingMessage(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-90 z-50">
      <div className="w-12 h-12 border-4 border-white border-b-transparent rounded-full animate-spin mb-4"></div>
      <div className="text-white text-center">
        <p className="mb-2">{message}</p>
        {showSlowLoadingMessage && (
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