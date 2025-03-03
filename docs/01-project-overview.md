# MYSTICBALLS Project Overview

## Introduction

MYSTICBALLS is a web application that provides users with various types of spiritual and mystical readings. The application leverages AI technology (specifically OpenAI's GPT models) to generate personalized readings based on user inputs. The platform offers a range of reading types including Tarot, Numerology, Astrology, Oracle Cards, Runes, I Ching, Angel Numbers, Horoscopes, Dream Analysis, Magic 8 Ball, Aura Reading, and Past Life Reading.

## Core Features

1. **Multiple Reading Types**: The application offers 12 different types of spiritual readings, each with its own unique form and prompt structure.

2. **User Authentication**: Users can sign up and log in using email/password or Google authentication through Supabase.

3. **Freemium Model**: Users get a limited number of free readings before being prompted to subscribe to a premium plan.

4. **Payment Integration**: Integration with Stripe for handling subscription payments.

5. **Responsive Design**: The UI is designed to work well on both desktop and mobile devices.

6. **Dark/Light Mode**: Users can toggle between dark and light themes.

## Technology Stack

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useEffect, custom hooks)

### Backend
- **Authentication & Database**: Supabase
- **Serverless Functions**: Netlify Functions
- **AI Integration**: OpenAI API
- **Payment Processing**: Stripe

### Deployment
- **Hosting**: Netlify
- **CI/CD**: Automated through Netlify's integration with GitHub

## Architecture Overview

The application follows a modern JAMstack architecture:

1. **Static Frontend**: The React application is built and served as static files from Netlify.

2. **Serverless Backend**: Netlify Functions provide the backend API endpoints for operations like generating readings and handling payments.

3. **External Services**: 
   - Supabase for authentication and database
   - OpenAI for generating reading content
   - Stripe for payment processing

## User Flow

1. **Landing Page**: Users arrive at the homepage and see an overview of available reading types.

2. **Reading Selection**: Users select a reading type they're interested in.

3. **Input Form**: Users fill out a form specific to their chosen reading type.

4. **Authentication**: If not logged in, users are prompted to sign in or create an account.

5. **Reading Generation**: The application sends the user's input to the OpenAI API via a Netlify function.

6. **Reading Display**: The generated reading is displayed to the user in a formatted, readable way.

7. **Payment Prompt**: If users have used all their free readings, they're prompted to subscribe to continue.

## Development Workflow

1. **Local Development**: Developers run the application locally using `npm run dev`.

2. **Testing**: Manual testing is performed to ensure functionality works as expected.

3. **Deployment**: Code is pushed to GitHub, which triggers a Netlify build and deployment.

4. **Monitoring**: Application performance and errors are monitored through Netlify's dashboard.

## Future Enhancements

As outlined in the ROADMAP.md file, planned enhancements include:

1. **User Profiles**: Enhanced user profile management
2. **Reading History**: Ability for users to view their past readings
3. **Social Sharing**: Options to share readings on social media
4. **Mobile App**: Native mobile applications for iOS and Android
5. **Additional Reading Types**: Expanding the variety of readings available
6. **Localization**: Support for multiple languages
7. **Advanced Analytics**: Better tracking of user engagement and preferences

## Conclusion

MYSTICBALLS is a modern web application that combines spiritual practices with AI technology to provide users with personalized mystical readings. The application is built with scalability in mind and follows best practices for web development, making it maintainable and extensible for future enhancements.