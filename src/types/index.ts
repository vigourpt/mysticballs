export interface UserUsage {
  readingsCount: number;
  isPremium: boolean;
  lastReadingDate?: string | null;
  readingsRemaining: number;
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

export interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  priceId: string;
  features: string[];
}

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
  fields: ReadingField[];
  icon?: string;
}

export interface Step {
  target: string;
  title: string;
  content: string;
  position: "top" | "bottom" | "left" | "right";
  size?: "small" | "medium" | "large";
}

export interface CheckoutResult {
  url?: string;
  error?: string;
}
