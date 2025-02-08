export const OPENAI_CONFIG = {
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  model: 'gpt-4o-mini',  // Points to gpt-4o-mini-2024-07-18, optimized for cost and performance
  temperature: 0.7
};