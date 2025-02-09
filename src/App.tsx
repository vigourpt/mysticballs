import { FC, useState, useEffect } from 'react';
import { ReadingType, PricingPlan } from './types';
import { useAuth } from './hooks/useAuth';
import { useUsageTracking } from './hooks/useUsageTracking';
import { supabase } from './services/supabase';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import PaymentModal from './components/PaymentModal';
import ReadingSelector from './components/ReadingSelector';
import ReadingForm from './components/ReadingForm';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';

const READING_TYPES: ReadingType[] = [
  {
    id: 'tarot',
    name: 'Tarot Reading',
    description: 'Discover insights through the ancient wisdom of tarot cards, dating back to the 15th century. Each card reveals hidden truths and illuminates your path forward.',
    icon: 'cards',
    fields: [
      {
        name: 'topic',
        label: 'Focus Area',
        type: 'text',
        placeholder: 'Love, Career...',
        required: true
      },
      {
        name: 'question',
        label: 'Your Specific Question',
        type: 'textarea',
        placeholder: 'What would you like the cards to reveal about this area of your life?',
        required: true
      }
    ]
  },
  {
    id: 'numerology',
    name: 'Numerology Reading',
    description: 'Unlock the meaning behind your personal numbers. Analyze your birth date and name to reveal life path, destiny, and soul urge numbers.',
    icon: 'numbers',
    fields: [
      {
        name: 'fullName',
        label: 'Full Birth Name',
        type: 'text',
        placeholder: 'Enter your full name exactly as shown on your birth certificate',
        required: true
      },
      {
        name: 'currentName',
        label: 'Current Name (if different)',
        type: 'text',
        placeholder: 'Enter your current legal name if different from birth name',
        required: false
      },
      {
        name: 'birthDate',
        label: 'Birth Date',
        type: 'date',
        placeholder: 'Select your birth date',
        required: true
      }
    ]
  },
  {
    id: 'astrology',
    name: 'Astrology Reading',
    description: 'Examine celestial influences through your sun sign, moon sign, rising sign, and planetary aspects for deep personal insights.',
    icon: 'stars',
    fields: [
      {
        name: 'birthDate',
        label: 'Birth Date',
        type: 'date',
        placeholder: 'Select your birth date',
        required: true
      },
      {
        name: 'birthTime',
        label: 'Birth Time',
        type: 'text',
        placeholder: 'e.g. 14:30 (as precise as possible for accurate rising sign)',
        required: false
      },
      {
        name: 'birthPlace',
        label: 'Birth Place',
        type: 'text',
        placeholder: 'City, State/Province, Country',
        required: true
      },
      {
        name: 'question',
        label: 'Specific Area of Interest',
        type: 'textarea',
        placeholder: 'What aspects of your chart would you like to explore? (e.g. career prospects, relationship patterns, life purpose)',
        required: false
      }
    ]
  },
  {
    id: 'oracle',
    name: 'Oracle Cards Reading',
    description: 'Receive divine guidance through beautifully illustrated cards. Perfect for both beginners and experienced seekers of wisdom.',
    icon: 'oracle',
    fields: [
      {
        name: 'intention',
        label: 'Your Intention',
        type: 'text',
        placeholder: 'What brings you to seek guidance today?',
        required: true
      },
      {
        name: 'question',
        label: 'Your Question',
        type: 'textarea',
        placeholder: 'What specific guidance would you like to receive?',
        required: true
      }
    ]
  },
  {
    id: 'runes',
    name: 'Runes Reading',
    description: 'Ancient Norse symbols offering guidance and insight. Each of the 24 runes carries powerful meanings from Nordic wisdom.',
    icon: 'runes',
    fields: [
      {
        name: 'topic',
        label: 'Area of Focus',
        type: 'text',
        placeholder: 'e.g. Relationships, Work, Personal Journey',
        required: true
      },
      {
        name: 'question',
        label: 'Your Question',
        type: 'textarea',
        placeholder: 'What guidance do you seek from the runes?',
        required: true
      }
    ]
  },
  {
    id: 'iching',
    name: 'I Ching Reading',
    description: 'The ancient Chinese Book of Changes provides profound wisdom through hexagrams, drawing on over 3,000 years of Taoist philosophy.',
    icon: 'iching',
    fields: [
      {
        name: 'situation',
        label: 'Current Situation',
        type: 'textarea',
        placeholder: 'Describe the situation you need guidance about',
        required: true
      },
      {
        name: 'question',
        label: 'Your Question',
        type: 'textarea',
        placeholder: 'What specific guidance do you seek from the I Ching?',
        required: true
      }
    ]
  },
  {
    id: 'angels',
    name: 'Angel Card Reading',
    description: 'Connect with angelic guidance through specially designed cards. Receive messages of hope, healing, and divine wisdom.',
    icon: 'angels',
    fields: [
      {
        name: 'intention',
        label: 'Your Intention',
        type: 'text',
        placeholder: 'What type of angelic guidance are you seeking?',
        required: true
      },
      {
        name: 'concern',
        label: 'Your Concern',
        type: 'textarea',
        placeholder: 'Share what\'s on your mind or in your heart',
        required: true
      }
    ]
  },
  {
    id: 'horoscope',
    name: 'Daily Horoscope',
    description: 'Get personalized astrological guidance based on your zodiac sign and current planetary positions.',
    icon: 'stars',
    fields: [
      {
        name: 'zodiacSign',
        label: 'Your Zodiac Sign',
        type: 'text',
        placeholder: 'e.g. Aries, Taurus, Gemini',
        required: true
      },
      {
        name: 'birthDate',
        label: 'Birth Date',
        type: 'date',
        placeholder: 'Select your birth date',
        required: true
      },
      {
        name: 'focusArea',
        label: 'Area of Focus',
        type: 'text',
        placeholder: 'e.g. Love, Career, Health',
        required: false
      }
    ]
  },
  {
    id: 'dreams',
    name: 'Dream Analysis',
    description: 'Explore the symbolic meanings within your dreams. Uncover subconscious insights and receive guidance from your inner wisdom.',
    icon: 'moon',
    fields: [
      {
        name: 'dreamDate',
        label: 'When did you have this dream?',
        type: 'date',
        placeholder: 'Select the date',
        required: true
      },
      {
        name: 'dreamDescription',
        label: 'Dream Description',
        type: 'textarea',
        placeholder: 'Describe your dream in detail, including any symbols, emotions, or memorable elements',
        required: true
      },
      {
        name: 'recentEvents',
        label: 'Recent Life Events',
        type: 'textarea',
        placeholder: 'Any significant events or concerns in your life that might relate to this dream?',
        required: false
      }
    ]
  },
  {
    id: 'magic8ball',
    name: 'Magic 8 Ball',
    description: 'Get quick, mystical answers to your yes/no questions. A playful way to tap into your intuition.',
    icon: 'ball',
    fields: [
      {
        name: 'question',
        label: 'Your Yes/No Question',
        type: 'text',
        placeholder: 'Ask a question that can be answered with Yes or No',
        required: true
      }
    ]
  },
  {
    id: 'aura',
    name: 'Aura Reading',
    description: 'Reveal the colors and energies of your personal energy field. Gain insights into your spiritual, emotional, and physical well-being.',
    icon: 'aura',
    fields: [
      {
        name: 'currentMood',
        label: 'Current Emotional State',
        type: 'text',
        placeholder: 'How are you feeling right now?',
        required: true
      },
      {
        name: 'physicalState',
        label: 'Physical State',
        type: 'text',
        placeholder: 'Any physical sensations or health concerns?',
        required: true
      },
      {
        name: 'recentChanges',
        label: 'Recent Life Changes',
        type: 'textarea',
        placeholder: 'Any significant changes in your life recently?',
        required: false
      }
    ]
  },
  {
    id: 'pastlife',
    name: 'Past Life Reading',
    description: 'Explore your soul\'s previous incarnations. Understand how past life experiences influence your present journey.',
    icon: 'history',
    fields: [
      {
        name: 'currentChallenges',
        label: 'Current Life Challenges',
        type: 'textarea',
        placeholder: 'What patterns or challenges would you like to understand from a past life perspective?',
        required: true
      },
      {
        name: 'interests',
        label: 'Strong Interests or Talents',
        type: 'textarea',
        placeholder: 'What skills, places, or time periods are you drawn to?',
        required: true
      },
      {
        name: 'specificQuestions',
        label: 'Specific Questions',
        type: 'textarea',
        placeholder: 'Any specific questions about your past lives?',
        required: false
      }
    ]
  }
];

