# API Documentation

## Overview

MYSTICBALLS uses several APIs to provide its functionality. This document outlines the internal API endpoints (Netlify Functions) and external APIs used by the application.

## Netlify Functions

Netlify Functions serve as the backend for MYSTICBALLS, handling authentication, reading generation, and payment processing.

### 1. getReading

Generates a reading based on user input.

**Endpoint:** `/.netlify/functions/getReading`

**Method:** POST

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {supabase_access_token}`

**Request Body:**
```json
{
  "readingType": "tarot",
  "userInput": {
    "question": "What does my future hold?"
  }
}
```

The `userInput` object varies based on the reading type:

- **tarot**: `{ "question": "string" }`
- **numerology**: `{ "fullname": "string", "birthdate": "YYYY-MM-DD" }`
- **astrology**: `{ "birthdate": "YYYY-MM-DD", "birthtime": "HH:MM", "birthplace": "string" }`
- **oracle**: `{ "question": "string" }`
- **runes**: `{ "question": "string" }`
- **iching**: `{ "question": "string" }`
- **angelnumbers**: `{ "number": "string", "name": "string" }`
- **horoscope**: `{ "zodiac": "string" }`
- **dream**: `{ "dream": "string" }`
- **magic8ball**: `{ "question": "string" }`
- **aura**: `{ "feelings": "string" }`
- **pastlife**: `{ "concerns": "string", "feelings": "string" }`

**Response (200 OK):**
```json
{
  "reading": "Your detailed reading text here...",
  "readingsRemaining": 2
}
```

**Response (402 Payment Required):**
```json
{
  "error": "Free trial ended",
  "message": "You have used all your free readings. Please upgrade to continue.",
  "requiresUpgrade": true
}
```

**Response (429 Too Many Requests):**
```json
{
  "error": "Too many requests. Please try again in 1 minute.",
  "retryAfter": 60
}
```

**Error Responses:**
- 400 Bad Request: Missing or invalid parameters
- 401 Unauthorized: Missing or invalid authentication
- 402 Payment Required: Free trial ended
- 429 Too Many Requests: Rate limit exceeded
- 500 Internal Server Error: Server-side error

### 2. create-checkout-session

Creates a Stripe checkout session for subscription payments.

**Endpoint:** `/.netlify/functions/create-checkout-session`

**Method:** POST

**Headers:**
- `Content-Type: application/json`

**Request Body:**
```json
{
  "priceId": "price_1234567890",
  "customerId": "user_id_here"
}
```

**Response (200 OK):**
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

**Error Responses:**
- 400 Bad Request: Missing or invalid parameters
- 500 Internal Server Error: Server-side error

## External APIs

### 1. OpenAI API

Used to generate reading content.

**Base URL:** `https://api.openai.com/v1`

#### Chat Completions

**Endpoint:** `/chat/completions`

**Method:** POST

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {openai_api_key}`
- `OpenAI-Project-Id: {openai_project_id}`

**Request Body:**
```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "You are an experienced tarot reader with deep knowledge of the 78-card deck..."
    },
    {
      "role": "user",
      "content": "Provide a tarot reading for this question: What does my future hold?"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 1000
}
```

**Response:**
```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677858242,
  "model": "gpt-4o",
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "### The Cards Drawn\n\nFor your question about what the future holds, I've drawn three cards..."
      },
      "finish_reason": "stop",
      "index": 0
    }
  ],
  "usage": {
    "prompt_tokens": 55,
    "completion_tokens": 700,
    "total_tokens": 755
  }
}
```

### 2. Supabase API

Used for authentication and database operations.

**Base URL:** `https://{project_id}.supabase.co`

#### Authentication

##### Sign Up

**Endpoint:** `/auth/v1/signup`

**Method:** POST

**Headers:**
- `Content-Type: application/json`
- `apikey: {supabase_anon_key}`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "data": {
    "email_confirmed": false
  }
}
```

**Response:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "app_metadata": {
    "provider": "email"
  },
  "user_metadata": {
    "email_confirmed": false
  },
  "aud": "authenticated",
  "created_at": "2023-01-01T00:00:00Z"
}
```

##### Sign In

**Endpoint:** `/auth/v1/token?grant_type=password`

**Method:** POST

**Headers:**
- `Content-Type: application/json`
- `apikey: {supabase_anon_key}`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "aaaabbbbccccdddd",
  "user": {
    "id": "user_id",
    "email": "user@example.com"
  }
}
```

#### Database Operations

##### Get User Profile

**Endpoint:** `/rest/v1/user_profiles?id=eq.{user_id}`

**Method:** GET

**Headers:**
- `apikey: {supabase_anon_key}`
- `Authorization: Bearer {access_token}`

**Response:**
```json
[
  {
    "id": "user_id",
    "email": "user@example.com",
    "display_name": null,
    "readings_count": 2,
    "is_premium": false,
    "last_reading_date": "2023-01-01T00:00:00Z",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
]
```

##### Update User Profile

**Endpoint:** `/rest/v1/user_profiles?id=eq.{user_id}`

**Method:** PATCH

**Headers:**
- `Content-Type: application/json`
- `apikey: {supabase_anon_key}`
- `Authorization: Bearer {access_token}`

**Request Body:**
```json
{
  "readings_count": 3,
  "last_reading_date": "2023-01-02T00:00:00Z",
  "updated_at": "2023-01-02T00:00:00Z"
}
```

**Response:** 204 No Content

### 3. Stripe API

Used for payment processing.

**Base URL:** `https://api.stripe.com/v1`

#### Create Checkout Session

**Endpoint:** `/checkout/sessions`

**Method:** POST

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {stripe_secret_key}`

**Request Body:**
```json
{
  "payment_method_types": ["card"],
  "line_items": [
    {
      "price": "price_1234567890",
      "quantity": 1
    }
  ],
  "mode": "subscription",
  "success_url": "https://mysticballs.com/success?session_id={CHECKOUT_SESSION_ID}",
  "cancel_url": "https://mysticballs.com/cancel"
}
```

**Response:**
```json
{
  "id": "cs_test_1234567890",
  "object": "checkout.session",
  "url": "https://checkout.stripe.com/pay/cs_test_1234567890",
  "payment_status": "unpaid",
  "status": "open",
  "subscription": null
}
```

## Rate Limiting

The application implements rate limiting to prevent abuse:

1. **IP-based Rate Limiting**: Maximum 5 requests per minute per IP address
2. **User-based Rate Limiting**: Maximum 100 readings per day per user

Rate limit headers are included in API responses:

```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 1609459200
```

## Error Handling

All API endpoints return standardized error responses:

```json
{
  "error": "Error message here",
  "details": "Additional details about the error (optional)"
}
```

HTTP status codes are used appropriately:
- 200: Success
- 400: Bad Request (client error)
- 401: Unauthorized (missing or invalid authentication)
- 402: Payment Required (subscription needed)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (resource doesn't exist)
- 429: Too Many Requests (rate limit exceeded)
- 500: Internal Server Error (server-side error)

## Authentication

Most API endpoints require authentication using a Supabase JWT token:

1. User logs in through Supabase Auth
2. Supabase returns an access token
3. The access token is included in the `Authorization` header of API requests
4. The Netlify function validates the token with Supabase

## Conclusion

This API documentation provides a comprehensive overview of the endpoints used in the MYSTICBALLS application. Developers should refer to this document when working with the API to ensure correct implementation and usage.