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
    description: 'Discover insights through the ancient wisdom of tarot cards',
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
    description: 'Unlock the meaning behind your personal numbers',
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
    description: 'Explore your celestial connections and cosmic path',
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
    description: 'Receive guidance through mystical oracle messages',
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
    description: 'Ancient Norse wisdom for modern guidance',
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
    description: 'Connect with ancient Chinese divination wisdom',
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
    description: 'Decode divine messages in recurring numbers',
    icon: Hash,
    fields: [
      {
        name: 'name',
        type: 'text',
        label: 'Your Name',
        displayName: 'Your Name',
        placeholder: 'Enter your name',
        required: true
      },
      {
        name: 'number',
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
    description: 'Your personalized daily celestial guidance',
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
    description: 'Uncover the hidden meanings in your dreams',
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
    description: 'Quick answers to yes/no questions',
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
    description: 'Discover your energy field\'s colors and meanings',
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
    description: 'Explore your soul\'s previous incarnations',
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
