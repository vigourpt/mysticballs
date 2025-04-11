import { PricingPlan } from '../types';
import { STRIPE_TEST_MODE, TEST_PRICE_IDS } from './constants';

export const PAYMENT_PLANS: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    stripePriceId: STRIPE_TEST_MODE 
      ? TEST_PRICE_IDS.basic
      : 'price_1QKjTIG3HGXKeksq3NJSoxfN',
    description: 'Perfect for occasional guidance',
    features: [
      '50 readings per month',
      'Standard reading types',
      'Basic support',
      'Email notifications'
    ],
    readingsPerMonth: 50,
    interval: 'month' as 'month' | 'year'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 19.99,
    stripePriceId: STRIPE_TEST_MODE 
      ? TEST_PRICE_IDS.premium
      : 'price_1QKja1G3HGXKeksqUqC0edF0',
    description: 'For those seeking regular insights',
    features: [
      'Unlimited readings',
      'All reading types including premium',
      'Priority support',
      '30-day reading history',
      'Detailed interpretations'
    ],
    readingsPerMonth: Infinity,
    recommended: true,
    interval: 'month' as 'month' | 'year'
  }
];
