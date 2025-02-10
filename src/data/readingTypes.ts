import {
  Scroll,
  Cards,
  Hash,
  Star,
  Sparkles,
  Compass,
  Binary,
  Sun,
  Moon,
  HelpCircle,
  Waves,
  Clock
} from 'lucide-react';
import type { ReadingType } from '../types';

export const READING_TYPES: ReadingType[] = [
  {
    id: 'tarot',
    name: 'Tarot Reading',
    description: 'Use a deck of 78 cards rich with symbolism to gain insights into your life path, relationships, and future possibilities.',
    icon: Cards,
    fields: [
      {
        name: 'question',
        type: 'text',
        label: 'Your Question',
        displayName: 'What would you like guidance about?',
        placeholder: 'Enter your question...',
        required: true
      },
      {
        name: 'spread',
        type: 'select',
        label: 'Spread Type',
        displayName: 'Choose your preferred spread',
        required: true,
        options: ['Three Card', 'Celtic Cross', 'Past-Present-Future', 'Career Path', 'Relationship']
      }
    ]
  },
  {
    id: 'numerology',
    name: 'Numerology Reading',
    description: 'Discover the influence of numbers in your life through analysis of your birth date and name.',
    icon: Hash,
    fields: [
      {
        name: 'birthdate',
        type: 'date',
        label: 'Birth Date',
        displayName: 'What is your birth date?',
        required: true
      },
      {
        name: 'fullname',
        type: 'text',
        label: 'Full Name',
        displayName: 'What is your full name at birth?',
        placeholder: 'Enter your full name at birth...',
        required: true
      }
    ]
  },
  {
    id: 'astrology',
    name: 'Astrology Reading',
    description: 'Explore how celestial bodies influence your life, personality, and destiny.',
    icon: Star,
    fields: [
      {
        name: 'birthdate',
        type: 'date',
        label: 'Birth Date',
        displayName: 'What is your birth date?',
        required: true
      },
      {
        name: 'birthtime',
        type: 'text',
        label: 'Birth Time',
        displayName: 'What time were you born? (if known)',
        placeholder: 'e.g., 14:30',
        required: false
      },
      {
        name: 'birthplace',
        type: 'text',
        label: 'Birth Place',
        displayName: 'Where were you born?',
        placeholder: 'City, Country',
        required: true
      }
    ]
  },
  {
    id: 'oracle',
    name: 'Oracle Cards Reading',
    description: 'Receive divine guidance through beautifully illustrated cards with unique messages.',
    icon: Sparkles,
    fields: [
      {
        name: 'question',
        type: 'text',
        label: 'Your Question',
        displayName: 'What guidance are you seeking?',
        placeholder: 'Enter your question...',
        required: true
      }
    ]
  },
  {
    id: 'runes',
    name: 'Runes Reading',
    description: 'Gain wisdom from ancient Norse symbols used for divination and guidance.',
    icon: Compass,
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
        displayName: 'Choose your rune spread',
        required: true,
        options: ['Single Rune', 'Three Rune', 'Five Rune', 'Rune Cross']
      }
    ]
  },
  {
    id: 'iching',
    name: 'I Ching Reading',
    description: 'Access ancient Chinese wisdom through the Book of Changes for guidance and insight.',
    icon: Binary,
    fields: [
      {
        name: 'question',
        type: 'text',
        label: 'Your Question',
        displayName: 'What situation would you like guidance about?',
        placeholder: 'Enter your question...',
        required: true
      }
    ]
  },
  {
    id: 'angel-numbers',
    name: 'Angel Numbers',
    description: 'Understand the divine messages hidden in recurring number sequences.',
    icon: Hash,
    fields: [
      {
        name: 'numbers',
        type: 'text',
        label: 'Number Sequence',
        displayName: 'What numbers do you keep seeing?',
        placeholder: 'e.g., 111, 444, 1234',
        required: true
      }
    ]
  },
  {
    id: 'horoscope',
    name: 'Daily Horoscope',
    description: 'Get personalized astrological guidance for your day based on your zodiac sign.',
    icon: Sun,
    fields: [
      {
        name: 'zodiac',
        type: 'select',
        label: 'Zodiac Sign',
        displayName: 'What is your zodiac sign?',
        required: true,
        options: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
      }
    ]
  },
  {
    id: 'dream-analysis',
    name: 'Dream Analysis',
    description: 'Uncover the hidden meanings and messages in your dreams.',
    icon: Moon,
    fields: [
      {
        name: 'dream',
        type: 'textarea',
        label: 'Dream Description',
        displayName: 'Describe your dream in detail',
        placeholder: 'Include as many details as you can remember...',
        required: true
      },
      {
        name: 'emotions',
        type: 'text',
        label: 'Emotions',
        displayName: 'How did the dream make you feel?',
        placeholder: 'Describe your emotions during and after the dream...',
        required: true
      }
    ]
  },
  {
    id: 'magic-8-ball',
    name: 'Magic 8 Ball',
    description: 'Get quick mystical answers to your yes/no questions.',
    icon: HelpCircle,
    fields: [
      {
        name: 'question',
        type: 'text',
        label: 'Your Question',
        displayName: 'Ask a yes/no question',
        placeholder: 'Enter your question...',
        required: true
      }
    ]
  },
  {
    id: 'aura',
    name: 'Aura Reading',
    description: 'Discover the colors and energies of your personal energy field.',
    icon: Waves,
    fields: [
      {
        name: 'feelings',
        type: 'textarea',
        label: 'Current State',
        displayName: 'How are you feeling right now?',
        placeholder: 'Describe your current emotional and physical state...',
        required: true
      }
    ]
  },
  {
    id: 'past-life',
    name: 'Past Life Reading',
    description: "Explore your soul's previous incarnations and their influence on your current life.",
    icon: Clock,
    fields: [
      {
        name: 'interests',
        type: 'textarea',
        label: 'Current Interests',
        displayName: 'What time periods, places, or skills strongly attract you?',
        placeholder: 'Describe your unexplained interests or talents...',
        required: true
      },
      {
        name: 'patterns',
        type: 'textarea',
        label: 'Life Patterns',
        displayName: 'What patterns or challenges keep recurring in your life?',
        placeholder: 'Describe any recurring themes or situations...',
        required: true
      }
    ]
  }
];
