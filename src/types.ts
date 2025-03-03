import type { LucideIcon } from 'lucide-react';

export type ReadingTypeId = 'tarot' | 'numerology' | 'astrology' | 'oracle' | 'runes' | 'iching' | 'angelnumbers' | 'horoscope' | 'dreamanalysis' | 'magic8ball' | 'aura' | 'pastlife';

export interface ReadingType {
  id: ReadingTypeId;
  name: string;
  description: string;
  icon: LucideIcon;
  fields?: ReadingField[];
  premiumOnly?: boolean;
}

export interface ReadingField {
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  label: string;
  displayName: string;
  placeholder?: string;
  options?: string[];
  required: boolean;
}

export interface UserUsage {
  readingsCount: number;
  readingsRemaining: number;
  isPremium: boolean;
  lastReadingDate?: Date | null;
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
  placement: 'top' | 'bottom' | 'left' | 'right';
}
