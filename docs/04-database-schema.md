# Database Schema

## Overview

MYSTICBALLS uses Supabase (PostgreSQL) as its database. This document outlines the database schema, including tables, relationships, and key fields.

## Tables

### 1. user_profiles

Stores user profile information and reading usage statistics.

```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    display_name TEXT,
    readings_count INTEGER NOT NULL DEFAULT 0,
    is_premium BOOLEAN NOT NULL DEFAULT false,
    last_reading_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
```

#### Fields:
- `id`: Primary key, references Supabase auth.users
- `email`: User's email address
- `display_name`: User's display name (optional)
- `readings_count`: Number of readings the user has requested
- `is_premium`: Whether the user has a premium subscription
- `last_reading_date`: Timestamp of the user's last reading
- `created_at`: Timestamp when the profile was created
- `updated_at`: Timestamp when the profile was last updated

### 2. subscriptions

Tracks user subscription information.

```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    plan_id TEXT NOT NULL,
    status TEXT NOT NULL,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for faster lookups
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
```

#### Fields:
- `id`: Primary key
- `user_id`: References user_profiles.id
- `stripe_customer_id`: Stripe customer ID
- `stripe_subscription_id`: Stripe subscription ID
- `plan_id`: ID of the subscription plan
- `status`: Subscription status (active, canceled, past_due, etc.)
- `current_period_start`: Start of the current billing period
- `current_period_end`: End of the current billing period
- `cancel_at_period_end`: Whether the subscription will cancel at the end of the period
- `created_at`: Timestamp when the subscription was created
- `updated_at`: Timestamp when the subscription was last updated

### 3. reading_history

Stores history of readings for each user.

```sql
CREATE TABLE reading_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    reading_type TEXT NOT NULL,
    user_input JSONB NOT NULL,
    reading_output TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for faster lookups
CREATE INDEX idx_reading_history_user_id ON reading_history(user_id);
CREATE INDEX idx_reading_history_reading_type ON reading_history(reading_type);
CREATE INDEX idx_reading_history_created_at ON reading_history(created_at);
```

#### Fields:
- `id`: Primary key
- `user_id`: References user_profiles.id
- `reading_type`: Type of reading (tarot, numerology, etc.)
- `user_input`: JSON object containing user input for the reading
- `reading_output`: Text of the generated reading
- `created_at`: Timestamp when the reading was created

### 4. api_usage

Tracks API usage for monitoring and billing purposes.

```sql
CREATE TABLE api_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    api_name TEXT NOT NULL,
    tokens_used INTEGER NOT NULL,
    cost DECIMAL(10, 6) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for faster lookups
CREATE INDEX idx_api_usage_user_id ON api_usage(user_id);
CREATE INDEX idx_api_usage_api_name ON api_usage(api_name);
CREATE INDEX idx_api_usage_created_at ON api_usage(created_at);
```

#### Fields:
- `id`: Primary key
- `user_id`: References user_profiles.id (nullable for anonymous usage)
- `api_name`: Name of the API (openai, etc.)
- `tokens_used`: Number of tokens used in the API call
- `cost`: Cost of the API call
- `created_at`: Timestamp when the API call was made

### 5. feedback

Stores user feedback on readings.

```sql
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    reading_id UUID REFERENCES reading_history(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for faster lookups
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_reading_id ON feedback(reading_id);
```

#### Fields:
- `id`: Primary key
- `user_id`: References user_profiles.id (nullable for anonymous feedback)
- `reading_id`: References reading_history.id
- `rating`: Rating from 1 to 5
- `comments`: Optional comments
- `created_at`: Timestamp when the feedback was created

## Database Functions

### 1. increment_reading_count

Increments the readings_count for a user and updates the last_reading_date.

```sql
CREATE OR REPLACE FUNCTION increment_reading_count(p_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE user_profiles
    SET 
        readings_count = readings_count + 1,
        last_reading_date = NOW(),
        updated_at = NOW()
    WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;
```

### 2. check_subscription_status

Checks if a user's subscription is active.

```sql
CREATE OR REPLACE FUNCTION check_subscription_status(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    is_active BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM subscriptions
        WHERE 
            user_id = p_user_id
            AND status = 'active'
            AND current_period_end > NOW()
    ) INTO is_active;
    
    RETURN is_active;
END;
$$ LANGUAGE plpgsql;
```

## Row Level Security (RLS) Policies

Supabase uses PostgreSQL's Row Level Security to control access to data.

### 1. user_profiles RLS

```sql
-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY user_profiles_select_policy ON user_profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY user_profiles_update_policy ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Service role can do anything
CREATE POLICY service_role_policy ON user_profiles
    USING (auth.role() = 'service_role');
```

### 2. subscriptions RLS

```sql
-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscriptions
CREATE POLICY subscriptions_select_policy ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Service role can do anything
CREATE POLICY service_role_policy ON subscriptions
    USING (auth.role() = 'service_role');
```

### 3. reading_history RLS

```sql
-- Enable RLS
ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;

-- Users can read their own reading history
CREATE POLICY reading_history_select_policy ON reading_history
    FOR SELECT USING (auth.uid() = user_id);

-- Service role can do anything
CREATE POLICY service_role_policy ON reading_history
    USING (auth.role() = 'service_role');
```

## Entity Relationship Diagram (ERD)

```
┌─────────────────┐       ┌───────────────────┐
│                 │       │                   │
│  user_profiles  │◀──────│   subscriptions   │
│                 │       │                   │
└────────┬────────┘       └───────────────────┘
         │
         │
         │
         │
┌────────▼────────┐       ┌───────────────────┐
│                 │       │                   │
│ reading_history │──────▶│     feedback      │
│                 │       │                   │
└────────┬────────┘       └───────────────────┘
         │
         │
         │
         │
┌────────▼────────┐
│                 │
│    api_usage    │
│                 │
└─────────────────┘
```

## Database Migrations

Database migrations are managed through Supabase's migration system. Migration files are stored in the `supabase/migrations` directory and are applied automatically during deployment.

## Conclusion

This database schema provides a solid foundation for the MYSTICBALLS application. It supports user authentication, subscription management, reading history, and usage tracking. The schema is designed to be scalable and maintainable, with appropriate indexes and relationships to ensure good performance.