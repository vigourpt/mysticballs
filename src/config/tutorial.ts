export const ONBOARDING_STEPS = [
  {
    id: 'reading-types',
    target: '.reading-types',
    title: 'Choose Your Reading',
    content: 'Start by selecting the type of spiritual reading you\'d like to receive. Each option offers unique insights and guidance.',
    position: 'bottom' as const
  },
  {
    id: 'theme-toggle',
    target: '.theme-toggle',
    title: 'Customize Your Experience',
    content: 'Toggle between light and dark mode for comfortable reading in any environment.',
    position: 'left' as const
  },
  {
    id: 'reading-form',
    target: '.reading-form',
    title: 'Provide Your Details',
    content: 'Fill in the required information to receive a personalized reading tailored to your needs.',
    position: 'right' as const
  },
  {
    id: 'reading-output',
    target: '.reading-output',
    title: 'Your Reading Results',
    content: 'Your personalized reading will appear here, offering spiritual guidance and insights.',
    position: 'top' as const
  }
];

export const TOOLTIPS = {
  readingTypes: {
    tarot: 'Discover insights through the ancient wisdom of tarot cards',
    numerology: 'Unlock the meaning behind your personal numbers',
    astrology: 'Explore your celestial connections and cosmic path',
    oracle: 'Receive guidance through mystical oracle messages',
    runes: 'Ancient Norse wisdom for modern guidance',
    iching: 'Connect with ancient Chinese divination wisdom',
    angelNumbers: 'Decode divine messages in recurring numbers',
    horoscope: 'Your personalized daily celestial guidance',
    dreams: 'Uncover the hidden meanings in your dreams',
    magic8ball: 'Quick answers to yes/no questions',
    aura: 'Discover your energy field\'s colors and meanings',
    pastLife: 'Explore your soul\'s previous incarnations'
  },
  actions: {
    darkMode: 'Toggle between light and dark mode',
    signIn: 'Sign in to save your readings and unlock premium features',
    premium: 'Upgrade to premium for unlimited readings',
    back: 'Return to reading type selection'
  }
};
