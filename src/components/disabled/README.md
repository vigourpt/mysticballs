# Disabled Components

This directory contains components that are temporarily disabled but may be reactivated in the future.

## Components

### TrialOfferModal
- **Status**: Disabled (as of Feb 7, 2025)
- **Purpose**: Offers users a trial period using PayPal integration
- **Reason for Disabling**: Switched to Stripe as the primary payment processor
- **Future Use**: May be reactivated if we decide to add PayPal as an alternative payment method

To reactivate this component:
1. Move it back to the main components directory
2. Import it in App.tsx
3. Reimplement the trial offer logic in App.tsx
4. Update the payment processing logic to handle both Stripe and PayPal
