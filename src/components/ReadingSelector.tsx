import React from 'react';
import type { LucideIcon } from 'lucide-react';
import type { ReadingType } from '../types';
import ReadingTypeInfo from './ReadingTypeInfo';

interface ReadingTypeOption extends ReadingType {
  icon: LucideIcon;
  instructions?: string;
}

interface Props {
  READING_TYPES: ReadingTypeOption[];
  onSelect: (type: ReadingType) => void;
  isDarkMode: boolean;
}

const ReadingSelector: React.FC<Props> = ({ READING_TYPES, onSelect, isDarkMode }) => {
  const faqs = [
    {
      question: "How accurate are these readings?",
      answer: "Our readings provide spiritual guidance based on ancient wisdom traditions. While they offer valuable insights, they should be considered as guidance rather than absolute predictions."
    },
    {
      question: "How often should I get a reading?",
      answer: "This varies by individual and circumstance. Many find value in monthly readings, while others prefer to consult during significant life events or decisions."
    },
    {
      question: "Can I ask multiple questions?",
      answer: "Yes, but we recommend focusing on one question at a time for the clearest insights and guidance."
    },
    {
      question: "How should I phrase my question?",
      answer: "Ask open-ended questions that focus on guidance and understanding rather than simple yes/no answers. For example, instead of 'Will I get the job?' ask 'What should I know about this career opportunity?'"
    }
  ];

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {READING_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => onSelect(type)}
            className={`group p-6 rounded-xl transition-all duration-300 transform hover:scale-105 ${
              isDarkMode
                ? 'bg-gradient-to-br from-indigo-800/50 to-purple-800/50 hover:from-indigo-700/50 hover:to-purple-700/50'
                : 'bg-gradient-to-br from-white to-indigo-50 hover:from-indigo-50 hover:to-white'
            } backdrop-blur-sm shadow-xl`}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <type.icon
                size={48}
                className={`${
                  isDarkMode ? 'text-indigo-300' : 'text-indigo-600'
                } transition-transform group-hover:scale-110`}
              />
              <h3 className={`text-xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                {type.name}
              </h3>
              <p className={`text-sm ${
                isDarkMode ? 'text-indigo-200' : 'text-gray-600'
              }`}>
                {type.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className={`p-6 rounded-xl ${
        isDarkMode
          ? 'bg-indigo-900/30 backdrop-blur-sm'
          : 'bg-white/80 backdrop-blur-sm'
      } shadow-xl`}>
        <h3 className={`text-xl font-semibold mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          How to Get the Most from Your Reading
        </h3>
        <ul className={`list-disc list-inside space-y-2 ${
          isDarkMode ? 'text-indigo-200' : 'text-gray-600'
        }`}>
          <li>Find a quiet, peaceful space where you won't be disturbed</li>
          <li>Take a few deep breaths to center yourself before starting</li>
          <li>Focus on your question or intention with clarity and openness</li>
          <li>Be specific in your questions, but avoid yes/no formats</li>
          <li>Approach the reading with an open mind and heart</li>
        </ul>
      </div>

      <div className={`p-6 rounded-xl ${
        isDarkMode
          ? 'bg-indigo-900/30 backdrop-blur-sm'
          : 'bg-white/80 backdrop-blur-sm'
      } shadow-xl`}>
        <h3 className={`text-xl font-semibold mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          Frequently Asked Questions
        </h3>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="space-y-2">
              <h4 className={`font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                {faq.question}
              </h4>
              <p className={`${
                isDarkMode ? 'text-indigo-200' : 'text-gray-600'
              }`}>
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReadingSelector;
