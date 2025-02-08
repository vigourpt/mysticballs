import OpenAI from 'openai';
import { OPENAI_CONFIG } from '../config/openai';
import { ReadingType } from '../types';

const openai = new OpenAI({
  apiKey: OPENAI_CONFIG.apiKey,
  dangerouslyAllowBrowser: true
});

const formatResponse = (text: string): string => {
  text = text.replace(/\n(#{1,3})/g, '\n\n$1');
  text = text.replace(/\n\n/g, '\n\n\n');
  text = text.replace(/\n{4,}/g, '\n\n\n');
  return text;
};

export const getReading = async (
  readingType: ReadingType,
  userInput: Record<string, string>
): Promise<string> => {
  if (!OPENAI_CONFIG.apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  if (!readingType || !readingType.id) {
    console.error('Invalid reading type:', readingType);
    throw new Error('Invalid reading type object');
  }

  const prompts: Record<string, string> = {
    numerology: `As a numerology expert, provide an insightful reading for ${userInput.name}, born on ${userInput.birthdate}. Focus only on the meaningful interpretations of their Life Path Number, Destiny Number, and Soul Urge Number. Skip all calculations and technical details. Provide the insights in a clear, engaging way that focuses on personality traits, life purpose, and potential. Keep the response concise and meaningful. Use markdown headers (###) for each section, and ensure paragraphs are well-separated.`,
    
    tarot: `As a tarot reader, provide an insightful interpretation for this question: ${userInput.question}. Draw three cards and focus only on their meaning and guidance in context. Skip technical details about the cards' positions or systems. Keep the reading engaging and practical. Use markdown headers (###) for each card's section, and ensure paragraphs are well-separated.`,
    
    astrology: `As an astrologer, provide an insightful reading for someone born on ${userInput.birthdate}${userInput.birthTime ? ` at ${userInput.birthTime}` : ''}${userInput.location ? ` in ${userInput.location}` : ''}. Focus on personality traits, life path, and current influences. Skip technical aspects and focus on practical insights and guidance. Use markdown headers (###) for each section, and ensure paragraphs are well-separated.`,
    
    oracle: `As an oracle card reader, provide clear guidance for this question: ${userInput.question}. Draw three cards and focus only on their message and meaning for the querent. Keep the interpretation practical and actionable. Use markdown headers (###) for each card's section, and ensure paragraphs are well-separated.`,
    
    runes: `As a rune caster, provide clear guidance for this question: ${userInput.question}. Cast three runes and focus only on their message and practical meaning for the situation. Skip technical details and focus on the guidance. Use markdown headers (###) for each rune's section, and ensure paragraphs are well-separated.`,
    
    iching: `As an I Ching expert, provide wisdom and guidance for this question: ${userInput.question}. Cast the hexagram and focus on its practical meaning and advice. Skip technical details about the casting process. Keep the interpretation clear and actionable. Use markdown headers (###) for key sections, and ensure paragraphs are well-separated.`,
    
    angels: `As an angel number interpreter, analyze the number sequence ${userInput.number} that has been appearing to the querent. Explain its divine message and guidance. Focus on practical meaning and spiritual insights. Use markdown headers (###) for key aspects of the interpretation, and ensure paragraphs are well-separated.`,
    
    horoscope: `As an astrologer, provide a detailed daily horoscope for ${userInput.zodiacSign} for today. Focus on love, career, and personal growth opportunities. Include practical advice and potential challenges. Use markdown headers (###) for each life area, and ensure paragraphs are well-separated.`,
    
    dreams: `As a dream interpreter, analyze this dream: ${userInput.dream}. Focus on the symbolic meaning and personal relevance to the dreamer. Provide practical insights and guidance. Skip technical dream analysis terminology. Use markdown headers (###) for key dream symbols and their meanings, and ensure paragraphs are well-separated.`,
    
    magic8: `As the Magic 8 Ball, provide a mystical answer to this question: ${userInput.question}. First give a clear yes/no/maybe response, then provide a short, intuitive explanation for the answer. Keep the response concise but insightful. Use markdown headers (###) for the answer and explanation sections.`,
    
    aura: `As an aura reader, provide an interpretation of the querent's aura based on their current emotional state and life situation: ${userInput.situation}. Describe the colors present and their meanings, energy patterns, and practical guidance for maintaining energetic health. Use markdown headers (###) for each aspect of the reading, and ensure paragraphs are well-separated.`,
    
    pastlife: `As a past life reader, explore the querent's most significant past life based on their current attractions and patterns: ${userInput.patterns}. Create a detailed narrative of their past life, including historical context and how it influences their present journey. Use markdown headers (###) for different aspects of the past life reading, and ensure paragraphs are well-separated.`
  };

  const prompt = prompts[readingType.id];
  if (!prompt) {
    console.error('Invalid reading type ID:', readingType.id);
    throw new Error(`Invalid reading type: ${readingType.id}`);
  }

  try {
    const completion = await openai.chat.completions.create({
      model: OPENAI_CONFIG.model,
      temperature: OPENAI_CONFIG.temperature,
      messages: [
        {
          role: 'system',
          content: 'You are a skilled spiritual guide and mystic reader. Provide clear, insightful, and practical guidance. Focus on meaningful interpretations and avoid technical jargon. Always maintain a compassionate and supportive tone.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('Failed to generate reading');
    }

    return formatResponse(response);
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
};