# Deployment Guide

## Overview

This guide provides detailed instructions for deploying the MYSTICBALLS application to production environments. The application is designed to be deployed on Netlify, with Supabase for the backend and database.

## Deployment Architecture

MYSTICBALLS follows a JAMstack architecture:

1. **Frontend**: Static files served from Netlify's CDN
2. **Backend**: Serverless functions hosted on Netlify Functions
3. **Database**: PostgreSQL database hosted on Supabase
4. **Authentication**: Handled by Supabase Auth
5. **Payment Processing**: Handled by Stripe

## Prerequisites

Before deploying, ensure you have:

1. A Netlify account
2. A Supabase account
3. A Stripe account
4. An OpenAI account
5. A domain name (optional, but recommended)

## Deployment Steps

### 1. Prepare the Application for Production

#### Update Environment Variables

Ensure all production environment variables are properly set in your deployment configuration:

```
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_production_stripe_publishable_key
VITE_OPENAI_API_KEY=your_production_openai_api_key
```

#### Update Production Configuration

Review and update the production configuration in `src/config/production.ts`:

```typescript
export const PRODUCTION_CONFIG = {
  APP_URL: 'https://yourdomain.com',
  API_URL: 'https://yourdomain.com/api',
  // Other production settings
};
```

#### Build the Application

Run the production build:

```bash
npm run build
```

This will create a `dist` directory with the optimized production build.

### 2. Set Up Supabase

#### Create a Supabase Project

