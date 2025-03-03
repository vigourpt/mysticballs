# Technical Architecture

## Overview

MYSTICBALLS follows a modern web application architecture with a React frontend and serverless backend functions. The application is built with a focus on scalability, maintainability, and user experience.

## Architecture Diagram

```
┌─────────────────┐     ┌───────────────────┐     ┌─────────────────┐
│                 │     │                   │     │                 │
│  React Frontend │────▶│ Netlify Functions │────▶│   OpenAI API    │
│                 │     │                   │     │                 │
└────────┬────────┘     └─────────┬─────────┘     └─────────────────┘
         │                        │
         │                        │
         │                        │
         │                        │
┌────────▼────────┐     ┌─────────▼─────────┐     ┌─────────────────┐
│                 │     │                   │     │                 │
│    Supabase     │◀───▶│    Stripe API     │     │  User's Browser │
│  Auth & Database│     │                   │     │                 │
└─────────────────┘     └───────────────────┘     └─────────────────┘
```

## Frontend Architecture

The frontend is built with React and TypeScript, using Vite as the build tool. The application follows a component-based architecture with the following structure:

### Key Components

1. **App.tsx**: The main application component that handles routing and global state.

2. **Components**:
   - **Header.tsx**: Navigation and user authentication status
   - **Footer.tsx**: Links to legal pages and site information
   - **ReadingSelector.tsx**: Grid of available reading types
   - **ReadingForm.tsx**: Dynamic form for the selected reading type
   - **ReadingOutput.tsx**: Displays the generated reading
   - **LoginModal.tsx**: Authentication modal
   - **PaymentModal.tsx**: Subscription options and payment flow

3. **Form Components**:
   - Specialized form components for each reading type (e.g., TarotForm.tsx, NumerologyForm.tsx)

4. **Hooks**:
   - **useAuth.ts**: Authentication-related functions
   - **useAuthState.ts**: Authentication state management
   - **useTutorial.ts**: Tutorial and onboarding state
   - **useUsageTracking.ts**: Tracking user reading usage

### State Management

The application uses React's built-in state management with hooks:

1. **Local Component State**: useState for component-specific state
2. **Global State**: Shared state through context providers and custom hooks
3. **Authentication State**: Managed through Supabase and custom hooks

### Styling

The application uses Tailwind CSS for styling with custom animations and effects:

1. **Tailwind CSS**: Utility-first CSS framework
2. **Custom Animations**: CSS animations for visual effects
3. **Responsive Design**: Mobile-first approach with responsive breakpoints

## Backend Architecture

The backend is primarily serverless, using Netlify Functions and Supabase:

### Netlify Functions

1. **getReading.ts**: Handles reading generation requests
   - Validates user authentication
   - Checks user's reading quota
   - Formats prompts for OpenAI
   - Returns generated reading

2. **create-checkout-session.ts**: Handles Stripe payment flow
   - Creates Stripe checkout sessions
   - Handles subscription management

### Supabase Integration

1. **Authentication**: Email/password and Google OAuth
2. **Database**: PostgreSQL database for user data
3. **Tables**:
   - user_profiles: User information and reading quotas
   - subscriptions: User subscription status

### External APIs

1. **OpenAI API**: Used for generating reading content
   - Different models based on reading complexity
   - Custom prompts for each reading type

2. **Stripe API**: Payment processing
   - Subscription management
   - Webhook handling for payment events

## Data Flow

### Reading Generation Flow

1. User selects a reading type
2. User fills out the reading form
3. Frontend sends request to `/.netlify/functions/getReading`
4. Function validates user authentication and quota
5. Function formats prompt and sends to OpenAI API
6. OpenAI generates reading content
7. Function returns reading to frontend
8. Frontend displays reading to user

### Authentication Flow

1. User clicks login/signup
2. LoginModal component displays
3. User enters credentials or selects Google
4. Supabase handles authentication
5. On success, user profile is fetched
6. UI updates to reflect authenticated state

### Payment Flow

1. User hits free reading limit
2. PaymentModal component displays
3. User selects subscription plan
4. Frontend calls `/.netlify/functions/create-checkout-session`
5. Function creates Stripe checkout session
6. User is redirected to Stripe checkout
7. After payment, user is redirected back to app
8. Subscription status is updated in database

## Security Considerations

1. **Authentication**: Handled by Supabase with secure token management
2. **API Keys**: Stored as environment variables, not exposed to frontend
3. **Content Security Policy**: Implemented to prevent XSS attacks
4. **Rate Limiting**: Implemented to prevent abuse
5. **Input Validation**: All user inputs are validated before processing

## Performance Optimizations

1. **Code Splitting**: Dynamic imports for better loading performance
2. **Lazy Loading**: Components loaded only when needed
3. **Caching**: Service worker for caching static assets
4. **Bundle Optimization**: Vite's build optimization for smaller bundles
5. **Image Optimization**: Optimized images for faster loading

## Deployment Architecture

1. **Netlify**: Hosts the frontend and serverless functions
2. **Continuous Deployment**: Automatic deployment from GitHub
3. **Environment Variables**: Managed through Netlify's environment variable system
4. **Branch Previews**: Preview deployments for pull requests

## Monitoring and Logging

1. **Error Tracking**: Console logging for development
2. **Performance Monitoring**: Metrics for key performance indicators
3. **Usage Analytics**: Tracking of user interactions and reading types

## Development Environment

1. **Local Development**: Vite dev server with hot module replacement
2. **Environment Variables**: Local .env files for development
3. **Supabase Local**: Local Supabase instance for development
4. **Stripe Testing**: Test mode for Stripe integration