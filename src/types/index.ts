// Database Types
import { LucideIcon } from 'lucide-react';

export interface User {
  id: string;
  email: string;
  access_token: string;
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
export interface ReadingField {
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  displayName: string;
  placeholder?: string;
  required: boolean;
}

export type ReadingTypeId = 
  | 'daily-guidance'
  | 'love-reading'
  | 'career-guidance'
  | 'spiritual-journey'
  | 'past-life'
  | 'chakra-reading'
  | 'angel-guidance'
  | 'crystal-reading'
  | 'manifestation'
  | 'numerology'
  | 'aura-reading'
  | 'life-purpose';

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
  readingsCount: number;
  isPremium: boolean;
  lastReadingDate?: string | null;
  readingsRemaining: number;
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

export type Session = {
  access_token: string;
  refresh_token: string;
  user: User;
};
