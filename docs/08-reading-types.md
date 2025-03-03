# Reading Types

## Overview

MYSTICBALLS offers a variety of spiritual and mystical reading types, each with its own unique form, prompt structure, and output format. This document outlines the different reading types available in the application, their input requirements, and how they're processed.

## Available Reading Types

### 1. Tarot Reading

**Description**: Discover insights through the ancient wisdom of tarot cards.

**Input Form**:
- Question: The user's specific question or area of concern

**Processing**:
- The system selects tarot cards for the reading
- Each card is interpreted individually
- The relationships between cards are analyzed
- An overall message is provided

**Output Format**:
- Card selection (which cards were drawn)
- Individual card interpretations
- Card interactions and relationships
- Overall guidance and message

### 2. Numerology Reading

**Description**: Unlock the meaning behind your personal numbers.

**Input Form**:
- Full Name: The user's complete name
- Birth Date: The user's date of birth

**Processing**:
- Calculate Life Path Number (from birth date)
- Calculate Destiny Number (from full name)
- Calculate Soul Urge Number (from vowels in name)
- Calculate Personality Number (from consonants in name)

**Output Format**:
- Life Path Number and interpretation
- Destiny Number and interpretation
- Soul Urge Number and interpretation
- Personality Number and interpretation
- Overall numerological profile

### 3. Astrology Reading

**Description**: Explore your celestial connections and cosmic path.

**Input Form**:
- Birth Date: The user's date of birth
- Birth Time (optional): The user's time of birth
- Birth Place: The location where the user was born

**Processing**:
- Calculate sun sign, moon sign, and rising sign
- Identify planetary positions and aspects
- Analyze house placements

**Output Format**:
- Sun Sign characteristics
- Current planetary influences
- Life areas affected
- Upcoming opportunities and challenges

### 4. Oracle Card Reading

**Description**: Receive guidance through mystical oracle messages.

**Input Form**:
- Question: The user's specific question or area of concern

**Processing**:
- The system selects oracle cards for the reading
- Each card is interpreted in the context of the question
- Symbolic meanings are explored

**Output Format**:
- Initial insights
- Symbolic interpretations
- Guidance and advice
- Future possibilities

### 5. Rune Reading

**Description**: Ancient Norse wisdom for modern guidance.

**Input Form**:
- Question: The user's specific question or area of concern

**Processing**:
- The system selects runes for the reading
- Each rune is interpreted individually
- The relationships between runes are analyzed

**Output Format**:
- Runes drawn
- Individual rune meanings
- How the runes interact
- Practical guidance

### 6. I Ching Reading

**Description**: Connect with ancient Chinese divination wisdom.

**Input Form**:
- Question: The user's specific question or area of concern

**Processing**:
- The system generates hexagrams
- Changing lines are identified
- Core meanings are interpreted

**Output Format**:
- Hexagram(s) drawn
- Changing lines
- Core meaning and symbolism
- Advice for the situation

### 7. Angel Numbers

**Description**: Decode divine messages in recurring numbers.

**Input Form**:
- Number: The recurring number the user has been seeing
- Name: The user's name

**Processing**:
- Analyze the significance of each digit
- Interpret the combined message
- Connect to spiritual meaning

**Output Format**:
- Significance of each number
- Combined message
- Spiritual meaning
- Practical guidance

### 8. Daily Horoscope

**Description**: Your personalized daily celestial guidance.

**Input Form**:
- Zodiac Sign: The user's sun sign

**Processing**:
- Generate daily forecast based on current planetary positions
- Focus on different life areas

**Output Format**:
- General overview
- Love & relationships
- Career & goals
- Health & wellness
- Lucky elements for the day

### 9. Dream Analysis

**Description**: Uncover the hidden meanings in your dreams.

**Input Form**:
- Dream: Detailed description of the user's dream

**Processing**:
- Identify key symbols and themes
- Analyze emotional context
- Connect to personal significance

**Output Format**:
- Symbol analysis
- Emotional context
- Personal significance
- Guidance & messages

### 10. Magic 8 Ball

**Description**: Quick answers to yes/no questions.

**Input Form**:
- Question: The user's yes/no question

**Processing**:
- Generate a random Magic 8 Ball response

**Output Format**:
- Short, classic Magic 8 Ball response (e.g., "It is certain", "Ask again later")

### 11. Aura Reading

**Description**: Discover your energy field's colors and meanings.

**Input Form**:
- Feelings: Description of the user's current emotional and physical state

**Processing**:
- Interpret energy patterns based on described feelings
- Identify dominant aura colors
- Analyze chakra balance

**Output Format**:
- Dominant aura colors
- Energy patterns
- Chakra balance
- Practical energy maintenance

### 12. Past Life Reading

**Description**: Explore your soul's previous incarnations.

**Input Form**:
- Concerns: Current life issues or patterns
- Feelings: Unexplained feelings or attractions

**Processing**:
- Create a narrative of a potential past life
- Connect past life to current concerns
- Identify lessons and influences

**Output Format**:
- Time period overview
- Past life identity
- Key life events
- Connection to present
- Lessons & influences

