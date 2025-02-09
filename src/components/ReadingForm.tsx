import React, { useState } from 'react';
import { ReadingType, FormField } from '../types';

interface Props {
  readingType: ReadingType;
  isDarkMode: boolean;
  onReadingComplete: (reading: string) => void;
  onReadingRequest: () => boolean;
  session: any;
  setShowUpgradeModal: (show: boolean) => void;
}

const ReadingForm: React.FC<Props> = ({
  readingType,
  isDarkMode,
  onReadingComplete,
  onReadingRequest,
  session,
  setShowUpgradeModal
}) => {
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const inputClassName = `w-full p-3 rounded-lg bg-opacity-50 ${
    isDarkMode
      ? 'bg-gray-800 text-white placeholder-gray-400'
      : 'bg-white text-gray-900 placeholder-gray-500'
  }`;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormValues(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!onReadingRequest()) {
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/.netlify/functions/getReading', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ readingType: readingType.id, userInput: formValues })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          // Show upgrade modal with remaining readings info
          setShowUpgradeModal(true);
        } else {
          throw new Error(data.error || 'Failed to get reading');
        }
        return;
      }

      // Call onReadingComplete with the reading
      onReadingComplete(data.reading);
      
      // Show remaining readings message for free users
      if (data.readingsRemaining !== null) {
        setMessage(`You have ${data.readingsRemaining} free readings remaining.`);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {readingType.formFields.map((field: FormField) => (
        <div key={field.name} className="space-y-2">
          <label
            htmlFor={field.name}
            className={`block text-sm font-medium ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}
          >
            {field.label}
          </label>
          {field.type === 'textarea' ? (
            <textarea
              id={field.name}
              name={field.name}
              placeholder={field.placeholder}
              required={field.required}
              value={formValues[field.name] || ''}
              onChange={handleInputChange}
              className={`${inputClassName} min-h-[100px]`}
            />
          ) : (
            <input
              type={field.type}
              id={field.name}
              name={field.name}
              placeholder={field.placeholder}
              required={field.required}
              value={formValues[field.name] || ''}
              onChange={handleInputChange}
              className={inputClassName}
            />
          )}
        </div>
      ))}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
          {error}
        </div>
      )}
      {message && (
        <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 text-yellow-500 text-sm">
          {message}
        </div>
      )}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
      >
        {isLoading ? 'Getting Your Reading...' : 'Get Reading'}
      </button>
    </form>
  );
};

export default ReadingForm;