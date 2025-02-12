import { useState } from 'react';
import type { ReadingType, ReadingField } from '../types';

interface Props {
  readingType: ReadingType;
  onSubmit: (formData: Record<string, string>) => Promise<void>;
  onClose: () => void;
  isDarkMode?: boolean;
}

export const ReadingForm = ({ readingType, onSubmit, onClose, isDarkMode = true }: Props) => {
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (field: ReadingField, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field.name]: value
    }));
  };

  const baseInputClasses = isDarkMode
    ? 'bg-indigo-800/50 border-indigo-700 text-white placeholder-gray-400'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className={`p-8 rounded-xl max-w-xl w-full ${
        isDarkMode ? 'bg-indigo-900/90' : 'bg-white'
      }`}>
        <h2 className={`text-2xl font-bold mb-6 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {readingType.name}
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
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                isDarkMode 
                  ? 'bg-indigo-800/50 text-white hover:bg-indigo-700/50' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              Get Reading
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReadingForm;