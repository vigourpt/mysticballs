export type ReadingTypeId = 'tarot' | 'numerology' | 'astrology' | 'oracle' | 'runes' | 'iching' | 'angels' | 'horoscope' | 'dreams' | 'magic8ball' | 'aura' | 'pastlife';

export interface ReadingType {
  id: ReadingTypeId;
  name: string;
  description: string;
  icon: string;
  fields?: ReadingField[];
}

export interface ReadingField {
  name: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: string[];
  required: boolean;
}

export interface UserUsage {
  readingsCount: number;
  readingsRemaining: number;
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

export interface PricingPlan extends PaymentPlan {
  stripePriceId: string;
  recommended?: boolean;
}

export interface Step {
  id: string;
  title: string;
  content: string;
  target: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}