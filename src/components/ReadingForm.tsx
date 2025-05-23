import { useState } from 'react';
import type { ReadingType, ReadingField } from '../types';

interface Props {
  readingType: ReadingType;
  onSubmit: (formData: Record<string, string>) => Promise<void>;
  isDarkMode?: boolean;
  isLoading?: boolean;
}

export const ReadingForm = ({ readingType, onSubmit, isDarkMode = true, isLoading = false }: Props) => {
  console.log('[ReadingForm Render] Props received - isLoading:', isLoading, 'readingType:', readingType ? readingType.id : 'None'); // ADDED
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleChange = (field: ReadingField, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field.name]: value
    }));
  };

  const baseInputClasses = isDarkMode
    ? 'bg-indigo-800/50 border-indigo-700 text-white placeholder-gray-400'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500';

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('[ReadingForm handleSubmit] Form submission attempted. isLoading currently:', isLoading); // ADDED
    e.preventDefault();
    try {
      console.log('[ReadingForm handleSubmit] About to call props.onSubmit(formData).'); // ADDED
      await onSubmit(formData);
    } catch (error) {
      console.log('[ReadingForm handleSubmit] Error caught locally in ReadingForm:', error); // ADDED
      console.error('Error submitting form:', error); // Existing log
    }
  };

  return (
    <div className="bg-indigo-900/40 rounded-xl p-8">
      <h2 className="text-2xl md:text-3xl font-bold text-white relative group mb-8">
        <span className="absolute -inset-2 bg-fuchsia-500/20 blur-xl rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
        <span className="absolute -inset-2 bg-fuchsia-500/20 blur-lg rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
        <span className="absolute -inset-2 bg-fuchsia-500/20 blur-md rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
        <span className="relative glow-text">{readingType.name}</span>
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {readingType.fields?.map((field) => (
          <div key={field.name}>
            <label 
              htmlFor={field.name}
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              {field.displayName}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                id={field.name}
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field, e.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 ${baseInputClasses}`}
                rows={4}
              />
            ) : field.type === 'select' ? (
              <select
                id={field.name}
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field, e.target.value)}
                required={field.required}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 ${baseInputClasses}`}
              >
                <option value="">Select an option</option>
                {field.options?.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                id={field.name}
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field, e.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 ${baseInputClasses}`}
              />
            )}
          </div>
        ))}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-8 py-3 bg-purple-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-lg font-semibold flex items-center justify-center min-w-[200px] ${
              isLoading ? 'opacity-80 cursor-not-allowed' : 'hover:bg-purple-500'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Get Your Reading'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReadingForm;
