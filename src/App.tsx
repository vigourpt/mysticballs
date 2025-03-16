import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from './components/Header';
import Footer from './components/Footer';
import ReadingSelector from './components/ReadingSelector';
import ReadingForm from './components/ReadingForm';
import ReadingOutput from './components/ReadingOutput';
import ReadingHistory from './components/ReadingHistory';
import LoginModal from './components/LoginModal';
import BackgroundEffects from './components/BackgroundEffects';
import SubscriptionManager from './components/SubscriptionManager';
import AdminDashboard from './components/AdminDashboard';
import { UserContext } from './context/UserContext';
import { incrementReadingCount, incrementFreeReadingUsed } from './services/supabase';

import { READING_TYPES } from './data/readingTypes';
import { ReadingType } from './types';

// Function to generate a reading based on reading type and form inputs
const generateReading = (readingType: ReadingType, formInputs: Record<string, string>): string => {
  // Get current date for the reading
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Create an introduction based on reading type
  let reading = `${readingType.name} Reading - ${currentDate}\n\n`;

  // Add personalization if name is provided
  if (formInputs.name) {
    reading += `Dear ${formInputs.name},\n\n`;
  }

  // Generate content based on reading type
  switch (readingType.id) {
    case 'angel-numbers':
      reading += generateAngelNumbersReading(formInputs);
      break;
    case 'tarot':
      reading += generateTarotReading(formInputs);
      break;
    case 'astrology':
      reading += generateAstrologyReading(formInputs);
      break;
    case 'dream':
      reading += generateDreamReading(formInputs);
      break;
    case 'love':
      reading += generateLoveReading(formInputs);
      break;
    default:
      reading += generateGenericReading(readingType, formInputs);
  }

  // Add a conclusion
  reading += `\n\nThank you for seeking guidance with Mystic Balls. Remember that you have the power to shape your own destiny. This reading is meant to provide guidance, but the ultimate choices are yours to make.`;

  return reading;
};

// Helper functions for different reading types
const generateAngelNumbersReading = (formInputs: Record<string, string>): string => {
  const number = formInputs.number || '111';
  
  // Angel number meanings
  const angelNumberMeanings: Record<string, string> = {
    '111': 'This number signifies manifestation and new beginnings. The angels are telling you that your thoughts are manifesting quickly, so focus on positive thinking.',
    '222': 'This number represents balance, harmony, and partnerships. The angels are encouraging you to trust the process and have faith that everything is working out for your highest good.',
    '333': 'This is a sign of divine protection and guidance. The Ascended Masters are near, offering their support and encouragement.',
    '444': 'This number signifies stability and foundation. The angels are with you, offering their protection and guidance.',
    '555': 'This represents significant life changes. The angels are guiding you through this transition period.',
    '666': 'This number encourages balance between material and spiritual aspects of life. It is a reminder to focus on your spiritual connection.',
    '777': 'This is a sign of divine blessing and spiritual awakening. The angels are congratulating you on your spiritual progress.',
    '888': 'This number represents abundance and financial prosperity. The angels are supporting your financial endeavors.',
    '999': 'This signifies completion and the end of a cycle. The angels are helping you close one chapter to begin another.',
    '000': 'This represents infinite potential and the beginning of a spiritual journey. The angels are reminding you of your connection to the divine.'
  };

  let reading = `You've been seeing the number ${number} frequently, and this is no coincidence. Angel numbers are messages from the divine realm, guiding you on your life path.\n\n`;
  
  // Add specific meaning for the number if available
  if (angelNumberMeanings[number]) {
    reading += `${angelNumberMeanings[number]}\n\n`;
  } else {
    // Generate meaning for numbers not in our predefined list
    reading += `The number ${number} carries unique vibrations and energies meant specifically for you. Pay attention to your thoughts and feelings when you see this number, as they provide clues to its meaning in your life.\n\n`;
  }
  
  reading += `When you see ${number}, take a moment to center yourself and be open to the guidance being offered. The angels are trying to communicate with you through these numerical patterns.\n\n`;
  
  if (formInputs.question) {
    reading += `Regarding your question: "${formInputs.question}"\n\nThe angels suggest that you trust your intuition and inner wisdom. The repeated appearance of ${number} in relation to this matter indicates that you're on the right path. Continue to maintain positive thoughts and intentions.\n\n`;
  }
  
  return reading;
};

const generateTarotReading = (formInputs: Record<string, string>): string => {
  // Simplified tarot reading
  const cards = [
    'The Fool - New beginnings, innocence, spontaneity',
    'The Magician - Manifestation, resourcefulness, power',
    'The High Priestess - Intuition, sacred knowledge, divine feminine',
    'The Empress - Abundance, nurturing, fertility',
    'The Emperor - Authority, structure, control',
    'The Hierophant - Spiritual wisdom, tradition, conformity',
    'The Lovers - Relationships, choices, alignment of values',
    'The Chariot - Determination, willpower, success',
    'Strength - Courage, inner strength, compassion',
    'The Hermit - Soul-searching, introspection, guidance',
  ];
  
  // Select three random cards
  const selectedCards = [];
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * cards.length);
    selectedCards.push(cards[randomIndex]);
    cards.splice(randomIndex, 1); // Remove the selected card
  }
  
  let reading = `For your tarot reading, I've drawn three cards representing your past, present, and future:\n\n`;
  
  reading += `Past: ${selectedCards[0]}\nThis card reflects the influences from your past that are still affecting your current situation. ${getCardInterpretation(selectedCards[0])}\n\n`;
  
  reading += `Present: ${selectedCards[1]}\nThis card represents your current circumstances and the energies surrounding you now. ${getCardInterpretation(selectedCards[1])}\n\n`;
  
  reading += `Future: ${selectedCards[2]}\nThis card offers insight into potential future outcomes if you continue on your current path. ${getCardInterpretation(selectedCards[2])}\n\n`;
  
  if (formInputs.question) {
    reading += `Regarding your specific question: "${formInputs.question}"\n\nThe cards suggest that ${getQuestionGuidance(selectedCards, formInputs.question)}\n\n`;
  }
  
  return reading;
};

