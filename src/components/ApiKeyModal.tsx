import React, { useState } from 'react';
import { Key } from 'lucide-react';
import { setApiKey } from '../config/openai';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

const ApiKeyModal: React.FC<Props> = ({ isOpen, onClose, isDarkMode }) => {
  const [apiKey, setApiKeyInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(apiKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${
        isDarkMode
          ? 'bg-indigo-900 text-white'
          : 'bg-white text-gray-800'
      } rounded-xl p-6 max-w-md w-full shadow-xl`}>
        <div className="flex items-center gap-2 mb-4">
          <Key className={isDarkMode ? 'text-indigo-300' : 'text-indigo-600'} />
          <h2 className="text-xl font-semibold">OpenAI API Key</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block mb-2 ${
              isDarkMode ? 'text-indigo-200' : 'text-gray-700'
            }`}>
              Enter your OpenAI API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className={`w-full p-3 rounded-lg ${
                isDarkMode
                  ? 'bg-indigo-800 border-indigo-700'
                  : 'bg-white border-gray-300'
              } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              placeholder="sk-..."
              required
            />
          </div>
          
          <div className="flex gap-2">
            <button
              type="submit"
              className={`flex-1 py-2 px-4 rounded-lg ${
                isDarkMode
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'bg-indigo-500 hover:bg-indigo-600'
              } text-white transition-colors`}
            >
              Save Key
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`py-2 px-4 rounded-lg ${
                isDarkMode
                  ? 'bg-gray-800 hover:bg-gray-700'
                  : 'bg-gray-200 hover:bg-gray-300'
              } transition-colors`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyModal;