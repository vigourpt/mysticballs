export interface UserUsage {
  readingsCount: number;
  isPremium: boolean;
  lastReadingDate?: string | null;
  readingsRemaining: number;
}

export interface UserProfile {
  user_id: string;
  email: string;
  display_name?: string;
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

export type ReadingType = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

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
