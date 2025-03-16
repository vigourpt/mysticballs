import React from 'react';

interface Props {
  isDarkMode: boolean;
}

const ReadingTypeInfo: React.FC<Props> = ({ isDarkMode }) => {
  const readingInfo = [
    {
      title: "Tarot Reading",
      content: "Discover insights through the ancient wisdom of tarot cards. Tarot readings use a deck of 78 cards, each rich with symbolism and meaning, to provide guidance and insight into life's questions. Dating back to the 15th century, tarot combines ancient wisdom with intuitive interpretation to illuminate paths forward, reveal hidden truths, and offer perspective on relationships, career decisions, and personal growth journeys."
    },
    {
      title: "Numerology Reading",
      content: "Unlock the meaning behind your personal numbers. Numerology is the ancient study of numbers and their influence on human life. By analyzing your birth date and name, numerology reveals your life path number, destiny number, and soul urge number. These numerical patterns offer insights into your personality traits, life purpose, optimal career paths, and relationship compatibility."
    },
    {
      title: "Astrology Reading",
      content: "Explore your celestial connections and cosmic path. Astrology examines the positions of celestial bodies at the time of your birth to understand their influence on your life. Through analysis of your sun sign, moon sign, rising sign, and planetary aspects, astrology provides insights into your personality, relationships, career prospects, and life cycles."
    },
    {
      title: "Oracle Card Reading",
      content: "Receive guidance through mystical oracle messages. Oracle cards offer divine guidance through beautifully illustrated cards, each carrying unique messages and meanings. Unlike tarot, oracle decks are more fluid and intuitive, making them accessible for both beginners and experienced readers. They provide clarity, inspiration, and guidance for life's questions and challenges."
    },
    {
      title: "Rune Reading",
      content: "Ancient Norse wisdom for modern guidance. Runes are ancient Norse symbols used for divination and guidance. Each of the 24 runes in the Elder Futhark system carries powerful meanings and energies. Rune readings offer insights into life situations, personal growth, and future possibilities, drawing upon centuries-old Nordic wisdom."
    },
    {
      title: "I Ching Reading",
      content: "Connect with ancient Chinese divination wisdom. The I Ching, or 'Book of Changes,' is an ancient Chinese divination system with over 3,000 years of history. Through a process of casting hexagrams, the I Ching provides profound wisdom and guidance for life's questions. Each reading draws upon Taoist philosophy to offer insights into situations, relationships, and personal development."
    },
    {
      title: "Angel Numbers",
      content: "Discover the divine messages in recurring numbers. Angel numbers are sequences of numbers that carry divine guidance by referring to specific numerological meanings. The appearance of recurring numbers is believed to be a sign from guardian angels or spiritual guides, offering messages of guidance, reassurance, and divine support in your life journey."
    },
    {
      title: "Horoscope Reading",
      content: "Daily cosmic guidance for your zodiac sign. Daily horoscopes provide personalized astrological guidance based on your zodiac sign and the current planetary positions. These readings offer insights into various aspects of your day, including love, career, and personal growth, helping you navigate daily challenges and opportunities."
    },
    {
      title: "Dream Analysis",
      content: "Uncover the hidden meanings in your dreams. Dream interpretation explores the symbolic meanings and messages hidden within your dreams. By analyzing dream symbols, themes, and emotions, this practice helps uncover subconscious insights, process emotions, and receive guidance from your inner wisdom."
    },
    {
      title: "Mystic Orb Reading",
      content: "Quick answers to yes/no questions. The Mystic Orb offers quick, mystical answers to your yes/no questions. While playful in nature, this divination tool can provide surprising insights and guidance, helping you tap into your intuition and consider different perspectives on your questions."
    },
    {
      title: "Aura Reading",
      content: "Visualize your energy field and spiritual essence. Aura reading is a powerful spiritual practice that reveals the colors and energies of your personal energy field. Using advanced AI analysis of your personality traits and emotional state, our tool provides deep insights into your spiritual, emotional, and physical well-being. Each reading includes interpretation of your aura colors, energy patterns, and practical guidance for maintaining and strengthening your energetic health."
    },
    {
      title: "Past Life Reading",
      content: "Explore connections to your previous incarnations. Past life readings reveal insights about your soul's journey through time. By examining karmic patterns, talents, challenges, and relationships from previous incarnations, these readings help you understand your current life purpose, overcome obstacles, and embrace your soul's evolution."
    }
  ];

  return (
    <div className={`p-6 rounded-xl ${
      isDarkMode
        ? 'bg-indigo-900/30 backdrop-blur-sm'
        : 'bg-white/80 backdrop-blur-sm'
    } shadow-xl space-y-8`}>
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