// Helper function for tarot card interpretations
const getCardInterpretation = (card: string): string => {
  // This would be more extensive in a real application
  if (card.includes('Fool')) {
    return 'This indicates a time of new beginnings and taking leaps of faith. Trust your journey even if you can\'t see the entire path ahead.';
  } else if (card.includes('Magician')) {
    return 'You have all the tools and resources you need to succeed. This is a time to harness your personal power and create what you desire.';
  } else if (card.includes('High Priestess')) {
    return 'Listen to your intuition and pay attention to your dreams. There are deeper truths available to you if you quiet your mind and listen.';
  } else if (card.includes('Empress')) {
    return 'This is a period of growth, nurturing, and abundance. Connect with nature and allow yourself to receive the prosperity available to you.';
  } else if (card.includes('Emperor')) {
    return 'Structure and order are important now. Consider how you can create more stability in your life or take on a leadership role.';
  } else {
    return 'This card suggests important energies at work in your life. Reflect on how its meaning might apply to your specific circumstances.';
  }
};

// Helper function for question guidance
const getQuestionGuidance = (cards: string[], question: string): string => {
  // This would be more sophisticated in a real application
  if (question.toLowerCase().includes('love') || question.toLowerCase().includes('relationship')) {
    return 'your heart knows the answer already. The cards indicate that honest communication and staying true to yourself will lead to the best outcome.';
  } else if (question.toLowerCase().includes('career') || question.toLowerCase().includes('job') || question.toLowerCase().includes('work')) {
    return 'this is a time of potential growth and change. Remain adaptable and open to new opportunities that align with your true passions.';
  } else if (question.toLowerCase().includes('health') || question.toLowerCase().includes('wellness')) {
    return 'balance is key right now. Pay attention to both your physical and emotional needs, and don\'t hesitate to seek support when needed.';
  } else {
    return 'patience and trust in the process will serve you well. The cards indicate that clarity will come with time, and your intuition is your best guide.';
  }
};

const generateAstrologyReading = (formInputs: Record<string, string>): string => {
  // Basic astrology reading based on sun sign
  const sunSign = formInputs.zodiacSign || 'Aries';
  
  const signReadings: Record<string, string> = {
    'Aries': 'As an Aries, your natural leadership and pioneering spirit are highlighted now. This is an excellent time to initiate new projects and take bold action. Your energy and enthusiasm will inspire others to follow your lead.',
    'Taurus': 'Your Taurus nature seeks stability and comfort. Currently, focus on building solid foundations in your life. Your persistence and determination will help you create lasting value in whatever you pursue.',
    'Gemini': 'Your Gemini adaptability and communication skills are your greatest assets right now. This is a favorable time for networking, learning new information, and expressing your ideas. Stay curious and open to different perspectives.',
    'Cancer': 'Your Cancer intuition and emotional intelligence are particularly strong at this time. Trust your instincts regarding relationships and home matters. Nurturing connections with loved ones will bring you fulfillment.',
    'Leo': 'Your Leo confidence and creativity are shining brightly. This is an excellent period for self-expression and taking center stage in your endeavors. Your natural charisma will attract opportunities and admirers.',
    'Virgo': 'Your Virgo analytical abilities and attention to detail serve you well now. Focus on refining your skills and improving efficiency in your daily life. Your practical approach will help solve complex problems.',
    'Libra': 'Your Libra diplomatic nature and sense of fairness are highlighted. This is a good time to focus on relationships and creating harmony in your environment. Finding balance between giving and receiving will be important.',
    'Scorpio': 'Your Scorpio intensity and transformative power are emphasized now. This is a period of potential deep change and renewal. Trust your ability to emerge stronger from any challenges you face.',
    'Sagittarius': 'Your Sagittarius optimism and love of adventure are calling you to expand your horizons. This is an excellent time for travel, education, or exploring new philosophical ideas. Follow your enthusiasm.',
    'Capricorn': 'Your Capricorn discipline and ambition are driving forces now. Focus on long-term goals and building structures that will support your success. Your practical approach and persistence will pay off.',
    'Aquarius': 'Your Aquarius innovative thinking and humanitarian values are highlighted. This is a favorable time for group activities, social causes, and technological pursuits. Your unique perspective can inspire positive change.',
    'Pisces': 'Your Pisces intuition and compassion are particularly strong now. This is a good period for spiritual growth, creative expression, and helping others. Trust your dreams and inner guidance.',
  };
  
  let reading = `Based on your sun sign ${sunSign}, here's your astrological reading:\n\n`;
  
  reading += signReadings[sunSign] || `As a ${sunSign}, your unique celestial influences are guiding you toward important realizations and opportunities.`;
  
  reading += `\n\nCurrent Planetary Influences:\n`;
  reading += `The current Mercury position suggests a time for clear communication and thoughtful expression of ideas. Venus is influencing your relationships and values, bringing harmony and potential for deeper connections. Mars is providing energy and drive toward your goals.\n\n`;
  
  if (formInputs.birthDate) {
    reading += `Your birth date (${formInputs.birthDate}) indicates that you're currently experiencing a period of ${getBirthDateInfluence(formInputs.birthDate)}.\n\n`;
  }
  
  if (formInputs.question) {
    reading += `Regarding your question: "${formInputs.question}"\n\nThe celestial bodies suggest that ${getAstrologyQuestionGuidance(sunSign, formInputs.question)}\n\n`;
  }
  
  return reading;
};

