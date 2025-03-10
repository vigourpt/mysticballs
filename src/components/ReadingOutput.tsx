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
        ? 'bg-indigo-900/50 backdrop-blur-sm' // Increased opacity for better contrast
        : 'bg-white/90 backdrop-blur-sm' // Increased opacity for better contrast
      } shadow-xl`}>
      {/* Mystical decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="absolute w-24 h-24 bg-indigo-500/20 rounded-full blur-xl"></div>
          <Sparkles className={`w-8 h-8 ${
            isDarkMode ? 'text-indigo-300' : 'text-indigo-600'
          } animate-pulse`} />
          <h2 className="text-2xl md:text-3xl font-bold text-white relative group">
            <span className="absolute -inset-2 bg-fuchsia-500/20 blur-xl rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
            <span className="absolute -inset-2 bg-fuchsia-500/20 blur-lg rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
            <span className="absolute -inset-2 bg-fuchsia-500/20 blur-md rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
            <span className="relative glow-text">Your {
              readingType.id === 'iching' ? 'I-Ching' : 
              readingType.id === 'magic8ball' ? 'Mystic Orb' : 
              readingType.id.charAt(0).toUpperCase() + readingType.id.slice(1)
            } Reading</span>
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
                    isDarkMode ? 'text-white' : 'text-gray-800' // Improved contrast
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
                  } border-b border-indigo-300 pb-2`} {...props} /> // Added border for better section separation
                ),
                li: ({node, ...props}) => (
                  <li className={`${
                    isDarkMode ? 'text-white' : 'text-gray-800' // Improved contrast
                  } mb-2`} {...props} /> // Added margin for better spacing
                ),
                strong: ({node, ...props}) => (
                  <strong className={`font-semibold ${
                    isDarkMode ? 'text-indigo-200' : 'text-indigo-700' // Better contrast with theme colors
                  }`} {...props} />
                ),
                em: ({node, ...props}) => (
                  <em className={`italic ${
                    isDarkMode ? 'text-purple-200' : 'text-purple-700' // Added styling for emphasis
                  }`} {...props} />
                ),
                blockquote: ({node, ...props}) => (
                  <blockquote className={`border-l-4 ${
                    isDarkMode ? 'border-indigo-400 bg-indigo-900/30' : 'border-indigo-500 bg-indigo-50'
                  } pl-4 py-2 my-4 italic`} {...props} />
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
