import React from 'react';

interface Props {
  isDarkMode: boolean;
}

const Advertisement: React.FC<Props> = ({ isDarkMode }) => {
  return (
    <div className={`mb-12 text-center ${
      isDarkMode ? 'text-white' : 'text-gray-800'
    }`}>
      <h2 className="text-3xl font-bold mb-4 relative inline-block">
        <span className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 blur"></span>
        <span className="relative">Welcome to Your Spiritual Journey</span>
      </h2>
      <p className={`max-w-2xl mx-auto ${
        isDarkMode ? 'text-indigo-200' : 'text-gray-600'
      } leading-relaxed`}>
        Explore ancient wisdom through our diverse collection of spiritual readings. 
        Whether you seek guidance, clarity, or deeper understanding, our AI-powered 
        insights combine traditional knowledge with modern technology to illuminate 
        your path forward.
      </p>
    </div>
  );
};

export default Advertisement;