1. Log in to [Supabase](https://supabase.com)
2. Create a new project
3. Note your project URL and API keys

#### Set Up the Database Schema

Apply the database migrations:

1. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. Apply migrations:
   ```bash
   supabase db push
   ```

Alternatively, you can manually run the SQL scripts from the `supabase/migrations` directory in the Supabase SQL editor.

#### Configure Authentication

1. Go to Authentication > Settings
2. Enable Email/Password sign-in
3. Configure Google OAuth (if using)
4. Set up email templates for verification and password reset

### 3. Set Up Stripe

#### Create Stripe Products and Prices

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to Products > Add Product
3. Create products for your subscription plans
4. Note the price IDs for each plan

#### Configure Stripe Webhooks

1. Go to Developers > Webhooks
2. Add an endpoint: `https://yourdomain.com/.netlify/functions/stripe-webhook`
3. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Note the webhook signing secret

### 4. Set Up OpenAI

1. Log in to [OpenAI](https://platform.openai.com)
2. Go to API Keys and create a new API key
3. Set up a project (optional)
4. Configure usage limits to control costs

### 5. Deploy to Netlify

#### Using the Netlify CLI

1. Install the Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Log in to Netlify:
   ```bash
   netlify login
   ```

3. Initialize the project:
   ```bash
   netlify init
   ```

4. Deploy the site:
   ```bash
   netlify deploy --prod
   ```

#### Using the Netlify Dashboard

1. Log in to [Netlify](https://app.netlify.com)
2. Click "New site from Git"
3. Connect to your Git repository
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Click "Deploy site"

#### Configure Environment Variables

In the Netlify dashboard:

1. Go to Site settings > Environment variables
2. Add the following environment variables:
   ```
   SUPABASE_URL=your_production_supabase_url
   SUPABASE_SERVICE_KEY=your_production_supabase_service_key
   OPENAI_API_KEY=your_production_openai_api_key
   OPENAI_PROJECT_ID=your_production_openai_project_id
   STRIPE_SECRET_KEY=your_production_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_production_stripe_webhook_secret
   ```

#### Configure Build Settings

In the Netlify dashboard:

1. Go to Site settings > Build & deploy > Continuous Deployment
2. Configure build settings:
   - Base directory: `/`
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

### 6. Set Up Custom Domain (Optional)

In the Netlify dashboard:

1. Go to Site settings > Domain management
2. Click "Add custom domain"
3. Enter your domain name
4. Follow the instructions to configure DNS settings

### 7. Configure SSL

Netlify automatically provisions SSL certificates for custom domains. Ensure HTTPS is enforced:

1. Go to Site settings > Domain management > HTTPS
2. Enable "Force HTTPS"

## Post-Deployment Tasks

### 1. Verify Deployment

1. Visit your deployed site
2. Test user registration and login
3. Test the reading functionality
4. Test the payment flow

### 2. Set Up Monitoring

#### Error Monitoring

1. Set up error logging (e.g., Sentry, LogRocket)
2. Configure alerts for critical errors

#### Performance Monitoring

1. Set up performance monitoring (e.g., Netlify Analytics, Google Analytics)
2. Monitor key performance metrics:
   - First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP)
   - First Input Delay (FID)
   - Cumulative Layout Shift (CLS)

#### Usage Monitoring

1. Monitor Supabase usage
2. Monitor OpenAI API usage
3. Monitor Stripe transactions

### 3. Set Up Backup Strategy

1. Configure regular database backups in Supabase
2. Set up a backup retention policy

## Deployment Environments

### Production Environment

The main production environment should be deployed from the `main` branch.

### Staging Environment

A staging environment can be set up for testing before production:

1. Create a new Netlify site for staging
2. Configure it to deploy from the `develop` branch
3. Set up separate environment variables for staging

### Preview Environments

Netlify automatically creates preview deployments for pull requests:

1. Go to Site settings > Build & deploy > Deploy contexts
2. Enable "Deploy preview URLs"

## Continuous Integration/Continuous Deployment (CI/CD)

### Automated Deployments

Netlify automatically deploys when changes are pushed to the connected Git repository:

1. Push changes to the `develop` branch for staging
2. Merge to `main` for production deployment

### Build Hooks

Set up build hooks for triggering deployments:

1. Go to Site settings > Build & deploy > Build hooks
2. Create a new build hook
3. Use the webhook URL to trigger builds from external services

## Rollback Procedures

### Rolling Back a Deployment

If issues are detected in a deployment:

1. Go to the Netlify dashboard > Deploys
2. Find the last working deployment
3. Click "Publish deploy"

### Database Rollbacks

For database issues:

1. Restore from a backup in Supabase
2. Or apply a migration to fix the issue

## Security Considerations

### Content Security Policy

Configure a Content Security Policy in `netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self' https://js.stripe.com; connect-src 'self' https://*.supabase.co https://api.openai.com https://api.stripe.com; frame-src 'self' https://js.stripe.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; object-src 'none'"
```

### API Rate Limiting

Configure rate limiting for API endpoints:

1. Implement rate limiting in Netlify Functions
2. Configure rate limits in OpenAI

### Authentication Security

1. Ensure proper JWT validation
2. Set appropriate token expiration times
3. Implement refresh token rotation

## Scaling Considerations

### Frontend Scaling

Netlify automatically scales the frontend serving:

1. Assets are served from a global CDN
2. Static site generation provides excellent performance

### Function Scaling

Netlify Functions automatically scale based on demand:

1. Be aware of the execution limits (10 seconds for Netlify Functions)
2. Optimize function code for performance

### Database Scaling

Monitor Supabase usage and upgrade as needed:

1. Watch for performance bottlenecks
2. Consider database optimization techniques
3. Upgrade to higher tier plans as needed

### OpenAI API Scaling

Monitor OpenAI API usage:

1. Set appropriate rate limits
2. Be aware of token usage and costs
3. Implement caching for common requests

## Troubleshooting

### Common Deployment Issues

#### Build Failures

1. Check build logs in Netlify
2. Verify all dependencies are properly installed
3. Ensure environment variables are correctly set

#### Function Execution Errors

1. Check function logs in Netlify
2. Verify environment variables
3. Check for timeout issues (functions are limited to 10 seconds)

#### Database Connection Issues

1. Verify Supabase connection strings
2. Check network access rules
3. Verify service role key permissions

#### Payment Processing Issues

1. Check Stripe webhook logs
2. Verify webhook signatures
3. Test the payment flow in Stripe test mode

## Maintenance

### Regular Maintenance Tasks

1. Update dependencies regularly
2. Monitor for security vulnerabilities
3. Review and optimize database queries
4. Monitor API usage and costs

### Scheduled Maintenance

Plan for scheduled maintenance:

1. Communicate maintenance windows to users
2. Perform database optimizations
3. Apply major version updates during low-traffic periods

## Conclusion

Following this deployment guide will help you successfully deploy the MYSTICBALLS application to production. Regular monitoring and maintenance will ensure the application remains performant, secure, and reliable for users.