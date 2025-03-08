import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { STRIPE_TEST_MODE } from '../config/constants';
import { AlertTriangle } from 'lucide-react';

const AdminControls: React.FC = () => {
  const { isAdmin } = useAuth();
  const [isTestMode, setIsTestMode] = useState(STRIPE_TEST_MODE);
  
  // Initialize isTestMode from localStorage
  useEffect(() => {
    const testMode = localStorage.getItem('STRIPE_TEST_MODE') === 'true';
    setIsTestMode(testMode);
  }, []);
  
  // If not admin, don't render anything
  if (!isAdmin) return null;
  
  const toggleTestMode = () => {
    const newMode = !isTestMode;
    setIsTestMode(newMode);
    localStorage.setItem('STRIPE_TEST_MODE', String(newMode));
    
    // Show confirmation message
    alert(`Stripe ${newMode ? 'TEST' : 'LIVE'} mode activated. The page will now reload.`);
    
    // Reload to apply changes
    window.location.reload();
  };
  
  return (
    <div className="admin-panel p-4 bg-gray-800 text-white rounded-lg mb-4">
      <h2 className="text-xl font-bold mb-2">Admin Controls</h2>
      <div className="form-control">
        <label className="flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={isTestMode} 
            onChange={toggleTestMode}
            className="mr-2"
          />
          <span>Enable Stripe Test Mode</span>
        </label>
        {isTestMode && (
          <div className="bg-yellow-600 text-white p-2 rounded mt-2">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <span>TEST MODE ACTIVE - No real charges will be made</span>
            </div>
            <div className="text-xs mt-1 text-yellow-200">
              Note: If Stripe test keys are not configured in the environment, the system will attempt to fall back to live keys in test mode.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminControls;