// Helper function for birth date influence
const getBirthDateInfluence = (birthDate: string): string => {
  // This would use actual astrological calculations in a real application
  const randomInfluences = [
    'personal growth and self-discovery',
    'transformation and letting go of the past',
    'expansion in career and public recognition',
    'deepening relationships and emotional connections',
    'creative inspiration and artistic expression',
    'practical achievements and material stability',
    'spiritual awakening and heightened intuition',
    'learning and intellectual development'
  ];
  
  return randomInfluences[Math.floor(Math.random() * randomInfluences.length)];
};

// Helper function for astrology question guidance
const getAstrologyQuestionGuidance = (sunSign: string, question: string): string => {
  // This would be more sophisticated in a real application
  if (question.toLowerCase().includes('love') || question.toLowerCase().includes('relationship')) {
    return 'this is a time to honor your authentic needs in relationships. The stars indicate potential for deeper connections if you remain true to yourself.';
  } else if (question.toLowerCase().includes('career') || question.toLowerCase().includes('job')) {
    return 'your unique talents are seeking expression. The planetary alignments suggest that following your passion will lead to both fulfillment and success.';
  } else if (question.toLowerCase().includes('health') || question.toLowerCase().includes('wellness')) {
    return 'balance between activity and rest is essential now. The celestial energies support healing when you listen to your body\'s wisdom.';
  } else {
    return 'the universe is supporting your growth in this area. Remain open to unexpected opportunities and trust the timing of events unfolding in your life.';
  }
};

const generateDreamReading = (formInputs: Record<string, string>): string => {
  const dreamDescription = formInputs.dreamDescription || 'a journey through unknown landscapes';
  
  // Common dream symbols and their meanings
  const dreamSymbols: Record<string, string> = {
    'water': 'emotions, unconscious mind, purification',
    'flying': 'freedom, transcending limitations, perspective',
    'falling': 'insecurity, loss of control, letting go',
    'teeth': 'anxiety, self-image, communication',
    'house': 'self, personal space, different aspects of personality',
    'death': 'transformation, endings, new beginnings',
    'snake': 'transformation, healing, hidden fears',
    'baby': 'new beginnings, innocence, vulnerability',
    'car': 'direction in life, personal journey, control',
    'money': 'self-worth, value, energy exchange',
  };
  
  let reading = `Your dream about ${dreamDescription} contains important symbolic messages from your subconscious mind.\n\n`;
  
  // Identify potential symbols in the dream description
  const identifiedSymbols: string[] = [];
  Object.keys(dreamSymbols).forEach(symbol => {
    if (dreamDescription.toLowerCase().includes(symbol.toLowerCase())) {
      identifiedSymbols.push(symbol);
    }
  });
  
  if (identifiedSymbols.length > 0) {
    reading += `Key symbols in your dream:\n`;
    identifiedSymbols.forEach(symbol => {
      reading += `- ${symbol.charAt(0).toUpperCase() + symbol.slice(1)}: ${dreamSymbols[symbol]}\n`;
    });
    reading += `\n`;
  }
  
  reading += `Dreams often reflect our inner thoughts, feelings, and experiences that we might not be fully conscious of in our waking life. Your dream about ${dreamDescription} suggests that you may be processing ${getDreamTheme(dreamDescription)}.\n\n`;
  
  reading += `Consider what was happening in your life before this dream and how these elements might relate to your current circumstances. Dreams can offer valuable insights when we take time to reflect on their meaning in the context of our personal journey.\n\n`;
  
  if (formInputs.question) {
    reading += `Regarding your question: "${formInputs.question}"\n\nYour dream may be offering guidance that ${getDreamQuestionGuidance(dreamDescription, formInputs.question)}\n\n`;
  }
  
  return reading;
};

// Helper function for dream themes
const getDreamTheme = (dreamDescription: string): string => {
  // This would be more sophisticated in a real application
  if (dreamDescription.toLowerCase().includes('chase') || dreamDescription.toLowerCase().includes('run')) {
    return 'anxiety, avoidance, or a situation you feel unable to confront in your waking life';
  } else if (dreamDescription.toLowerCase().includes('lost') || dreamDescription.toLowerCase().includes('search')) {
    return 'a sense of confusion or seeking direction in some aspect of your life';
  } else if (dreamDescription.toLowerCase().includes('water') || dreamDescription.toLowerCase().includes('ocean') || dreamDescription.toLowerCase().includes('swim')) {
    return 'emotional currents and how you are navigating your feelings';
  } else if (dreamDescription.toLowerCase().includes('fly') || dreamDescription.toLowerCase().includes('air')) {
    return 'a desire for freedom or transcending current limitations';
  } else {
    return 'important emotional or psychological themes that are currently relevant in your life journey';
  }
};

// Helper function for dream question guidance
const getDreamQuestionGuidance = (dreamDescription: string, question: string): string => {
  // This would be more sophisticated in a real application
  if (question.toLowerCase().includes('love') || question.toLowerCase().includes('relationship')) {
    return 'relates to your emotional needs and how you connect with others. Consider what the dream reveals about your expectations and patterns in relationships.';
  } else if (question.toLowerCase().includes('career') || question.toLowerCase().includes('job') || question.toLowerCase().includes('work')) {
    return 'reflects your aspirations and concerns about your life path. The symbols may indicate untapped potential or new directions to explore.';
  } else if (question.toLowerCase().includes('decision') || question.toLowerCase().includes('choice')) {
    return 'offers insight into your intuitive knowing about this situation. Pay attention to how you felt in the dream as a guide to your true desires.';
  } else {
    return 'contains messages specifically tailored to your current life circumstances. Trust your own interpretation of the symbols that feel most significant to you.';
  }
};

const generateLoveReading = (formInputs: Record<string, string>): string => {
  const relationshipStatus = formInputs.relationshipStatus || 'single';
  
  let reading = `Love Reading for ${relationshipStatus.charAt(0).toUpperCase() + relationshipStatus.slice(1)} Status\n\n`;
  
  if (relationshipStatus.toLowerCase() === 'single') {
    reading += `Your current single status offers an opportunity for self-discovery and preparation for a meaningful connection. The energies around you suggest ${getSingleGuidance()}.\n\n`;
    
    reading += `This is an excellent time to reflect on what you truly desire in a partner and relationship. Consider how past experiences have shaped your expectations and what patterns you may want to change moving forward.\n\n`;
    
    reading += `Potential for new love appears ${getTimingGuidance()} in your future. When it arrives, it will likely come through ${getMeetingCircumstance()}.\n\n`;
  } else {
    reading += `Your current relationship is in a phase of ${getRelationshipPhase()}. The energies between you and your partner suggest ${getRelationshipGuidance()}.\n\n`;
    
    reading += `Communication is particularly important at this time. Being honest about your needs while remaining open to your partner's perspective will strengthen your connection.\n\n`;
    
    reading += `The potential for growth in your relationship is strong if you both focus on ${getRelationshipGrowthArea()}.\n\n`;
  }
  
  if (formInputs.question) {
    reading += `Regarding your specific question: "${formInputs.question}"\n\nThe guidance for this matter is to ${getLoveQuestionGuidance(formInputs.question, relationshipStatus)}.\n\n`;
  }
  
  reading += `Remember that love begins with self-love and authentic expression of who you truly are. The most fulfilling relationships are those where both people feel free to be themselves while growing together.`;
  
  return reading;
};

// Helper functions for love readings
const getSingleGuidance = (): string => {
  const guidances = [
    'focusing on personal growth and self-discovery',
    'expanding your social circles in authentic ways',
    'clarifying what you truly desire in a partner',
    'healing past relationship patterns',
    'enjoying the freedom and opportunities of this season',
    'a time to expand your social circles to meet compatible potential partners',
    'focusing on self-love as the foundation for your next relationship'
  ];
  
  return guidances[Math.floor(Math.random() * guidances.length)] || guidances[0];
};

const getTimingGuidance = (): string => {
  const timings = [
    'within the next three months',
    'after a period of personal growth',
    'when you least expect it',
    'after you have fully embraced your independence',
    'once you have resolved some internal conflicts',
    'in the near future, possibly during a social gathering'
  ];
  
  return timings[Math.floor(Math.random() * timings.length)] || timings[0];
};

const getMeetingCircumstance = (): string => {
  const circumstances = [
    'a mutual friend or social connection',
    'an unexpected encounter in your daily routine',
    'a shared interest or hobby',
    'a work-related event or project',
    'an online connection that develops naturally',
    'travel or exploring a new environment'
  ];
  
  return circumstances[Math.floor(Math.random() * circumstances.length)] || circumstances[0];
};

const getRelationshipPhase = (): string => {
  const phases = [
    'deepening commitment and understanding',
    'transformation and growth through challenges',
    'renewal and rediscovery of your connection',
    'stabilization after a period of change',
    'expansion into new experiences together',
    'healing and rebuilding trust'
  ];
  
  return phases[Math.floor(Math.random() * phases.length)] || phases[0];
};

const getRelationshipGuidance = (): string => {
  const guidances = [
    'the importance of balancing independence with togetherness',
    'a need for more open and honest communication about feelings',
    'appreciation for each other\'s differences as strengths',
    'creating shared goals while supporting individual dreams',
    'renewing the playfulness and joy in your connection',
    'deepening intimacy through vulnerability and trust'
  ];
  
  return guidances[Math.floor(Math.random() * guidances.length)] || guidances[0];
};

const getRelationshipGrowthArea = (): string => {
  const areas = [
    'creating quality time together without distractions',
    'developing better communication skills, especially during disagreements',
    'supporting each other\'s personal growth and independence',
    'expressing appreciation and gratitude regularly',
    'building shared experiences and memories',
    'aligning your values and long-term vision'
  ];
  
  return areas[Math.floor(Math.random() * areas.length)] || areas[0];
};

