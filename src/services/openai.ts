import OpenAI from 'openai';
import { OPENAI_CONFIG } from '../config/openai';

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
  readingType: string,
  userInput: Record<string, string>
): Promise<string> => {
  if (!OPENAI_CONFIG.apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const prompts: Record<string, string> = {
    numerology: `As a numerology expert, provide an insightful reading for ${userInput.name}, born on ${userInput.birthdate}. Focus only on the meaningful interpretations of their Life Path Number, Destiny Number, and Soul Urge Number. Skip all calculations and technical details. Provide the insights in a clear, engaging way that focuses on personality traits, life purpose, and potential. Keep the response concise and meaningful. Use markdown headers (###) for each section, and ensure paragraphs are well-separated.`,
    tarot: `As a tarot reader, provide an insightful interpretation for this question: ${userInput.question}. Draw three cards and focus only on their meaning and guidance in context. Skip technical details about the cards' positions or systems. Keep the reading engaging and practical. Use markdown headers (###) for each card's section, and ensure paragraphs are well-separated.`,
    astrology: `As an astrologer, provide an insightful reading for someone born on ${userInput.birthdate}${userInput.birthTime ? ` at ${userInput.birthTime}` : ''}${userInput.location ? ` in ${userInput.location}` : ''}. Focus on personality traits, life path, and current influences. Skip technical aspects and focus on practical insights and guidance. Use markdown headers (###) for each section, and ensure paragraphs are well-separated.`,
    oracle: `As an oracle card reader, provide clear guidance for this question: ${userInput.question}. Draw three cards and focus only on their message and meaning for the querent. Keep the interpretation practical and actionable. Use markdown headers (###) for each card's section, and ensure paragraphs are well-separated.`,
    runes: `As a rune caster, provide clear guidance for this question: ${userInput.question}. Cast three runes and focus only on their message and practical meaning for the situation. Skip technical details about the runes themselves. Use markdown headers (###) for each rune's section, and ensure paragraphs are well-separated.`,
    iching: `As an I Ching expert, provide clear guidance for this question: ${userInput.question}. Focus only on the practical interpretation and wisdom for the situation. Skip technical details about hexagram numbers and structure. Use markdown headers (###) for each section, and ensure paragraphs are well-separated.`,
    angelNumbers: `As an angel number interpreter, analyze the number ${userInput.number} that keeps appearing to ${userInput.name}. Provide deep spiritual insights about its divine meaning and guidance. Focus on the practical messages and spiritual significance. Use markdown headers (###) for different aspects of the interpretation.`,
    horoscope: `As an astrologer, provide a detailed daily horoscope for ${userInput.zodiacSign} on ${userInput.date}. Include insights about love, career, and personal growth. Make the guidance practical and actionable. Use markdown headers (###) for different life areas.`,
    dreams: `As a dream interpreter, analyze this dream: ${userInput.dream}. Provide deep psychological and spiritual insights about its meaning. Focus on practical implications and guidance. Use markdown headers (###) for different symbols and overall meaning.`,
    magic8ball: `As a mystical oracle, provide a clear yes/no answer to: ${userInput.question}. Then provide a brief, mystical explanation for the answer in an engaging way. Keep it concise but meaningful. Use markdown headers (###) for the answer and explanation.`,
    aura: `As an aura reading expert, provide a detailed analysis for ${userInput.name} based on their personality description: "${userInput.personality}" and current emotional state: "${userInput.emotionalState}". Identify their dominant and secondary aura colors, interpret their meaning, and provide guidance for balancing and strengthening their energy field. Include practical tips for maintaining and cleansing their aura. Use markdown headers (###) for different aspects of the reading.`,
    pastLife: `As a past life regression expert, provide a detailed reading for ${userInput.name} who feels drawn to the ${userInput.timePeriod} period and describes these feelings/memories: "${userInput.feelings}". Create a vivid narrative of their most significant past life from this period, including their role in society, key relationships, major life events, and the lessons that soul carried forward to the present life. Explain how these past experiences influence their current life path and provide guidance for integrating this wisdom. Use markdown headers (###) for different aspects of the reading.`
  };

  const response = await openai.chat.completions.create({
    model: OPENAI_CONFIG.model,
    messages: [
      {
        role: 'system',
        content: 'You are a wise and insightful mystic who provides clear, practical guidance. Focus on meaningful insights and skip technical details. Keep responses concise yet profound, and always maintain a supportive and encouraging tone. Use markdown formatting with ### for section headers, and ensure proper spacing between paragraphs and sections.'
      },
      {
        role: 'user',
        content: prompts[readingType]
      }
    ],
    temperature: OPENAI_CONFIG.temperature,
  });

  const content = response.choices[0].message.content || 'Unable to generate reading';
  return formatResponse(content);
};