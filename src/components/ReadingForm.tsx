import React from 'react';
import { ReadingType, ReadingField } from '../types';

interface Props {
  readingType: ReadingType;
  onSubmit: (formData: Record<string, string>) => void;
  isDarkMode: boolean;
}

const ReadingForm: React.FC<Props> = ({ readingType, onSubmit, isDarkMode }) => {
  const [formData, setFormData] = React.useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const renderField = (field: ReadingField) => {
    const baseClasses = `w-full p-2 rounded-lg border ${
      isDarkMode
        ? 'bg-gray-800 border-gray-600 text-white'
        : 'bg-white border-gray-300 text-gray-900'
    }`;

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            name={field.name}
            value={formData[field.name] || ''}
            onChange={handleChange}
            required={field.required}
            className={`${baseClasses} h-32`}
            placeholder={field.placeholder}
          />
        );
      case 'select':
        return (
          <select
            name={field.name}
            value={formData[field.name] || ''}
            onChange={handleChange}
            required={field.required}
            className={baseClasses}
          >
            <option value="">Select your zodiac sign</option>
            {['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'].map(sign => (
              <option key={sign} value={sign.toLowerCase()}>{sign}</option>
            ))}
          </select>
        );
      default:
        return (
          <input
            type={field.type}
            name={field.name}
            value={formData[field.name] || ''}
            onChange={handleChange}
            required={field.required}
            className={baseClasses}
            placeholder={field.placeholder}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {readingType.fields.map(field => (
        <div key={field.name} className="space-y-2">
          <label className={`block font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {renderField(field)}
        </div>
      ))}
      <button
        type="submit"
        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors
          ${isDarkMode
            ? 'bg-purple-600 hover:bg-purple-700 text-white'
            : 'bg-purple-500 hover:bg-purple-600 text-white'
          }`}
      >
        Get Your Reading
      </button>
    </form>
  );
};

export default ReadingForm;