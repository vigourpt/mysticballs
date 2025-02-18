import { useState } from 'react';
import type { ReadingType, ReadingField } from '../types';

interface Props {
  readingType: ReadingType;
  onSubmit: (formData: Record<string, string>) => Promise<void>;
  isDarkMode?: boolean;
}

export const ReadingForm = ({ readingType, onSubmit, isDarkMode = true }: Props) => {
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
    e.preventDefault();
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
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
            className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 text-lg font-semibold"
          >
            Get Your Reading
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReadingForm;
