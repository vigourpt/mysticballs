export interface UserUsage {
  readingsCount: number;
  isPremium: boolean;
  lastReadingDate?: string | null;
  readings_remaining?: number;
}

export type ReadingType = {
  id: string;
  name: string;
  description: string;
  icon: any; // Replace with proper icon type if needed
};

export type PaymentPlan = {
  id: string;
  name: string;
  price: number;
  features: string[];
};

export type Step = {
  target: string;
  title: string;
  content: string;
  position: "top" | "bottom" | "left" | "right";
};