interface Props {
  isDarkMode: boolean;
}

const App: FC = () => {
  const [selectedReading, setSelectedReading] = useState<ReadingType | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'privacy' | 'terms'>('home');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleDarkModeToggle = () => setIsDarkMode(!isDarkMode);

  const { user, signOut } = useAuth();
  const { usage, loading: usageLoading } = useUsageTracking(user?.id ?? null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setShowLoginModal(true);
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    if (user) {
      setShowLoginModal(false);
    }
  }, [user]);

  const handleSubscribe = async (plan: PricingPlan) => {
    // Implementation will be added later
    console.log('Subscribing to plan:', plan);
  };

  const handleLoginRequired = () => {
    setShowLoginModal(true);
  };

  const handleReadingComplete = () => {
    setSelectedReading(null);
  };

  const handleReadingRequest = () => {
    if (!user) {
      setShowLoginModal(true);
      return false;
    }
    return true;
  };

  // Show loading spinner during authentication
  if (usageLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gray-900`}>
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <Header
        isDarkMode={isDarkMode}
        onDarkModeToggle={handleDarkModeToggle}
        user={user}
        onSignOut={signOut}
      />

      <main className="container mx-auto px-4 py-8">
        {currentPage === 'home' ? (
          <>
            {selectedReading ? (
              <div className="max-w-2xl mx-auto">
                <button
                  onClick={() => setSelectedReading(null)}
                  className={`mb-8 flex items-center space-x-2 text-gray-300 hover:text-white`}
                >
                  <span>← Back to Reading Types</span>
                </button>
                <ReadingForm
                  readingType={selectedReading}
                  onReadingComplete={handleReadingComplete}
                  onReadingRequest={handleReadingRequest}
                  session={supabase.auth.getSession()}
                  setShowUpgradeModal={setShowPaymentModal}
                  isDarkMode={isDarkMode}
                />
              </div>
            ) : (
              <ReadingSelector
                readingTypes={READING_TYPES}
                onSelect={setSelectedReading}
              />
            )}
          </>
        ) : currentPage === 'privacy' ? (
          <PrivacyPolicy />
        ) : (
          <TermsOfService />
        )}
      </main>

      <Footer
        onPrivacyClick={() => setCurrentPage('privacy')}
        onTermsClick={() => setCurrentPage('terms')}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        user={user}
        onLoginRequired={handleLoginRequired}
        onSubscribe={handleSubscribe}
        remainingReadings={usage?.readingsRemaining || 0}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default App;