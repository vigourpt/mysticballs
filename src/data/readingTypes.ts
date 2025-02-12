import { 
  BookOpen,
  Calculator,
  Clock,
  Dice5,
  Hash,
  Layout,
  Moon,
  Sparkles,
  Star,
  Sun,
  Zap
} from 'lucide-react';
import type { ReadingType } from '../types';

export const READING_TYPES: ReadingType[] = [
  {
    id: 'tarot',
    name: 'Tarot Reading',
    description: 'Tarot readings use a deck of 78 cards, each rich with symbolism and meaning, to provide guidance and insight into life\'s questions. Dating back to the 15th century, tarot combines ancient wisdom with intuitive interpretation to illuminate paths forward, reveal hidden truths, and offer perspective on relationships, career decisions, and personal growth journeys.',
    icon: Layout,
    fields: [
      {
        name: 'question',
        type: 'text',
        label: 'Your Question',
        displayName: 'What would you like to know?',
        placeholder: 'Enter your question...',
        required: true
      },
      {
        name: 'spread',
        type: 'select',
        label: 'Spread Type',
        displayName: 'Choose your spread',
        required: true,
        options: [
          'Three Card',
          'Celtic Cross',
          'Past Life',
          'Career Path',
          'Love Reading'
        ]
      }
    ]
  },
  {
    id: 'numerology',
    name: 'Numerology Reading',
    description: 'Numerology is the ancient study of numbers and their influence on human life. By analyzing your birth date and name, numerology reveals your life path number, destiny number, and soul urge number. These numerical patterns offer insights into your personality traits, life purpose, optimal career paths, and relationship compatibility.',
    icon: Calculator,
    fields: [
      {
        name: 'birthdate',
        type: 'date',
        label: 'Birth Date',
        displayName: 'Your birth date',
        required: true
      },
      {
        name: 'fullname',
        type: 'text',
        label: 'Full Name',
        displayName: 'Your full name at birth',
        placeholder: 'Enter your full name...',
        required: true
      }
    ]
  },
  {
    id: 'astrology',
    name: 'Astrology Reading',
    description: 'Astrology examines the positions of celestial bodies at the time of your birth to understand their influence on your life. Through analysis of your sun sign, moon sign, rising sign, and planetary aspects, astrology provides insights into your personality, relationships, career prospects, and life cycles.',
    icon: Star,
    fields: [
      {
        name: 'birthdate',
        type: 'date',
        label: 'Birth Date',
        displayName: 'Your birth date',
        required: true
      },
      {
        name: 'birthtime',
        type: 'text',
        label: 'Birth Time',
        displayName: 'Your birth time (if known)',
        placeholder: 'e.g., 14:30',
        required: false
      },
      {
        name: 'birthplace',
        type: 'text',
        label: 'Birth Place',
        displayName: 'Your birth place',
        placeholder: 'City, Country',
        required: true
      }
    ]
  },
  {
    id: 'oracle',
    name: 'Oracle Card Reading',
    description: 'Oracle cards offer divine guidance through beautifully illustrated cards, each carrying unique messages and meanings. Unlike tarot, oracle decks are more fluid and intuitive, making them accessible for both beginners and experienced readers. They provide clarity, inspiration, and guidance for life\'s questions and challenges.',
    icon: Sparkles,
    fields: [
      {
        name: 'question',
        type: 'text',
        label: 'Your Question',
        displayName: 'What would you like guidance on?',
        placeholder: 'Enter your question...',
        required: true
      },
      {
        name: 'deck',
        type: 'select',
        label: 'Oracle Deck',
        displayName: 'Choose your deck',
        required: true,
        options: [
          'Angel Oracle',
          'Spirit Animal Oracle',
          'Goddess Oracle',
          'Crystal Oracle',
          'Chakra Wisdom'
        ]
      }
    ]
  },
  {
    id: 'runes',
    name: 'Rune Reading',
    description: 'Runes are ancient Norse symbols used for divination and guidance. Each of the 24 runes in the Elder Futhark system carries powerful meanings and energies. Rune readings offer insights into life situations, personal growth, and future possibilities, drawing upon centuries-old Nordic wisdom.',
    icon: Dice5,
    fields: [
      {
        name: 'question',
        type: 'text',
        label: 'Your Question',
        displayName: 'What would you like to know?',
        placeholder: 'Enter your question...',
        required: true
      },
      {
        name: 'spread',
        type: 'select',
        label: 'Rune Spread',
        displayName: 'Choose your spread',
        required: true,
        options: [
          'Single Rune',
          'Three Rune',
          'Five Rune',
          'Rune Cross'
        ]
      }
    ]
  },
  {
    id: 'iching',
    name: 'I Ching Reading',
    description: 'The I Ching, or "Book of Changes," is an ancient Chinese divination system with over 3,000 years of history. Through a process of casting hexagrams, the I Ching provides profound wisdom and guidance for life\'s questions. Each reading draws upon Taoist philosophy to offer insights into situations, relationships, and personal development.',
    icon: BookOpen,
    fields: [
      {
        name: 'question',
        type: 'text',
        label: 'Your Question',
        displayName: 'What would you like guidance on?',
        placeholder: 'Enter your question...',
        required: true
      }
    ]
  },
  {
    id: 'angelnumbers',
    name: 'Angel Numbers',
    description: 'Angel numbers are sequences of numbers that carry divine guidance by referring to specific numerical meanings. The appearance of recurring numbers is believed to be a sign from guardian angels or spiritual guides, offering messages of guidance, reassurance, and divine support in your life journey.',
    icon: Hash,
    fields: [
      {
        name: 'numbers',
        type: 'text',
        label: 'Number Sequence',
        displayName: 'What numbers do you keep seeing?',
        placeholder: 'e.g., 111, 222, 333...',
        required: true
      }
    ]
  },
  {
    id: 'horoscope',
    name: 'Daily Horoscope',
    description: 'Daily horoscopes provide personalized astrological guidance based on your zodiac sign and the current planetary positions. These readings offer insights into various aspects of your day, including love, career, and personal growth, helping you navigate daily challenges and opportunities.',
    icon: Sun,
    fields: [
      {
        name: 'zodiac',
        type: 'select',
        label: 'Zodiac Sign',
        displayName: 'Your Zodiac Sign',
        required: true,
        options: [
          'Aries', 'Taurus', 'Gemini', 'Cancer', 
          'Leo', 'Virgo', 'Libra', 'Scorpio', 
          'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
        ]
      }
    ]
  },
  {
    id: 'dreamanalysis',
    name: 'Dream Analysis',
    description: 'Dream interpretation explores the symbolic meanings and messages hidden within your dreams. By analyzing dream symbols, themes, and emotions, this practice helps uncover subconscious insights, process emotions, and receive guidance from your inner wisdom.',
    icon: Moon,
    fields: [
      {
        name: 'dream',
        type: 'textarea',
        label: 'Dream Description',
        displayName: 'Describe Your Dream',
        placeholder: 'Describe your dream in detail...',
        required: true
      }
    ]
  },
  {
    id: 'magic8ball',
    name: 'Magic 8 Ball',
    description: 'The Magic 8 Ball offers quick, mystical answers to yes/no questions. While playful in nature, this divination tool can provide surprising insights and guidance, helping you tap into your intuition and consider different perspectives on your questions.',
    icon: Dice5,
    fields: [
      {
        name: 'question',
        type: 'text',
        label: 'Your Question',
        displayName: 'Ask a Yes/No Question',
        placeholder: 'Enter your question...',
        required: true
      }
    ]
  },
  {
    id: 'aura',
    name: 'Aura Reading',
    description: 'Aura reading is a powerful spiritual practice that reveals the colors and energies of your personal energy field. Using advanced AI analysis of your personality traits and emotional state, our tool provides deep insights into your spiritual, emotional, and physical well-being. Each reading includes interpretation of your aura colors, energy patterns, and practical guidance for maintaining and strengthening your energetic health.',
    icon: Zap,
    fields: [
      {
        name: 'feelings',
        type: 'textarea',
        label: 'Current Feelings',
        displayName: 'How are you feeling right now?',
        placeholder: 'Describe your current emotional and physical state...',
        required: true
      }
    ]
  },
  {
    id: 'pastlife',
    name: 'Past Life Reading',
    description: 'Past life readings use AI-driven analysis to explore your soul\'s previous incarnations. By examining your current attractions to specific time periods, unexplained memories, and recurring patterns, this tool creates detailed narratives of your most significant past lives. Each reading provides historical context, emotional resonance, and insights into how past life experiences influence your present journey and soul\'s evolution.',
    icon: Clock,
    fields: [
      {
        name: 'concerns',
        type: 'textarea',
        label: 'Current Life Concerns',
        displayName: 'What aspects of your current life would you like to explore?',
        placeholder: 'Describe your current situations or patterns you want to understand...',
        required: true
      },
      {
        name: 'feelings',
        type: 'textarea',
        label: 'Unexplained Feelings',
        displayName: 'Any unexplained feelings or attractions?',
        placeholder: 'Describe any strong unexplained feelings, fears, or attractions...',
        required: false
      }
    ]
  }
];