const getLoveQuestionGuidance = (question: string, relationshipStatus: string): string => {
  // This would be more sophisticated in a real application
  if (question.toLowerCase().includes('ex') || question.toLowerCase().includes('back together')) {
    return 'reflect on why the relationship ended and what has changed since then. Focus on your growth rather than attempting to recreate the past';
  } else if (question.toLowerCase().includes('commit') || question.toLowerCase().includes('future')) {
    return 'trust the natural timing of your relationship. Authentic commitment grows from mutual respect and shared values rather than pressure';
  } else if (question.toLowerCase().includes('trust') || question.toLowerCase().includes('faithful')) {
    return 'communicate your concerns openly but without accusation. Trust is built through consistent actions over time';
  } else if (question.toLowerCase().includes('meet') || question.toLowerCase().includes('find')) {
    return 'focus on expanding your authentic self-expression and engaging in activities you genuinely enjoy. This natural alignment will attract compatible partners';
  } else {
    return 'listen to your intuition while remaining open to growth and new perspectives. The answers you seek often emerge when you quiet external noise';
  }
};

const generateGenericReading = (readingType: ReadingType, formInputs: Record<string, string>): string => {
  // Fallback for any reading type not specifically handled
  let reading = `Your ${readingType.name} reading reveals important insights about your current path.\n\n`;
  
  reading += `The energies surrounding you suggest a period of ${getGenericTheme()}. This is an excellent time to ${getGenericAdvice()}.\n\n`;
  
  if (formInputs.question) {
    reading += `Regarding your question: "${formInputs.question}"\n\nThe guidance offered is to ${getGenericQuestionGuidance(formInputs.question)}.\n\n`;
  }
  
  reading += `Remember that you have the wisdom within to navigate your journey. This reading is meant to illuminate possibilities rather than dictate your path.`;
  
  return reading;
};

// Helper functions for generic readings
const getGenericTheme = (): string => {
  const themes = [
    'transformation and personal growth',
    'reflection and inner discovery',
    'manifestation and creative expression',
    'healing and integration of past experiences',
    'expansion and new opportunities',
    'connection and deepening relationships'
  ];
  
  return themes[Math.floor(Math.random() * themes.length)] || themes[0];
};

const getGenericAdvice = (): string => {
  const advice = [
    'trust your intuition and inner guidance',
    'remain open to unexpected opportunities',
    'focus on what truly brings you joy and fulfillment',
    'release patterns and beliefs that no longer serve you',
    'nurture connections with those who support your authentic self',
    'take inspired action toward your goals'
  ];
  
  return advice[Math.floor(Math.random() * advice.length)] || advice[0];
};

