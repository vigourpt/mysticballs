import React, { useEffect, useState } from 'react';

const PaymentCancel: React.FC = () => {
  const [countdown, setCountdown] = useState<number>(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = '/';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-900 to-blue-950">
      <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8 shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">
          Payment Cancelled
        </h2>
        <div className="text-center">
          <p className="text-lg text-gray-300 mb-6">
            Your payment was cancelled. You can try again whenever you're ready.
          </p>
          <p className="text-sm text-gray-400">
            Redirecting to home page in {countdown} seconds...
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-6 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
