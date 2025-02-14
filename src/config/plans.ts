import { PricingPlan } from '../types';

export const PAYMENT_PLANS: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    stripePriceId: 'price_1QKjTIG3HGXKeksq3NJSoxfN',
    description: 'Perfect for occasional guidance',
    features: [
      '30 readings per month',
      'All reading types',
      'Basic support'
    ],
    readingsPerMonth: 30
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 19.99,
    stripePriceId: 'price_1QKja1G3HGXKeksqUqC0edF0',
    description: 'For those seeking regular insights',
    features: [
      'Unlimited readings',
      'Priority support',
      'Detailed interpretations',
      'Personal reading history'
    ],
    readingsPerMonth: Infinity
  }
];