const getGenericQuestionGuidance = (question: string): string => {
  // This would be more sophisticated in a real application
  if (question.toLowerCase().includes('should i')) {
    return 'look within for the answer that resonates with your authentic self. External guidance can offer perspective, but your inner knowing is your best compass';
  } else if (question.toLowerCase().includes('when')) {
    return 'focus on preparation and alignment rather than specific timing. The right circumstances often unfold naturally when we\'re truly ready';
  } else if (question.toLowerCase().includes('how')) {
    return 'take one step at a time with presence and intention. The path often reveals itself as you move forward with openness';
  } else {
    return 'trust the process of your journey and remain attentive to signs and synchronicities that offer guidance specific to your situation';
  }
};

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut, refreshUserData, readingsRemaining } = useContext(UserContext);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedReadingType, setSelectedReadingType] = useState<ReadingType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<string | null>(null);
  const [readingResult, setReadingResult] = useState<string | null>(null);

  // Set initial reading type only if we're on the home page
  useEffect(() => {
    if (location.pathname === '/' && !selectedReadingType) {
      setSelectedReadingType(READING_TYPES[0] || null);
    }
    
    // Set current page for tracking
    setCurrentPage(location.pathname);
  }, [location.pathname, selectedReadingType]);

  // Handle subscription selection
  const handleSubscriptionSelection = (plan: string) => {
    // Check if user is logged in
    if (!user) {
      // Show login modal if not logged in
      setIsLoginModalOpen(true);
      // Store the selected plan to redirect after login
      localStorage.setItem('selectedSubscriptionPlan', plan);
      toast.info('Please sign in to subscribe to this plan');
      return;
    }

    // Simulate API call to create checkout session
    try {
      toast.info(`Redirecting to checkout for ${plan} plan...`);
      
      // In a real app, we would call an API endpoint to create a checkout session
      // For now, we'll simulate this with a timeout and redirect
      setTimeout(() => {
        // Redirect to a payment success page for demo purposes
        setCurrentPage('payment-success');
        navigate(`/payment/success?plan=${plan}`);
        
        // Update subscription in database
        if (refreshUserData) {
          refreshUserData();
        }
      }, 2000);
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to create checkout session');
    }
  };

  // Check for stored subscription plan after login
  useEffect(() => {
    const checkStoredSubscriptionPlan = () => {
      const storedPlan = localStorage.getItem('selectedSubscriptionPlan');
      if (user && storedPlan) {
        // Clear the stored plan
        localStorage.removeItem('selectedSubscriptionPlan');
        // Redirect to checkout with the stored plan
        handleSubscriptionSelection(storedPlan);
      }
    };

    checkStoredSubscriptionPlan();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Intentionally omitting handleSubscriptionSelection to avoid circular dependency

  // Render pricing page
  const renderPricingPage = () => {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 px-4 py-2 text-white bg-indigo-900/40 hover:bg-indigo-900/60 rounded-lg transition-colors"
        >
          <span>←</span>
          Back to Home
        </button>
        <h1 className="text-3xl font-bold mb-8">Subscription Plans</h1>
        <div className="grid md:grid-cols-2 gap-8">
          <div className={`relative rounded-lg p-6 ${isDarkMode ? 'bg-indigo-900/40' : 'bg-indigo-100'}`}>
            <h2 className="text-2xl font-bold mb-4">Basic Plan</h2>
            <p className="text-xl mb-2">$9.99/month</p>
            <ul className="list-disc pl-5 mb-6">
              <li>50 readings per month</li>
              <li>Access to basic reading types</li>
              <li>Email support</li>
            </ul>
            <button 
              className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              onClick={() => handleSubscriptionSelection('basic')}
            >
              Subscribe
            </button>
          </div>
          <div className={`relative rounded-lg p-6 ${isDarkMode ? 'bg-purple-900/40' : 'bg-purple-100'} border-2 border-yellow-400`}>
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-bold">
              RECOMMENDED
            </div>
            <h2 className="text-2xl font-bold mb-4">Premium Plan</h2>
            <p className="text-xl mb-2">$19.99/month</p>
            <ul className="list-disc pl-5 mb-6">
              <li>Unlimited readings</li>
              <li>Access to all reading types</li>
              <li>Priority support</li>
              <li>Personalized insights</li>
            </ul>
            <button 
              className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              onClick={() => handleSubscriptionSelection('premium')}
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render payment success page
  const renderPaymentSuccessPage = () => {
    // Get the plan from URL parameters
    const searchParams = new URLSearchParams(location.search);
    const plan = searchParams.get('plan');
    const planName = plan === 'premium' ? 'Premium' : 'Basic';

    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className={`p-8 rounded-lg ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'} mt-8`}>
          <div className="text-green-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
          <p className="text-xl mb-6">Thank you for subscribing to our {planName} Plan.</p>
          <p className="mb-8">Your subscription is now active and you can start enjoying all the features of your plan immediately.</p>
          <button 
            onClick={() => navigate('/')} 
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  };

  // Apply dark mode styles to body
  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
    document.body.classList.toggle('light-mode', !isDarkMode);
    
    // Force re-render of styles
    document.body.style.backgroundColor = isDarkMode ? '#111827' : '#f3f4f6';
    document.body.style.color = isDarkMode ? '#ffffff' : '#111827';
    
    return () => {
      document.body.classList.remove('dark-mode', 'light-mode');
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    };
  }, [isDarkMode]);

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900 text-white bg-gradient-dark' : 'bg-gray-100 text-gray-900 bg-gradient-light'}`}>
      <BackgroundEffects isDarkMode={isDarkMode} />
      <Header
        user={user}
        isDarkMode={isDarkMode}
        onDarkModeToggle={() => setIsDarkMode(!isDarkMode)}
        onSignOut={() => {
          if (user) {
            console.log('Signing out user...');
            signOut()
              .then(() => {
                console.log('Sign out successful, navigating to home');
                navigate('/');
                toast.success('Signed out successfully');
              })
              .catch((error) => {
                console.error('Error signing out:', error);
                toast.error('Failed to sign out. Please try again.');
              });
          } else {
            console.log('No user to sign out');
          }
        }}
        onLogin={() => setIsLoginModalOpen(true)}
        onManageSubscription={() => setIsSubscriptionModalOpen(true)}
        onSubscribe={() => navigate('/pricing')}
        onViewReadingHistory={() => navigate('/history')}
        onViewAdminDashboard={() => navigate('/admin')}
      />
      
      <main className="flex-grow container mx-auto px-4 py-8 mt-16">
        <Routes>
          {/* Redirect from root to home if needed */}
          <Route path="/" element={
            <div className="max-w-6xl mx-auto">
              {/* Welcome Section */}
              <section className="mb-16 text-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-6 relative group">
                  <span className="absolute -inset-2 bg-fuchsia-500/20 blur-xl rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
                  <span className="absolute -inset-2 bg-fuchsia-500/20 blur-lg rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
                  <span className="absolute -inset-2 bg-fuchsia-500/20 blur-md rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
                  <span className="relative glow-text">Welcome to Your Spiritual Journey</span>
                </h1>
                <p className="text-lg max-w-3xl mx-auto">
                  Explore ancient wisdom through our innovative collection of spiritual readings.
                  Whether you seek guidance on love, career, decisions, or understanding your AI-
                  powered insights combine traditional knowledge with modern technology
                  to illuminate your path forward.
                </p>
              </section>

              {/* Reading Types Section */}
              <ReadingSelector
                READING_TYPES={READING_TYPES}
                handleReadingTypeSelect={(readingType) => {
                  setSelectedReadingType(readingType);
                  navigate(`/reading/${readingType.id}`);
                }}
                isDarkMode={isDarkMode}
                isPremium={profile?.is_premium || false}
                freeReadingsRemaining={readingsRemaining}
              />

              {/* How to Get the Best From Your Reading */}
              <section className="mt-20 mb-16">
                <h2 className="text-2xl md:text-3xl font-bold text-center relative group mb-12">
                  <span className="absolute -inset-2 bg-fuchsia-500/20 blur-xl rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
                  <span className="absolute -inset-2 bg-fuchsia-500/20 blur-lg rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
                  <span className="absolute -inset-2 bg-fuchsia-500/20 blur-md rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
                  <span className="relative glow-text">How to Get the Best From Your Reading</span>
                </h2>

                <div className="grid md:grid-cols-3 gap-8">
                  <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                    <h3 className="text-xl font-semibold mb-4">Set Your Intention</h3>
                    <p>
                      Take a moment to center yourself and clearly focus on your question or area of
                      concern. The more specific your intention, the more focused your reading will be.
                    </p>
                  </div>

                  <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                    <h3 className="text-xl font-semibold mb-4">Create Sacred Space</h3>
                    <p>
                      Find a quiet, comfortable place where you won't be disturbed. This helps create the
                      right environment for receiving spiritual insights.
                    </p>
                  </div>

                  <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                    <h3 className="text-xl font-semibold mb-4">Stay Open</h3>
                    <p>
                      Approach your reading with an open mind and heart. Sometimes the guidance we
                      receive isn't what we expect, but it's often what we need.
                    </p>
                  </div>
                </div>
              </section>

              {/* FAQ Section */}
              <section className="mt-20 mb-16">
                <h2 className="text-2xl md:text-3xl font-bold text-center relative group mb-12">
                  <span className="absolute -inset-2 bg-fuchsia-500/20 blur-xl rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
                  <span className="absolute -inset-2 bg-fuchsia-500/20 blur-lg rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
                  <span className="absolute -inset-2 bg-fuchsia-500/20 blur-md rounded-lg opacity-75 group-hover:opacity-100 transition-opacity"></span>
                  <span className="relative glow-text">Frequently Asked Questions</span>
                </h2>

                <div className="space-y-6">
                  <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                    <h3 className="text-xl font-semibold mb-3">How accurate are the readings?</h3>
                    <p>
                      Our readings combine traditional spiritual wisdom with advanced AI technology. While they provide
                      valuable insights and guidance, remember that you have free will and the power to shape your
                      path.
                    </p>
                  </div>

                  <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                    <h3 className="text-xl font-semibold mb-3">How often should I get a reading?</h3>
                    <p>
                      This varies by individual. Some find daily guidance helpful, while others prefer weekly or monthly
                      readings. Listen to your intuition and seek guidance when you feel called to do so.
                    </p>
                  </div>

                  <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                    <h3 className="text-xl font-semibold mb-3">What if I don't understand my reading?</h3>
                    <p>
                      Take time to reflect on the messages received. Sometimes insights become clearer with time. You
                      can also try journaling about your reading or discussing it with a trusted friend.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          } />

          <Route path="/reading/:readingTypeId" element={
            selectedReadingType ? (
              <div className="max-w-4xl mx-auto">
                <button
                  onClick={() => navigate('/')}
                  className="mb-8 flex items-center gap-2 px-4 py-2 text-white bg-indigo-900/40 hover:bg-indigo-900/60 rounded-lg transition-colors"
                >
                  <span>←</span>
                  Back to Reading Types
                </button>
                
                {readingResult ? (
                  // Display reading result using ReadingOutput component
                  <>
                    <ReadingOutput 
                      readingType={selectedReadingType}
                      isDarkMode={isDarkMode}
                      reading={readingResult}
                      isLoading={false}
                    />
                    <div className="flex justify-between mt-6">
                      <button
                        onClick={() => setReadingResult(null)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        New Reading
                      </button>
                      
                      <button
                        onClick={() => {
                          // Save reading to history if user is logged in
                          // For now just navigate to home
                          navigate('/');
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  </>
                ) : (
                  // Show reading form if no result yet
                  <ReadingForm
                    readingType={selectedReadingType}
                    onSubmit={async (formInputs) => {
                      try {
                        setIsLoading(true);
                        
                        // Check if user has readings remaining
                        if (user) {
                          // For signed-in users, increment reading count in database
                          if (profile && !profile.is_premium) {
                            // Only increment for non-premium users
                            await incrementReadingCount(user.id);
                            // Refresh user data to update readings count
                            await refreshUserData();
                          }
                        } else {
                          // For non-signed-in users, increment local storage count
                          const remaining = incrementFreeReadingUsed();
                          if (remaining <= 0) {
                            toast.info('You have used all your free readings. Sign in for more!', {
                              autoClose: 5000
                            });
                          }
                        }
                        
                        // Simulate API call
                        await new Promise((resolve) => setTimeout(resolve, 2000));
                        
                        if (selectedReadingType) {
                          // Generate a reading result based on the reading type and form data
                          toast.success(`Your ${selectedReadingType.name} reading has been generated!`);
                          
                          // Log the form inputs for debugging
                          console.log('Form inputs:', formInputs);
                          
                          // Generate a reading based on the type and inputs
                          const result = generateReading(selectedReadingType, formInputs);
                          setReadingResult(result);
                        }
                      } catch (error) {
                        console.error('Error submitting reading:', error);
                        toast.error('Failed to generate reading');
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    isDarkMode={isDarkMode}
                    isLoading={isLoading}
                  />
                )}
              </div>
            ) : <Navigate to="/" replace />
          } />

          <Route path="/history" element={
            user ? <ReadingHistory isDarkMode={isDarkMode} onBack={() => navigate('/')} /> : <Navigate to="/" replace />
          } />
          
          {/* Admin Dashboard Route - Only accessible to admin users */}
          <Route path="/admin" element={
            user && profile?.is_admin ? <AdminDashboard /> : <Navigate to="/" replace />
          } />
          
          <Route path="/pricing" element={renderPricingPage()} />

          <Route
            path="/payment/success"
            element={renderPaymentSuccessPage()}
          />

          <Route
            path="/payment/cancel"
            element={
              <div className="max-w-4xl mx-auto text-center">
                <div className={`p-8 rounded-lg ${isDarkMode ? 'bg-red-900/30' : 'bg-red-100'} mt-8`}>
                  <div className="text-red-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h1 className="text-3xl font-bold mb-4">Payment Cancelled</h1>
                  <p className="text-xl mb-6">Your subscription payment was cancelled.</p>
                  <p className="mb-8">No charges have been made to your account.</p>
                  <button 
                    onClick={() => navigate('/pricing')} 
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors mr-4"
                  >
                    Return to Plans
                  </button>
                  <button 
                    onClick={() => navigate('/')} 
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                  >
                    Go Home
                  </button>
                </div>
              </div>
            }
          />

          {/* Privacy Policy Route */}
          <Route path="/privacy" element={
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                <h2 className="text-xl font-semibold mb-4">Information Collection and Use</h2>
                <p className="mb-4">
                  Mystic Balls collects personal information when you create an account, including your email address and authentication details. 
                  We also collect information about your readings and preferences to provide a personalized experience.
                </p>
                <p className="mb-4">
                  We use this information to:
                </p>
                <ul className="list-disc pl-5 mb-4">
                  <li>Provide and improve our services</li>
                  <li>Personalize your experience</li>
                  <li>Process payments and manage subscriptions</li>
                  <li>Communicate with you about your account and updates</li>
                </ul>
              </div>

              <div className={`p-6 rounded-xl mt-6 ${isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                <h2 className="text-xl font-semibold mb-4">Data Protection</h2>
                <p className="mb-4">
                  We implement appropriate security measures to protect your personal information from unauthorized access, 
                  alteration, disclosure, or destruction. Your data is stored securely using industry-standard encryption.
                </p>
              </div>

              <div className={`p-6 rounded-xl mt-6 ${isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                <h2 className="text-xl font-semibold mb-4">Cookies and Tracking</h2>
                <p className="mb-4">
                  Mystic Balls uses cookies to enhance your experience and analyze usage patterns. 
                  You can control cookie settings through your browser preferences.
                </p>
              </div>

              <div className={`p-6 rounded-xl mt-6 ${isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
                <p className="mb-4">
                  If you have questions about our privacy practices, please contact us at privacy@mysticballs.com.
                </p>
              </div>

              <button
                onClick={() => navigate('/')}
                className="mt-8 flex items-center gap-2 px-4 py-2 text-white bg-indigo-900/40 hover:bg-indigo-900/60 rounded-lg transition-colors"
              >
                <span>←</span>
                Back to Home
              </button>
            </div>
          } />

          {/* Terms of Service Route */}
          <Route path="/terms" element={
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                <h2 className="text-xl font-semibold mb-4">Acceptance of Terms</h2>
                <p className="mb-4">
                  By accessing or using Mystic Balls, you agree to be bound by these Terms of Service. 
                  If you do not agree to these terms, please do not use our services.
                </p>
              </div>

              <div className={`p-6 rounded-xl mt-6 ${isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                <h2 className="text-xl font-semibold mb-4">User Accounts</h2>
                <p className="mb-4">
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities 
                  that occur under your account. You must immediately notify us of any unauthorized use of your account.
                </p>
              </div>

              <div className={`p-6 rounded-xl mt-6 ${isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                <h2 className="text-xl font-semibold mb-4">Subscription and Payments</h2>
                <p className="mb-4">
                  Subscription fees are charged in advance on a monthly basis. You can cancel your subscription at any time, 
                  and your access will continue until the end of your current billing period.
                </p>
              </div>

              <div className={`p-6 rounded-xl mt-6 ${isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                <h2 className="text-xl font-semibold mb-4">Disclaimer</h2>
                <p className="mb-4">
                  Mystic Balls provides readings for entertainment purposes only. We do not guarantee the accuracy of readings, 
                  and they should not be used as a substitute for professional advice.
                </p>
              </div>

              <button
                onClick={() => navigate('/')}
                className="mt-8 flex items-center gap-2 px-4 py-2 text-white bg-indigo-900/40 hover:bg-indigo-900/60 rounded-lg transition-colors"
              >
                <span>←</span>
                Back to Home
              </button>
            </div>
          } />

          {/* Catch-all redirect to home page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer 
        isDarkMode={isDarkMode}
        onPrivacyClick={() => {
          setCurrentPage('privacy');
          navigate('/privacy');
        }}
        onTermsClick={() => {
          setCurrentPage('terms');
          navigate('/terms');
        }}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      {/* Login Modal */}
      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}
      
      {/* Subscription Manager Modal */}
      {isSubscriptionModalOpen && user && (
        <SubscriptionManager
          user={user}
          isDarkMode={isDarkMode}
          onClose={() => setIsSubscriptionModalOpen(false)}
        />
      )}
      
      <ToastContainer position="bottom-right" theme={isDarkMode ? 'dark' : 'light'} />
    </div>
  );
};

export default App;
