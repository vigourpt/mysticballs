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

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  is_premium: boolean;
  is_admin?: boolean;
  plan_type: 'free' | 'basic' | 'premium';
  readings_count: number;
  readings_remaining: number;
  last_reading_date?: string;
  created_at: string;
  updated_at: string;
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
