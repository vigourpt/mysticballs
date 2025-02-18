import React from 'react';
import { Sparkles } from 'lucide-react';
import { ReadingType } from '../types';
import ReactMarkdown from 'react-markdown';
import LoadingSpinner from './LoadingSpinner';

interface Props {
  readingType: ReadingType;
  isDarkMode: boolean;
  reading?: string;
  isLoading: boolean;
}

const ReadingOutput: React.FC<Props> = ({ readingType, isDarkMode, reading, isLoading }) => {
  if (isLoading) {
    return (
      <div className={`mt-8 p-6 rounded-xl relative overflow-hidden reading-output ${
        isDarkMode
          ? 'bg-indigo-900/30 backdrop-blur-sm'
          : 'bg-white/80 backdrop-blur-sm'
      } shadow-xl`}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!reading) return null;

  return (
    <div className={`mt-8 p-6 rounded-xl relative overflow-hidden reading-output ${
      isDarkMode
        ? 'bg-indigo-900/30 backdrop-blur-sm'
        : 'bg-white/80 backdrop-blur-sm'
      } shadow-xl`}>
      {/* Mystical decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative">
        <div className="flex items-center justify-center mb-6">
          <div className="absolute w-24 h-24 bg-indigo-500/20 rounded-full blur-xl"></div>
          <Sparkles className={`w-8 h-8 ${
            isDarkMode ? 'text-indigo-300' : 'text-indigo-600'
          } mr-2 animate-pulse`} />
          <h2 className="text-2xl md:text-3xl font-bold text-white relative group mb-8">
            <span className="absolute -inset-2 bg-fuchsia-500/20 blur-xl rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
            <span className="absolute -inset-2 bg-fuchsia-500/20 blur-lg rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
            <span className="absolute -inset-2 bg-fuchsia-500/20 blur-md rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
            <span className="relative glow-text">Your {readingType.id === 'iching' ? 'I-Ching' : readingType.id.charAt(0).toUpperCase() + readingType.id.slice(1)} Reading</span>
          </h2>
        </div>
        
        <div className="space-y-6">
          <div className={`prose ${
            isDarkMode ? 'prose-invert' : ''
          } max-w-none [&>*]:mb-6`}>
            <ReactMarkdown
              components={{
                p: ({node, ...props}) => (
                  <p className={`${
                    isDarkMode ? 'text-indigo-100' : 'text-gray-700'
                  } leading-relaxed mb-6`} {...props} />
                ),
                h1: ({node, ...props}) => (
                  <h1 className={`text-2xl font-bold mt-8 mb-6 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`} {...props} />
                ),
                h2: ({node, ...props}) => (
                  <h2 className={`text-xl font-semibold mt-8 mb-6 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`} {...props} />
                ),
                h3: ({node, ...props}) => (
                  <h3 className={`text-lg font-semibold mt-8 mb-6 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`} {...props} />
                ),
                li: ({node, ...props}) => (
                  <li className={`${
                    isDarkMode ? 'text-indigo-100' : 'text-gray-700'
                  }`} {...props} />
                ),
                strong: ({node, ...props}) => (
                  <strong className={`font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`} {...props} />
                ),
              }}
            >
              {reading}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingOutput;
