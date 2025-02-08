export const OPENAI_CONFIG = {
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  model: 'gpt-3.5-turbo',  // Using the standard GPT-3.5 Turbo model
  temperature: 0.7
};