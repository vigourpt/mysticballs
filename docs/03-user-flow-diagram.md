# User Flow Diagram

## Overview

This document outlines the main user flows within the MYSTICBALLS application. Understanding these flows is crucial for developers to maintain and enhance the user experience.

## Main User Flows

### 1. First-Time User Flow

```
┌─────────────────┐     ┌───────────────────┐     ┌─────────────────┐
│                 │     │                   │     │                 │
│   Landing Page  │────▶│  Reading Selection│────▶│   Reading Form  │
│                 │     │                   │     │                 │
└─────────────────┘     └───────────────────┘     └────────┬────────┘
                                                           │
                                                           ▼
┌─────────────────┐     ┌───────────────────┐     ┌─────────────────┐
│                 │     │                   │     │                 │
│  Reading Result │◀────│ Login/Sign Up Form│◀────│ Authentication  │
│                 │     │                   │     │     Prompt      │
└─────────────────┘     └───────────────────┘     └─────────────────┘
```

1. User lands on the homepage
2. User browses and selects a reading type
3. User fills out the reading form
4. User is prompted to authenticate
5. User creates an account or logs in
6. Reading is generated and displayed

### 2. Returning User Flow

```
┌─────────────────┐     ┌───────────────────┐     ┌─────────────────┐
│                 │     │                   │     │                 │
│   Landing Page  │────▶│  Reading Selection│────▶│   Reading Form  │
│                 │     │                   │     │                 │
└─────────────────┘     └───────────────────┘     └────────┬────────┘
                                                           │
                                                           ▼
                                                  ┌─────────────────┐
                                                  │                 │
                                                  │  Reading Result │
                                                  │                 │
                                                  └─────────────────┘
```

1. User lands on the homepage (already authenticated)
2. User selects a reading type
3. User fills out the reading form
4. Reading is generated and displayed

### 3. Free Trial Ended Flow

```
┌─────────────────┐     ┌───────────────────┐     ┌─────────────────┐
│                 │     │                   │     │                 │
│   Landing Page  │────▶│  Reading Selection│────▶│   Reading Form  │
│                 │     │                   │     │                 │
└─────────────────┘     └───────────────────┘     └────────┬────────┘
                                                           │
                                                           ▼
┌─────────────────┐     ┌───────────────────┐     ┌─────────────────┐
│                 │     │                   │     │                 │
│  Reading Result │◀────│  Payment Success  │◀────│  Payment Modal  │
│                 │     │                   │     │                 │
└─────────────────┘     └───────────────────┘     └─────────────────┘
```

1. User lands on the homepage (authenticated, free trial ended)
2. User selects a reading type
3. User fills out the reading form
4. User is prompted to subscribe
5. User completes payment
6. Reading is generated and displayed

### 4. Authentication Flow

```
┌─────────────────┐
│                 │
│   Login Modal   │
│                 │
└───────┬─────────┘
        │
        ▼
┌───────────────────┐     ┌─────────────────┐
│                   │     │                 │
│ Email/Password    │────▶│  Authentication │
│                   │     │    Success      │
└───────────────────┘     └─────────────────┘
        │
        ▼
┌───────────────────┐     ┌─────────────────┐
│                   │     │                 │
│ Google OAuth      │────▶│  Authentication │
│                   │     │    Success      │
└───────────────────┘     └─────────────────┘
```

1. User clicks login/signup
2. User chooses authentication method
3. User completes authentication
4. User is redirected back to the application

### 5. Subscription Flow

```
┌─────────────────┐     ┌───────────────────┐     ┌─────────────────┐
│                 │     │                   │     │                 │
│  Payment Modal  │────▶│  Plan Selection   │────▶│  Stripe Checkout│
│                 │     │                   │     │                 │
└─────────────────┘     └───────────────────┘     └────────┬────────┘
                                                           │
                                                           ▼
                                                  ┌─────────────────┐
                                                  │                 │
                                                  │ Payment Success │
                                                  │                 │
                                                  └─────────────────┘
```

1. User is presented with payment modal
2. User selects a subscription plan
3. User is redirected to Stripe checkout
4. User completes payment
5. User is redirected back to the application

## Detailed User Interactions

### Homepage Interactions

- **Header Navigation**: Login/Signup, Dark Mode Toggle
- **Reading Type Selection**: Click on reading type card
- **FAQ Section**: Expandable questions and answers
- **Footer Links**: Privacy Policy, Terms of Service

### Reading Form Interactions

- **Form Input**: Text fields, dropdowns, date pickers
- **Form Submission**: "Get Your Reading" button
- **Back Navigation**: Return to reading selection

### Authentication Interactions

- **Login Form**: Email/Password fields, Submit button
- **Signup Form**: Email/Password/Confirm fields, Submit button
- **Google OAuth**: "Continue with Google" button
- **Password Reset**: "Forgot Password" link

### Payment Interactions

- **Plan Selection**: Choose between subscription options
- **Payment Method**: Credit card, Apple Pay, Google Pay
- **Subscription Management**: Cancel, upgrade, downgrade

## Error Handling Flows

### Authentication Errors

```
┌─────────────────┐     ┌───────────────────┐     ┌─────────────────┐
│                 │     │                   │     │                 │
│   Login Form    │────▶│  Invalid Credentials ──▶│  Error Message  │
│                 │     │                   │     │                 │
└─────────────────┘     └───────────────────┘     └─────────────────┘
```

### Payment Errors

```
┌─────────────────┐     ┌───────────────────┐     ┌─────────────────┐
│                 │     │                   │     │                 │
│ Stripe Checkout │────▶│  Payment Failure  │────▶│  Error Message  │
│                 │     │                   │     │                 │
└─────────────────┘     └───────────────────┘     └─────────────────┘
```

### API Errors

```
┌─────────────────┐     ┌───────────────────┐     ┌─────────────────┐
│                 │     │                   │     │                 │
│  Reading Form   │────▶│   API Error       │────▶│  Error Message  │
│                 │     │                   │     │                 │
└─────────────────┘     └───────────────────┘     └─────────────────┘
```

## Mobile-Specific Flows

The mobile experience follows the same general flows but with adapted UI components:

- Hamburger menu instead of full header navigation
- Stacked cards instead of grid layout
- Simplified forms with mobile-optimized inputs
- Touch-friendly buttons and controls

## Onboarding Flow

New users are guided through a brief onboarding process:

1. Welcome screen with app overview
2. Reading type explanation
3. Account creation benefits
4. Free trial information

This onboarding can be skipped but helps users understand the value proposition.

## Conclusion

Understanding these user flows is essential for maintaining a consistent and intuitive user experience. When making changes to the application, consider how they might impact these established flows and ensure that users can still accomplish their goals efficiently.