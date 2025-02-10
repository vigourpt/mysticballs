import {
  Scroll,
  Moon,
  Sun,
  Heart,
  Star,
  Compass,
  Crown,
  Gem,
  Wand2,
  Flower2,
  Hourglass,
  Sparkles
} from 'lucide-react';
import { ReadingType } from '../types';

export const READING_TYPES: ReadingType[] = [
  {
    id: 'daily-guidance',
    name: 'Daily Guidance',
    description: 'Receive spiritual insights and guidance tailored to your day ahead, helping you navigate challenges and opportunities with clarity and purpose.',
    icon: Scroll,
    fields: [
      {
        name: 'question',
        type: 'text',
        displayName: 'What specific guidance are you seeking today?',
        placeholder: 'Enter your question...',
        required: true
      }
    ]
  },
  {
    id: 'love-reading',
    name: 'Love Reading',
    description: 'Explore the depths of your relationships, understand romantic patterns, and receive guidance on matters of the heart to foster deeper connections.',
    icon: Heart,
    fields: [
      {
        name: 'relationship_status',
        type: 'select',
        displayName: 'What is your current relationship status?',
        required: true
      },
      {
        name: 'question',
        type: 'text',
        displayName: 'What would you like to know about your love life?',
        placeholder: 'Enter your question...',
        required: true
      }
    ]
  },
  {
    id: 'career-guidance',
    name: 'Career Path',
    description: 'Gain clarity on your professional journey, identify opportunities for growth, and align your career with your soul\'s purpose and talents.',
    icon: Compass,
    fields: [
      {
        name: 'current_role',
        type: 'text',
        displayName: 'What is your current role or situation?',
        placeholder: 'e.g., Software Engineer, Student, etc.',
        required: true
      },
      {
        name: 'question',
        type: 'text',
        displayName: 'What career guidance are you seeking?',
        placeholder: 'Enter your question...',
        required: true
      }
    ]
  },
  {
    id: 'spiritual-journey',
    name: 'Spiritual Journey',
    description: 'Deepen your spiritual connection, understand your soul’s evolution, and receive guidance on your path to higher consciousness and enlightenment.',
    icon: Star,
    fields: [
      {
        name: 'question',
        type: 'text',
        displayName: 'What spiritual insights are you seeking?',
        placeholder: 'Enter your question...',
        required: true
      }
    ]
  },
  {
    id: 'past-life',
    name: 'Past Life',
    description: 'Uncover the mysteries of your past lives, understand karmic patterns, and gain insights into how previous incarnations influence your present journey.',
    icon: Hourglass,
    fields: [
      {
        name: 'area_of_interest',
        type: 'text',
        displayName: 'What aspect of your past lives interests you most?',
        placeholder: 'e.g., relationships, talents, life purpose',
        required: true
      }
    ]
  },
  {
    id: 'chakra-reading',
    name: 'Chakra Reading',
    description: 'Examine your energy centers, identify blockages, and receive guidance on balancing and harmonizing your chakras for optimal wellbeing.',
    icon: Sparkles,
    fields: [
      {
        name: 'physical_symptoms',
        type: 'text',
        displayName: 'Are you experiencing any physical or emotional symptoms?',
        placeholder: 'Describe any symptoms...',
        required: true
      }
    ]
  },
  {
    id: 'angel-guidance',
    name: 'Angel Guidance',
    description: 'Connect with your guardian angels and spiritual guides to receive divine messages, protection, and guidance on your life's journey.',
    icon: Crown,
    fields: [
      {
        name: 'question',
        type: 'text',
        displayName: 'What message would you like to receive from your angels?',
        placeholder: 'Enter your question...',
        required: true
      }
    ]
  },
  {
    id: 'crystal-reading',
    name: 'Crystal Reading',
    description: 'Discover which crystals resonate with your energy and learn how to harness their healing properties for spiritual growth and emotional balance.',
    icon: Gem,
    fields: [
      {
        name: 'current_situation',
        type: 'text',
        displayName: 'What situation would you like crystal guidance for?',
        placeholder: 'Describe your situation...',
        required: true
      }
    ]
  },
  {
    id: 'manifestation',
    name: 'Manifestation',
    description: 'Learn powerful techniques to manifest your desires, align with universal energy, and create positive changes in your life through spiritual practice.',
    icon: Wand2,
    fields: [
      {
        name: 'desire',
        type: 'text',
        displayName: 'What do you wish to manifest?',
        placeholder: 'Describe your desire...',
        required: true
      }
    ]
  },
  {
    id: 'numerology',
    name: 'Numerology',
    description: 'Decode the spiritual significance of numbers in your life, understand your life path number, and gain insights into your destiny and personal cycles.',
    icon: Moon,
    fields: [
      {
        name: 'birthdate',
        type: 'date',
        displayName: 'What is your birth date?',
        required: true
      }
    ]
  },
  {
    id: 'aura-reading',
    name: 'Aura Reading',
    description: 'Explore the colors and energies of your aura, understand their meanings, and learn how to maintain and strengthen your energetic field.',
    icon: Sun,
    fields: [
      {
        name: 'current_mood',
        type: 'text',
        displayName: 'How are you feeling right now?',
        placeholder: 'Describe your current emotional state...',
        required: true
      }
    ]
  },
  {
    id: 'life-purpose',
    name: 'Life Purpose',
    description: 'Uncover your soul's mission, identify your unique gifts, and receive guidance on aligning your life with your higher purpose and spiritual calling.',
    icon: Flower2,
    fields: [
      {
        name: 'interests',
        type: 'text',
        displayName: 'What activities make you feel most alive?',
        placeholder: 'Describe your passions...',
        required: true
      },
      {
        name: 'challenges',
        type: 'text',
        displayName: 'What challenges are you facing in finding your purpose?',
        placeholder: 'Describe your challenges...',
        required: true
      }
    ]
  }
];
