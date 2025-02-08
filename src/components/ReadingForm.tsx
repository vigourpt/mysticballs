import React, { useState } from 'react';
import { ReadingType } from '../types';
import { getReading } from '../services/openai';
import AngelNumbersForm from './forms/AngelNumbersForm';
import AstrologyForm from './forms/AstrologyForm';
import DreamForm from './forms/DreamForm';
import HoroscopeForm from './forms/HoroscopeForm';
import NumerologyForm from './forms/NumerologyForm';
import QuestionForm from './forms/QuestionForm';
import AuraForm from './forms/AuraForm';
import PastLifeForm from './forms/PastLifeForm';
import { FormValues } from './forms/types';

interface Props {
  readingType: ReadingType;
  isDarkMode: boolean;
  onReadingComplete: (reading: string) => void;
  onReadingRequest: () => boolean;
}

const ReadingForm: React.FC<Props> = ({
  readingType,
  isDarkMode,
  onReadingComplete,
  onReadingRequest
}) => {
  const [formValues, setFormValues] = useState<FormValues>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const inputClassName = `w-full p-3 rounded-lg bg-opacity-50 ${
    isDarkMode
      ? 'bg-indigo-900 text-white placeholder-indigo-300 border-indigo-700'
      : 'bg-white text-gray-800 placeholder-gray-400 border-indigo-100'
  } border focus:outline-none focus:ring-2 focus:ring-indigo-500`;

  const labelClassName = `block mb-2 ${
    isDarkMode ? 'text-indigo-200' : 'text-gray-700'
  }`;

  const handleInputChange = (field: string, value: string) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!onReadingRequest()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Validate required fields based on reading type
      const requiredFields = {
        'numerology': ['numbers'],
        'astrology': ['question'],
        'angels': ['numbers'],
        'horoscope': ['sign'],
        'dreams': ['dream'],
        'aura': ['description'],
        'pastlife': ['patterns']
      };

      const fields = requiredFields[readingType.id as keyof typeof requiredFields] || ['question'];
      const missingFields = fields.filter(field => !formValues[field]);

      if (missingFields.length > 0) {
        throw new Error(`Please fill in the required field${missingFields.length > 1 ? 's' : ''}: ${missingFields.join(', ')}`);
      }

      const userInput = {
        ...formValues,
        date: new Date().toISOString().split('T')[0] || ''
      };

      const reading = await getReading(readingType.id, userInput);
      onReadingComplete(reading);
    } catch (err) {
      console.error('Reading error:', err);
      let errorMessage = 'Failed to generate reading';
      
      if (err instanceof Error) {
        if (err.message.includes('API key')) {
          errorMessage = 'API configuration error. Please contact support.';
        } else if (err.message.includes('rate limit')) {
          errorMessage = 'Too many requests. Please try again in a moment.';
        } else if (err.message.includes('required field')) {
          errorMessage = err.message;
        } else {
          errorMessage = `Reading generation failed: ${err.message}`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getReadingTitle = (type: ReadingType) => {
    return type.name;
  };

  const renderForm = () => {
    const formProps = {
      isDarkMode,
      inputClassName,
      labelClassName,
      values: formValues,
      onChange: handleInputChange
    };

    switch (readingType.id) {
      case 'numerology':
        return <NumerologyForm {...formProps} />;
      case 'astrology':
        return <AstrologyForm {...formProps} />;
      case 'angels':
        return <AngelNumbersForm {...formProps} />;
      case 'horoscope':
        return <HoroscopeForm {...formProps} />;
      case 'dreams':
        return <DreamForm {...formProps} />;
      case 'aura':
        return <AuraForm {...formProps} />;
      case 'pastlife':
        return <PastLifeForm {...formProps} />;
      default:
        return <QuestionForm {...formProps} />;
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`p-6 rounded-xl reading-form ${
      isDarkMode
        ? 'bg-indigo-900/30 backdrop-blur-sm'
        : 'bg-white/80 backdrop-blur-sm'
    } shadow-xl`}>
      <h2 className={`text-2xl font-semibold mb-6 ${
        isDarkMode ? 'text-white' : 'text-gray-800'
      }`}>
        {getReadingTitle(readingType)}
      </h2>
      {renderForm()}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3 px-6 rounded-lg ${
          isDarkMode
            ? 'bg-indigo-600 hover:bg-indigo-700'
            : 'bg-indigo-500 hover:bg-indigo-600'
        } text-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isLoading ? 'Generating Reading...' : 'Get Your Reading'}
      </button>
    </form>
  );
};

export default ReadingForm;