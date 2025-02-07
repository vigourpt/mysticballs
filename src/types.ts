export type ReadingType = 'tarot' | 'numerology' | 'astrology' | 'oracle' | 'runes' | 'iching' | 'angelNumbers' | 'horoscope' | 'dreams' | 'magic8ball' | 'aura' | 'pastLife';

export interface UserUsage {
  readingsCount: number;
  isPremium: boolean;
  lastReadingDate?: string;
}

export interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  readingsPerMonth: number;
}