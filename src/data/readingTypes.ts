import {
  Scroll,
  Heart,
  Briefcase,
  Star,
  Clock,
  Crown,
  Gem,
  Wand2,
  Moon,
  Sun,
  Flower2
} from 'lucide-react';
import type { ReadingType } from '../types';

export const READING_TYPES: ReadingType[] = [
  {
    id: 'daily-guidance',
    name: 'Daily Guidance',
    description: 'Receive spiritual insights and guidance for your day ahead.',
    icon: Scroll,
    fields: [
      {
        name: 'question',
        type: 'text',
        label: 'Your Question',
        displayName: 'What specific guidance are you seeking today?',
        placeholder: 'Enter your question...',
        required: true
      }
    ]
  },
  {
    id: 'love-reading',
    name: 'Love Reading',
    description: 'Explore your romantic life and relationships.',
    icon: Heart,
    fields: [
      {
        name: 'relationship_status',
        type: 'select',
        label: 'Relationship Status',
        displayName: 'What is your current relationship status?',
        required: true,
        options: ['Single', 'In a Relationship', 'Married', "It's Complicated"]
      },
      {
        name: 'question',
        type: 'text',
        label: 'Your Question',
        displayName: 'What would you like to know about your love life?',
        placeholder: 'Enter your question about love and relationships...',
        required: true
      }
    ]
  },
  {
    id: 'career-guidance',
    name: 'Career Guidance',
    description: 'Get insights about your professional path and decisions.',
    icon: Briefcase,
    fields: [
      {
        name: 'career_status',
        type: 'select',
        label: 'Career Status',
        displayName: 'What is your current career situation?',
        required: true,
        options: ['Employed', 'Job Seeking', 'Career Change', 'Student', 'Entrepreneur']
      },
      {
        name: 'question',
        type: 'text',
        label: 'Your Question',
        displayName: 'What would you like to know about your career?',
        placeholder: 'Enter your career-related question...',
        required: true
      }
    ]
  },
  {
    id: 'spiritual-journey',
    name: 'Spiritual Journey',
    description: 'Explore your spiritual path and personal growth.',
    icon: Star,
    fields: [
      {
        name: 'question',
        type: 'text',
        label: 'Your Question',
        displayName: 'What aspect of your spiritual journey would you like to explore?',
        placeholder: 'Enter your spiritual question...',
        required: true
      }
    ]
  },
  {
    id: 'chakra-reading',
    name: 'Chakra Reading',
    description: 'Understand and balance your energy centers.',
    icon: Crown,
    fields: [
      {
        name: 'focus_chakra',
        type: 'select',
        label: 'Focus Chakra',
        displayName: 'Which chakra would you like to focus on?',
        required: true,
        options: ['Root', 'Sacral', 'Solar Plexus', 'Heart', 'Throat', 'Third Eye', 'Crown', 'All Chakras']
      }
    ]
  },
  {
    id: 'crystal-reading',
    name: 'Crystal Reading',
    description: 'Discover which crystals can support your journey.',
    icon: Gem,
    fields: [
      {
        name: 'intention',
        type: 'text',
        label: 'Your Intention',
        displayName: 'What is your intention for crystal healing?',
        placeholder: 'Enter your intention...',
        required: true
      }
    ]
  },
  {
    id: 'manifestation',
    name: 'Manifestation',
    description: 'Learn how to manifest your desires and goals.',
    icon: Wand2,
    fields: [
      {
        name: 'desire',
        type: 'text',
        label: 'Your Desire',
        displayName: 'What would you like to manifest?',
        placeholder: 'Enter what you wish to manifest...',
        required: true
      },
      {
        name: 'timeframe',
        type: 'select',
        label: 'Timeframe',
        displayName: 'What is your desired timeframe?',
        required: true,
        options: ['1 month', '3 months', '6 months', '1 year', 'Open-ended']
      }
    ]
  },
  {
    id: 'aura-reading',
    name: 'Aura Reading',
    description: 'Understand the colors and energies of your aura.',
    icon: Sun,
    fields: [
      {
        name: 'focus_area',
        type: 'text',
        label: 'Focus Area',
        displayName: 'What aspect of your aura would you like to explore?',
        placeholder: 'Enter your area of focus...',
        required: true
      }
    ]
  },
  {
    id: 'life-purpose',
    name: 'Life Purpose',
    description: "Uncover your soul's mission and unique gifts.",
    icon: Flower2,
    fields: [
      {
        name: 'question',
        type: 'text',
        label: 'Your Question',
        displayName: 'What would you like to know about your life purpose?',
        placeholder: 'Enter your question about life purpose...',
        required: true
      }
    ]
  }
];