## Implementation Details

### Form Components

Each reading type has a corresponding form component in the `src/components/forms` directory:

```typescript
// src/components/forms/types.ts
export interface FormProps {
  onSubmit: (data: Record<string, string>) => void;
  isDarkMode: boolean;
}
```

Example form component for Tarot Reading:

```typescript
// src/components/forms/QuestionForm.tsx
import React, { useState } from 'react';
import { FormProps } from './types';

const QuestionForm: React.FC<FormProps> = ({ onSubmit, isDarkMode }) => {
  const [question, setQuestion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ question });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label 
          htmlFor="question" 
          className={`block text-lg font-medium ${
            isDarkMode ? 'text-white' : 'text-gray-700'
          }`}
        >
          What would you like guidance on?
        </label>
        <textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter your question here..."
          required
          className="mt-1 block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          rows={4}
        />
      </div>
      <button
        type="submit"
        className="w-full px-6 py-3 text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
      >
        Get Your Reading
      </button>
    </form>
  );
};

export default QuestionForm;
```

### Reading Form Component

The main `ReadingForm` component dynamically loads the appropriate form based on the reading type:

```typescript
// src/components/ReadingForm.tsx (simplified)
import React from 'react';
import { ReadingType } from '../types';
import QuestionForm from './forms/QuestionForm';
import NumerologyForm from './forms/NumerologyForm';
import AstrologyForm from './forms/AstrologyForm';
import HoroscopeForm from './forms/HoroscopeForm';
import DreamForm from './forms/DreamForm';
import Magic8BallForm from './forms/Magic8BallForm';
import AngelNumbersForm from './forms/AngelNumbersForm';
import AuraForm from './forms/AuraForm';
import PastLifeForm from './forms/PastLifeForm';

interface ReadingFormProps {
  readingType: ReadingType;
  onSubmit: (formData: Record<string, string>) => void;
  isDarkMode: boolean;
}

const ReadingForm: React.FC<ReadingFormProps> = ({
  readingType,
  onSubmit,
  isDarkMode
}) => {
  const renderForm = () => {
    switch (readingType.formComponent) {
      case 'QuestionForm':
        return <QuestionForm onSubmit={onSubmit} isDarkMode={isDarkMode} />;
      case 'NumerologyForm':
        return <NumerologyForm onSubmit={onSubmit} isDarkMode={isDarkMode} />;
      case 'AstrologyForm':
        return <AstrologyForm onSubmit={onSubmit} isDarkMode={isDarkMode} />;
      case 'HoroscopeForm':
        return <HoroscopeForm onSubmit={onSubmit} isDarkMode={isDarkMode} />;
      case 'DreamForm':
        return <DreamForm onSubmit={onSubmit} isDarkMode={isDarkMode} />;
      case 'Magic8BallForm':
        return <Magic8BallForm onSubmit={onSubmit} isDarkMode={isDarkMode} />;
      case 'AngelNumbersForm':
        return <AngelNumbersForm onSubmit={onSubmit} isDarkMode={isDarkMode} />;
      case 'AuraForm':
        return <AuraForm onSubmit={onSubmit} isDarkMode={isDarkMode} />;
      case 'PastLifeForm':
        return <PastLifeForm onSubmit={onSubmit} isDarkMode={isDarkMode} />;
      default:
        return <QuestionForm onSubmit={onSubmit} isDarkMode={isDarkMode} />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className={`text-2xl font-bold mb-6 ${
        isDarkMode ? 'text-white' : 'text-gray-800'
      }`}>
        {readingType.name}
      </h2>
      <p className={`mb-6 ${
        isDarkMode ? 'text-gray-300' : 'text-gray-600'
      }`}>
        {readingType.description}
      </p>
      {renderForm()}
    </div>
  );
};

export default ReadingForm;
```

## OpenAI Prompts

Each reading type has a specific system prompt that guides the AI in generating the reading. These prompts are defined in the Netlify function:

```typescript
// netlify/functions/getReading.ts (partial)
const readingConfigs: Record<string, { maxTokens: number; temperature: number; systemPrompt: string }> = {
  'tarot': {
    maxTokens: 1000,
    temperature: 0.7,
    systemPrompt: `You are an experienced tarot reader with deep knowledge of the 78-card deck. Provide a structured reading that includes: 
1. The cards drawn (choose these intuitively)
2. Individual card interpretations
3. How the cards interact
4. Overall message and guidance
Use markdown headers (###) to separate sections.`
  },
  'numerology': {
    maxTokens: 800,
    temperature: 0.6,
    systemPrompt: `You are a skilled numerologist. Analyze the numerical patterns and provide insights into:
1. Life Path Number
2. Destiny Number
3. Soul Urge Number
4. Personality Traits
5. Life Purpose
Use markdown headers (###) for each section.`
  },
  // Additional reading types...
};
```

## Conclusion

The reading types in MYSTICBALLS provide a diverse range of spiritual and mystical experiences for users. Each reading type is carefully designed with appropriate input forms, processing logic, and output formats to create a cohesive and engaging user experience. The modular architecture allows for easy addition of new reading types in the future.