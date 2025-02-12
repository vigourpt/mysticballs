import React from 'react';

interface Props {
  isDarkMode: boolean;
}

const ReadingTypeInfo: React.FC<Props> = ({ isDarkMode }) => {
  const readingInfo = [
    {
      title: "Tarot Reading",
      content: "Discover insights through the ancient wisdom of tarot cards."
    },
    {
      title: "Numerology Reading",
      content: "Unlock the meaning behind your personal numbers."
    },
    {
      title: "Astrology Reading",
      content: "Explore your celestial connections and cosmic path."
    },
    {
      title: "Oracle Cards Reading",
      content: "Receive guidance through mystical oracle messages."
    },
    {
      title: "Runes Reading",
      content: "Ancient Norse wisdom for modern guidance."
    },
    {
      title: "I Ching Reading",
      content: "Connect with ancient Chinese divination wisdom."
    },
    {
      title: "Angel Numbers",
      content: "Decode devine messages in recurring numbers."
    },
    {
      title: "Daily Horoscope",
      content: "Your Personalised daily celestial guidance."
    },
    {
      title: "Dream Analysis",
      content: "Uncover the symbolic meanings and messages hidden within your dreams."
    },
    {
      title: "Magic 8 Ball",
      content: "Quick answers to Yes/No questions."
    },
    {
      title: "Aura Reading",
      content: "AI-powered analysis of your energetic field and spiritual essence."
    },
    {
      title: "Past Life Reading",
      content: "AI-driven journey into your previous incarnations."
    }
  ];

  return (
    <div className={`p-6 rounded-xl ${
      isDarkMode
        ? 'bg-indigo-900/30 backdrop-blur-sm'
        : 'bg-white/80 backdrop-blur-sm'
    } shadow-xl space-y-8`}>
      <h2 className={`text-2xl font-semibold mb-6 ${
        isDarkMode ? 'text-white' : 'text-gray-800'
      }`}>
        Discover Our Reading Types
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {readingInfo.map((info, index) => (
          <article key={index} className="space-y-2">
            <h3 className={`text-xl font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              {info.title}
            </h3>
            <p className={`${
              isDarkMode ? 'text-indigo-200' : 'text-gray-600'
            } leading-relaxed`}>
              {info.content}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
};

export default ReadingTypeInfo;