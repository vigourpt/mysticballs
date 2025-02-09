// Database Types
export interface User {
  id: string;
  email: string;
  display_name: string | null;
  readings_count: number;
  is_premium: boolean;
  last_reading_date: string | null;
  created_at: string;
  updated_at: string;
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

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}

// Form Types
export interface FormField {
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
  formFields: FormField[];
  icon?: string;
}

export interface Step {
  target: string;
  content: string;
}

export interface UserUsage {
  readingsCount: number;
  isPremium: boolean;
  lastReadingDate?: string | null;
  readingsRemaining: number;
}

export interface CheckoutResult {
  url?: string;
  error?: string;
}
