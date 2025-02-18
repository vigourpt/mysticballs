import React from 'react';

interface Props {
  isDarkMode: boolean;
}

const FAQ: React.FC<Props> = ({ isDarkMode }) => {
  return (
    <div className="py-16">
      <h2 className="text-3xl md:text-4xl font-bold text-white relative group mb-12 text-center">
        <span className="absolute -inset-2 bg-fuchsia-500/20 blur-xl rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
        <span className="absolute -inset-2 bg-fuchsia-500/20 blur-lg rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
        <span className="absolute -inset-2 bg-fuchsia-500/20 blur-md rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
        <span className="relative glow-text">How to Get the Best From Your Reading</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div>
          <h3 className="text-xl font-bold text-white relative group mb-4">
            <span className="absolute -inset-2 bg-fuchsia-500/20 blur-xl rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
            <span className="absolute -inset-2 bg-fuchsia-500/20 blur-lg rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
            <span className="absolute -inset-2 bg-fuchsia-500/20 blur-md rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
            <span className="relative glow-text">Set Your Intention</span>
          </h3>
          <p className="text-gray-300">
            Take a moment to center yourself and clearly focus on your question or area of concern. The more specific your intention, the more focused your reading will be.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-bold text-white relative group mb-4">
            <span className="absolute -inset-2 bg-fuchsia-500/20 blur-xl rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
            <span className="absolute -inset-2 bg-fuchsia-500/20 blur-lg rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
            <span className="absolute -inset-2 bg-fuchsia-500/20 blur-md rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
            <span className="relative glow-text">Create Sacred Space</span>
          </h3>
          <p className="text-gray-300">
            Find a quiet, comfortable place where you won't be disturbed. This helps create the right environment for receiving spiritual insights.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-bold text-white relative group mb-4">
            <span className="absolute -inset-2 bg-fuchsia-500/20 blur-xl rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
            <span className="absolute -inset-2 bg-fuchsia-500/20 blur-lg rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
            <span className="absolute -inset-2 bg-fuchsia-500/20 blur-md rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
            <span className="relative glow-text">Stay Open</span>
          </h3>
          <p className="text-gray-300">
            Approach your reading with an open mind and heart. Sometimes the guidance we receive isn't what we expect, but it's often what we need.
          </p>
        </div>
      </div>

      <h2 className="text-3xl md:text-4xl font-bold text-white relative group mb-8 text-center">
        <span className="absolute -inset-2 bg-fuchsia-500/20 blur-xl rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
        <span className="absolute -inset-2 bg-fuchsia-500/20 blur-lg rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
        <span className="absolute -inset-2 bg-fuchsia-500/20 blur-md rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
        <span className="relative glow-text">Frequently Asked Questions</span>
      </h2>

      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-indigo-900/30 backdrop-blur-sm rounded-lg p-6">
          <h3 className="text-xl font-bold text-white relative group mb-3">
            <span className="absolute -inset-2 bg-fuchsia-500/20 blur-xl rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
            <span className="absolute -inset-2 bg-fuchsia-500/20 blur-lg rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
            <span className="absolute -inset-2 bg-fuchsia-500/20 blur-md rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
            <span className="relative glow-text">How accurate are the readings?</span>
          </h3>
          <p className="text-gray-300">
            Our readings combine traditional spiritual wisdom with advanced AI technology. While they provide valuable insights and guidance, remember that you have free will and the power to shape your path.
          </p>
        </div>

        <div className="bg-indigo-900/30 backdrop-blur-sm rounded-lg p-6">
          <h3 className="text-xl font-bold text-white relative group mb-3">
            <span className="absolute -inset-2 bg-fuchsia-500/20 blur-xl rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
            <span className="absolute -inset-2 bg-fuchsia-500/20 blur-lg rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
            <span className="absolute -inset-2 bg-fuchsia-500/20 blur-md rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
            <span className="relative glow-text">How often should I get a reading?</span>
          </h3>
          <p className="text-gray-300">
            This varies by individual. Some find daily guidance helpful, while others prefer weekly or monthly readings. Listen to your intuition and seek guidance when you feel called to do so.
          </p>
        </div>

        <div className="bg-indigo-900/30 backdrop-blur-sm rounded-lg p-6">
          <h3 className="text-xl font-bold text-white relative group mb-3">
            <span className="absolute -inset-2 bg-fuchsia-500/20 blur-xl rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
            <span className="absolute -inset-2 bg-fuchsia-500/20 blur-lg rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
            <span className="absolute -inset-2 bg-fuchsia-500/20 blur-md rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
            <span className="relative glow-text">What if I don't understand my reading?</span>
          </h3>
          <p className="text-gray-300">
            Take time to reflect on the messages received. Sometimes insights become clearer with time. You can also try journaling about your reading or discussing it with a trusted friend.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
