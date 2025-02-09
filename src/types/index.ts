// Database Types
export type User = {
  id: string;
  email: string;
  display_name: string | null;
  readings_count: number;
  is_premium: boolean;
  last_reading_date: string | null;
  created_at: string;
  updated_at: string;
};

export type UserProfile = {
  id: string;
  email: string;
  display_name: string | null;
  readings_count: number;
  is_premium: boolean;
  last_reading_date: string | null;
  created_at: string;
  updated_at: string;
};

// Form Types
export interface ReadingField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'email' | 'number';
  placeholder: string;
  required: boolean;
}

export interface ReadingType {
  id: string;
  name: string;
  description: string;
  icon: string;
  fields: ReadingField[];
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}

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

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}

export interface ReadingField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'email' | 'number';
  placeholder: string;
  required: boolean;
}

export type Session = {
  access_token: string;
  refresh_token: string;
  user: User;
};
