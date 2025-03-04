# Authentication Flow

## Overview

MYSTICBALLS uses Supabase for authentication, providing users with multiple ways to authenticate including email/password and Google OAuth. This document outlines the authentication flows, security considerations, and implementation details.

## Free Readings Model

The application follows a tiered free readings model:

1. **Anonymous Users**: Can access up to 2 free readings without creating an account
2. **Authenticated Users**: Get 3 additional free readings (total of 5) after creating an account
3. **Premium Users**: Get unlimited readings after subscribing to a paid plan

When anonymous users reach their limit, they are prompted to create an account with a message highlighting the benefit of getting 3 more free readings.

## Authentication Methods

### 1. Email/Password Authentication

Users can sign up and log in using their email address and a password.

#### Sign Up Flow

1. User enters email and password in the signup form
2. Frontend validates the input (password strength, email format)
3. Frontend calls Supabase Auth API to create a new user
4. Supabase creates the user and sends a confirmation email
5. User confirms their email by clicking the link
6. User is redirected back to the application and automatically logged in
7. A user profile is created in the database

#### Login Flow

1. User enters email and password in the login form
2. Frontend calls Supabase Auth API to authenticate
3. Supabase validates credentials and returns a JWT token
4. Frontend stores the token in localStorage
5. User is logged in and UI updates to reflect authenticated state

### 2. Google OAuth Authentication

Users can sign up and log in using their Google account.

#### Sign Up/Login Flow

1. User clicks "Continue with Google" button
2. Supabase Auth redirects to Google OAuth consent screen
3. User grants permission to the application
4. Google redirects back to the application with an authorization code
5. Supabase exchanges the code for tokens
6. Supabase creates or retrieves the user account
7. User is logged in and UI updates to reflect authenticated state
8. If it's a new user, a user profile is created in the database

## Authentication Implementation

### Frontend Implementation

The authentication logic is encapsulated in custom hooks:

#### useAuth Hook

```typescript
// src/hooks/useAuth.ts
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { createUserProfile, signInWithEmail, signInWithGoogle, signUpWithEmail } from '../services/supabase';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await signUpWithEmail(email, password);
      return result;
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign up');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithEmail(email, password);
      return result;
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogleProvider = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithGoogle();
      return result;
    } catch (err: any) {
      setError(err.message || 'An error occurred during Google sign in');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await supabase.auth.signOut();
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign out');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    signUp,
    signIn,
    signInWithGoogleProvider,
    signOut,
    loading,
    error
  };
};
```

#### useAuthState Hook

```typescript
// src/hooks/useAuthState.ts
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
};
```

### Supabase Service Implementation

```typescript
// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { PRODUCTION_URL } from '../config/constants';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Get the site URL based on environment
const siteUrl = import.meta.env.DEV ? 'http://localhost:5173' : PRODUCTION_URL;

// Create Supabase client with minimal config
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'x-site-url': siteUrl
    }
  }
});

type Tables = Database['public']['Tables'];
export type UserProfile = Tables['user_profiles']['Row'];

export const signInWithGoogle = async () => {
  try {
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: siteUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });
  } catch (error: unknown) {
    console.error('Google sign in error:', error);
    throw error;
  }
};

export const signUpWithEmail = async (email: string, password: string) => {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        emailRedirectTo: siteUrl,
        data: {
          email: email.trim(),
          email_confirmed: false
        }
      }
    });

    if (error) throw error;

    // Check if user already exists
    if (data?.user?.identities?.length === 0) {
      throw new Error('This email is already registered. Please sign in instead.');
    }

    // Check if email confirmation is required
    if (!data.session) {
      // Return special flag to indicate email confirmation needed
      return { ...data, requiresEmailConfirmation: true };
    }

    return data;
  } catch (error: unknown) {
    console.error('Email sign up error:', error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });

    if (error) throw error;
    return data;
  } catch (error: unknown) {
    console.error('Email sign in error:', error);
    let errorMessage = 'Failed to sign in with email';
    if (error instanceof Error) {
      errorMessage = error.message || errorMessage;
    }
    throw new Error(errorMessage);
  }
};
```

