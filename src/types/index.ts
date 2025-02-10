// Database Types
import type { LucideIcon } from 'lucide-react';

export interface User {
  id: string;
  email: string;
  subscription?: {
    status: 'active' | 'inactive';
    plan: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  readings_count: number;
  is_premium: boolean;
  last_reading_date: string | null;
  created_at: string;
  updated_at: string;
}

// Form Types
export type ReadingTypeId = 
  | 'daily-guidance'
  | 'love-reading'
  | 'career-guidance'
  | 'spiritual-journey'
  | 'chakra-reading'
  | 'crystal-reading'
  | 'manifestation'
  | 'aura-reading'
  | 'life-purpose'
  | 'tarot'
  | 'numerology'
  | 'astrology'
  | 'oracle'
  | 'runes'
  | 'iching'
  | 'angel-numbers'
  | 'horoscope'
  | 'dream-analysis'
  | 'magic-8-ball'
  | 'aura'
  | 'past-life';

export interface ReadingField {
  name: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select';
  label: string;
  displayName: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

export interface ReadingType {
  id: ReadingTypeId;
  name: string;
  description: string;
  icon: LucideIcon;
  fields: ReadingField[];
}

export type PricingPlan = 'basic' | 'premium' | 'unlimited';

export type Step = {
  target: string;
  content: string;
};

export type UserUsage = {
  readingsRemaining: number;
  totalReadings: number;
  lastReadingDate: string | null;
};

export interface CheckoutResult {
  sessionId: string;
}

export interface HeaderProps {
  isDarkMode: boolean;
  onDarkModeToggle: () => void;
  user: User | null;
  onSignOut: () => void;
}

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  user: User | null;
  onSubscribe: (plan: PricingPlan) => Promise<void>;
  remainingReadings: number;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface Reading {
  id: string;
  userId: string;
  readingTypeId: ReadingTypeId;
  formData: Record<string, string>;
  createdAt: Date;
  response?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
}
