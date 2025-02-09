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
import Magic8BallForm from './forms/Magic8BallForm';
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
      // Map form values to expected API input fields
      const userInput: Record<string, string> = { ...formValues };
      console.log('Submitting form with values:', { readingType: readingType.id, userInput });

      // Special handling for specific reading types
      switch (readingType.id) {
        case 'tarot':
        case 'oracle':
        case 'runes':
        case 'iching':
        case 'magic8ball':
          if (!userInput.question) {
            throw new Error('Please enter your question');
          }
          break;

        case 'numerology':
          if (!userInput.name || !userInput.birthdate) {
            throw new Error('Please enter your name and birth date');
          }
          break;

        case 'astrology':
          if (!userInput.sign || !userInput.birthdate) {
            throw new Error('Please enter your zodiac sign and birth date');
          }
          break;

        case 'angels':
          if (!userInput.name || !userInput.number) {
            throw new Error('Please enter your name and angel number');
          }
          break;

        case 'horoscope':
          if (!userInput.zodiacSign) {
            throw new Error('Please select your zodiac sign');
          }
          break;

        case 'dreams':
          if (!userInput.dream) {
            throw new Error('Please describe your dream');
          }
          break;

        case 'aura':
          if (!userInput.name || !userInput.personality) {
            throw new Error('Please enter your name and personality traits');
          }
          break;

        case 'pastlife':
          if (!userInput.name || !userInput.timePeriod) {
            throw new Error('Please enter your name and time period of interest');
          }
          break;

        default:
          throw new Error(`Unknown reading type: ${readingType.id}`);
      }

      const reading = await getReading(readingType.id, userInput);
      onReadingComplete(reading);
    } catch (err) {
      console.error('Form submission error:', err);
      let errorMessage = 'Failed to generate reading';
      
      if (err instanceof Error) {
        errorMessage = err.message;
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
      case 'magic8ball':
        return <Magic8BallForm {...formProps} />;
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