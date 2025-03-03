# Development Guide

## Overview

This guide provides instructions for setting up the development environment, understanding the codebase, and contributing to the MYSTICBALLS project.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **Git**
- A code editor (VS Code recommended)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/mysticballs.git
cd mysticballs
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the project root with the following variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

For Netlify Functions, create a `.env` file in the project root:

```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
OPENAI_API_KEY=your_openai_api_key
OPENAI_PROJECT_ID=your_openai_project_id
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### 4. Start the Development Server

```bash
npm run dev
```

This will start the Vite development server at `http://localhost:5173`.

### 5. Start the Netlify Functions Server

In a separate terminal:

```bash
npm run netlify
```

This will start the Netlify Functions development server at `http://localhost:8888/.netlify/functions/`.

## Project Structure

```
mysticballs/
├── netlify/                  # Netlify configuration and functions
│   ├── functions/            # Serverless functions
│   │   ├── getReading.ts     # Main reading generation function
│   │   └── utils/            # Utility functions for Netlify Functions
├── public/                   # Static assets
├── src/                      # Source code
│   ├── components/           # React components
│   │   ├── forms/            # Form components for different reading types
│   │   └── icons/            # SVG icons
│   ├── config/               # Configuration files
│   ├── data/                 # Static data
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Library code
│   ├── services/             # Service integrations (Supabase, OpenAI, Stripe)
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Utility functions
│   ├── App.tsx               # Main application component
│   ├── index.css             # Global styles
│   └── main.tsx              # Application entry point
├── supabase/                 # Supabase configuration and migrations
├── .env                      # Environment variables for Netlify Functions
├── .env.local                # Local environment variables (not committed)
├── .gitignore                # Git ignore file
├── index.html                # HTML entry point
├── netlify.toml              # Netlify configuration
├── package.json              # Project dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── vite.config.ts            # Vite configuration
```

## Development Workflow

### Code Style and Formatting

The project uses ESLint and Prettier for code style and formatting:

```bash
# Run ESLint
npm run lint

# Run Prettier
npm run format
```

### TypeScript

The project is written in TypeScript. Make sure to define proper types for all variables, functions, and components.

### Component Development

When creating new components:

1. Create a new file in the appropriate directory under `src/components/`
2. Use TypeScript interfaces for props
3. Use functional components with hooks
4. Export the component as the default export

Example:

```tsx
import React from 'react';

interface MyComponentProps {
  title: string;
  isDarkMode: boolean;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, isDarkMode }) => {
  return (
    <div className={isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}>
      <h2>{title}</h2>
    </div>
  );
};

export default MyComponent;
```

### Adding a New Reading Type

To add a new reading type:

1. Create a new form component in `src/components/forms/`
2. Add the reading type to `src/data/readingTypes.ts`
3. Add the reading configuration to `netlify/functions/getReading.ts`
4. Update the `ReadingForm` component to handle the new form type

### Working with Netlify Functions

When developing Netlify Functions:

1. Create a new function file in `netlify/functions/`
2. Use the Handler type from `@netlify/functions`
3. Export the handler function
4. Test locally using the Netlify CLI

Example:

```typescript
import { Handler } from '@netlify/functions';

const handler: Handler = async (event, context) => {
  try {
    // Function logic here
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Success' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};

export { handler };
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

The project uses Vitest and React Testing Library for testing:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders the title', () => {
    render(<MyComponent title="Test Title" isDarkMode={false} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
});
```

## Debugging

### Frontend Debugging

1. Use the React Developer Tools browser extension
2. Use `console.log` statements for quick debugging
3. Use the browser's built-in debugger with breakpoints

### Netlify Functions Debugging

1. Use `console.log` statements (visible in the terminal)
2. Check the Netlify Functions logs in the terminal
3. Use the `netlify dev --inspect` command for Node.js debugging

## Working with External Services

### Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Set up the database schema using the SQL migrations in `supabase/migrations/`
3. Configure authentication providers (Email, Google)
4. Get the API keys and add them to your environment variables

### OpenAI

1. Create an OpenAI account at [openai.com](https://openai.com)
2. Create an API key
3. Add the API key to your environment variables

### Stripe

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Set up products and prices
3. Get the API keys and add them to your environment variables
4. For webhook testing, use the Stripe CLI:

```bash
stripe listen --forward-to http://localhost:8888/.netlify/functions/stripe-webhook
```

## Deployment

### Deploying to Netlify

1. Push your changes to GitHub
2. Connect your repository to Netlify
3. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add the environment variables in the Netlify dashboard
5. Deploy the site

## Troubleshooting

### Common Issues

#### "Module not found" errors

Make sure all dependencies are installed:

```bash
npm install
```

#### Environment variable issues

Check that all required environment variables are set in `.env.local` and `.env`.

#### Netlify Functions not working

Make sure the Netlify CLI is installed and running:

```bash
npm install -g netlify-cli
netlify dev
```

#### Supabase connection issues

Verify your Supabase URL and API keys are correct.

#### OpenAI API errors

Check your API key and ensure you have sufficient credits.

## Best Practices

### Code Quality

- Write clean, readable, and maintainable code
- Follow the established patterns in the codebase
- Use meaningful variable and function names
- Add comments for complex logic

### Performance

- Minimize component re-renders
- Use memoization for expensive calculations
- Optimize images and assets
- Use code splitting for large components

### Security

- Never commit API keys or secrets
- Validate all user inputs
- Use proper authentication and authorization
- Follow security best practices for each external service

### Accessibility

- Use semantic HTML elements
- Add proper ARIA attributes
- Ensure sufficient color contrast
- Test with keyboard navigation

## Contributing

### Pull Request Process

1. Fork the repository
2. Create a new branch for your feature or bugfix
3. Make your changes
4. Run tests and linting
5. Submit a pull request
6. Address any review comments

### Commit Message Guidelines

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
feat: add new reading type
fix: resolve authentication issue
docs: update README
style: format code
refactor: simplify reading form logic
test: add tests for payment flow
chore: update dependencies
```

## Conclusion

This development guide should help you get started with contributing to the MYSTICBALLS project. If you have any questions or need further assistance, please reach out to the project maintainers.