## Authentication Components

### LoginModal Component

```typescript
// src/components/LoginModal.tsx (simplified)
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, signUp, signInWithGoogleProvider, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      onClose();
    } catch (err) {
      // Error is handled by the useAuth hook
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogleProvider();
      onClose();
    } catch (err) {
      // Error is handled by the useAuth hook
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            autoComplete="current-password"
          />
          <button type="submit" disabled={loading}>
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
        <button onClick={handleGoogleSignIn} disabled={loading}>
          Continue with Google
        </button>
        <p>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

export default LoginModal;
```

## Authentication in API Requests

When making requests to protected API endpoints, the Supabase access token is included in the Authorization header:

```typescript
const response = await fetch('/.netlify/functions/getReading', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
  },
  body: JSON.stringify({
    readingType: selectedReadingType?.id,
    userInput: formData,
  }),
});
```

## Token Handling and Security

### Token Storage

Supabase tokens are stored in localStorage by default. This approach is convenient but has security implications:

- Tokens are vulnerable to XSS attacks
- Tokens persist across browser sessions

For enhanced security, consider implementing:
- HttpOnly cookies for token storage
- Shorter token expiration times
- Refresh token rotation

### Token Validation

On the server side (Netlify Functions), tokens are validated using Supabase's authentication API:

```typescript
// netlify/functions/getReading.ts (simplified)
const { data: { user }, error: authError } = await supabase.auth.getUser(
  authHeader.replace('Bearer ', '')
);

if (authError || !user) {
  throw new Error('Unauthorized');
}
```

## User Profile Creation

When a user signs up, a profile is created in the `user_profiles` table:

```typescript
// src/services/supabase.ts
export const createUserProfile = async (userId: string, email: string, displayName?: string): Promise<UserProfile | null> => {
  const profile: Tables['user_profiles']['Insert'] = {
    id: userId,
    email,
    display_name: displayName || null,
    readings_count: 0,
    is_premium: false,
    last_reading_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('user_profiles')
    .insert([profile])
    .select()
    .single();

  if (error) {
    console.error('Error creating user profile:', error);
    return null;
  }

  return data;
};
```

## Password Reset Flow

1. User requests a password reset from the login form
2. Frontend calls Supabase Auth API to send a reset email
3. User receives an email with a reset link
4. User clicks the link and is redirected to a password reset page
5. User enters a new password
6. Supabase updates the user's password
7. User is redirected to the login page

```typescript
// Password reset request
const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/reset-password`,
    });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

// Password update after reset
const updatePassword = async (newPassword: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Password update error:', error);
    throw error;
  }
};
```

## Security Considerations

### 1. HTTPS

All communication with authentication endpoints must use HTTPS to prevent man-in-the-middle attacks.

### 2. Password Requirements

Passwords should meet minimum security requirements:
- At least 8 characters
- Mix of uppercase and lowercase letters
- Include numbers and special characters

### 3. Rate Limiting

Implement rate limiting on authentication endpoints to prevent brute force attacks:
- Limit login attempts per IP address
- Implement exponential backoff for repeated failures
- Consider account lockout after multiple failed attempts

### 4. CSRF Protection

Supabase includes CSRF protection by default, but additional measures can be implemented:
- Use the SameSite cookie attribute
- Implement CSRF tokens for sensitive operations

### 5. Content Security Policy

Implement a strict Content Security Policy to prevent XSS attacks:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; connect-src 'self' https://*.supabase.co;">
```

## Conclusion

The authentication system in MYSTICBALLS provides a secure and user-friendly way for users to create accounts and access the application. By leveraging Supabase Auth, the application benefits from industry-standard security practices while maintaining flexibility for future enhancements.
