# 2025 GLORY Sports Summit - Mobile Networking App

## Overview

This is a mobile-first social networking application for the GLORY Sports Summit, designed to connect sports industry professionals. The application enables attendees to network, chat, and collaborate during the summit. Built as a full-stack web application with a React frontend and Express.js backend, it follows a modern TypeScript-based architecture with real-time messaging capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **Build Tool**: Vite for fast development and optimized builds
- **Mobile-First Design**: Responsive design optimized for mobile devices with max-width constraints

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Session Storage**: PostgreSQL-based session storage using connect-pg-simple
- **Development Server**: TSX for TypeScript execution in development

### Project Structure
```
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route-specific page components
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utility functions and configurations
├── server/               # Backend Express application
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Data access layer
│   └── vite.ts          # Development server setup
├── shared/               # Shared TypeScript definitions
│   └── schema.ts         # Database schema and types
└── migrations/           # Database migration files
```

## Key Components

### Database Schema
The application uses four main entities:
- **Users**: Stores user profiles with authentication credentials, display information, and online status
- **Conversations**: Manages private conversations between two users
- **Messages**: Stores individual messages within conversations
- **Connections**: Handles connection requests and relationship status between users

### API Endpoints
- `GET /api/conversations` - Retrieve user's conversations
- `GET /api/conversations/:id/messages` - Get messages for a specific conversation
- `POST /api/messages` - Send a new message
- `POST /api/conversations` - Create or retrieve a conversation between users
- `POST /api/connections` - Create connection requests between users

### User Interface Components
- **Bottom Navigation**: Primary navigation with Network, GE, Profile, and Admin sections
- **Conversation Interface**: Real-time messaging with message history
- **Connection Management**: User discovery and connection request system
- **Profile Management**: User profile display and editing capabilities

## Data Flow

1. **User Authentication**: Currently uses hardcoded user ID (1) for development
2. **Conversation Loading**: Fetches user's conversations on Network page load
3. **Message Exchange**: Real-time message sending and receiving through REST API
4. **Connection Requests**: Users can send and manage connection requests
5. **State Synchronization**: TanStack Query handles caching and synchronization of server state

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives for accessible component foundation
- **Styling**: Tailwind CSS with custom design tokens
- **Icons**: Lucide React for consistent iconography
- **Date Handling**: date-fns for timestamp formatting
- **Validation**: Zod for runtime type validation

### Backend Dependencies
- **Database**: Neon serverless PostgreSQL
- **ORM**: Drizzle ORM with Zod integration for type safety
- **Development**: tsx for TypeScript execution, esbuild for production builds

### Development Tools
- **Type Checking**: TypeScript with strict configuration
- **Build System**: Vite with React plugin and development optimizations
- **Code Quality**: ESLint integration through Vite

## Deployment Strategy

### Development Environment
- **Frontend**: Vite development server with HMR
- **Backend**: Express server with tsx for TypeScript execution
- **Database**: PostgreSQL connection via DATABASE_URL environment variable
- **Asset Serving**: Vite middleware for static assets in development

### Production Build
- **Frontend**: Vite build outputs to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Deployment**: Single Node.js process serving both frontend and API
- **Database**: Drizzle migrations for schema management

### Environment Configuration
- **NODE_ENV**: Controls development vs production behavior
- **DATABASE_URL**: PostgreSQL connection string
- **Session Configuration**: PostgreSQL-based session storage

## Changelog
- July 07, 2025: Initial setup
- July 07, 2025: Modified navigation - renamed "Profile" tab to "Program" with calendar icon, created comprehensive program page with GLORY Sports Summit 2025 panel details, added question submission functionality for all 4 panels, implemented backend question storage and API endpoints

## Recent Changes
✓ Transformed Profile tab into Program tab showing GLORY Sports Summit 2025 schedule
✓ Added all 4 panel discussions with detailed speaker bios and panel descriptions
✓ Implemented question submission feature allowing attendees to submit questions for any panel
✓ Added backend question storage with API endpoints for creating and retrieving questions
✓ Fixed DOM nesting warnings in bottom navigation component
✓ Enhanced mobile-first UI with expandable panel details and interactive question forms
✓ Integrated speaker photo system with professional fallback avatars using initials and color coding
✓ Created photo directory structure and documentation for easy photo management
✓ Enhanced speaker cards with responsive image displays and professional layout
✓ Reorganized Network page into group chat interface with event attendees list
✓ Implemented real-time group messaging system for summit networking
✓ Added auto-polling for new messages and professional chat interface design
✓ Fixed critical authentication bug where all users appeared as hardcoded user ID 1
✓ Implemented proper user identification system using localStorage for individual user sessions
✓ Added custom event system to ensure new users are immediately redirected to app interface after profile creation
✓ Enhanced authentication flow with reliable user state management and smooth onboarding experience
✓ Implemented automatic GLORY Team role detection for @glory.media email addresses
✓ Fixed uploaded photo display system to properly show user avatars throughout the application
✓ Enhanced role-based badge system with email domain checking for proper team identification
✓ Added panel questions management functionality to admin dashboard with dedicated Questions tab
✓ Implemented question flagging system allowing admins to mark panel questions as answered
✓ Integrated actual speaker photos for Bob Park and Sharon Bollenbach in program tab
✓ Implemented sponsor logos in sponsors tab replacing placeholder SVGs with authentic brand images
✓ Added logos for BOSS, Rabanne, Sutton Place Hotel Toronto, Asahi, Hennessy, Mas+ by Messi, and Rado Switzerland
✓ Fixed critical chat and question submission validation issues preventing user interactions
✓ Created proper schema validation for group chat messages separate from private conversations
✓ Updated question submission to use correct API parameters and current user authentication
✓ Restored functionality for all interactive features in networking and program tabs
✓ Added question deletion functionality to admin panel Questions tab with proper API endpoints
✓ Implemented delete buttons with confirmation dialogs for question management
✓ Enhanced admin question management with complete CRUD operations
✓ Fixed user deletion functionality in admin panel with proper cascade delete handling
✓ Implemented comprehensive user deletion that removes all related data (questions, connections, messages, conversations)
✓ Added proper error handling and logging for admin user management operations
✓ Fixed total attendees count in admin overview tab to show actual database user count instead of hardcoded 342
✓ Connected overview statistics to real analytics summary API for accurate reporting
✓ Updated sponsor panel color scheme to alternating black and dark grey backgrounds
✓ Modified sponsor cards to follow consistent alternating pattern for better visual hierarchy
✓ Enhanced contrast by changing light grey to dark grey (bg-gray-600) for improved readability
✓ Implemented admin-only delete functionality for group chat messages with @glory.media email validation
✓ Removed Popular Pages, Connection Statistics, and Daily Metrics sections from admin panel per user request
✓ Enhanced user engagement tracking to capture posts (group chat messages), comments, and questions
✓ Added activity tracking in server routes for group chat submissions and question submissions
✓ Updated analytics dashboard to show comprehensive user engagement metrics including posts, questions, and connections
✓ Modified user engagement chart to display posts, messages, and questions over time with enhanced visualization
✓ Updated "Panel Discussions" text to "Panel Discussions - Submit Your Questions" for better UX clarity
✓ Centered the "Panel Discussions - Submit Your Questions" heading for improved visual layout
✓ Fixed user profile photo distortion by implementing custom avatar-image-flat CSS class to prevent fisheye/zoom effects
✓ Added question submission confirmation toast notifications with success and error messages
✓ Implemented automatic text field clearing after successful question submission
✓ Fixed analytics data accuracy by correcting SQL date formatting in getAnalyticsSummary function
✓ Replaced Connections metric with Clicks metric to track total user interactions and button clicks
✓ Enhanced click tracking system with comprehensive button interaction monitoring across all app features
✓ Updated admin analytics dashboard to display accurate real-time data with proper metrics
✓ Updated Terms of Use with official July 14th, 2025 legal document from GLORY Media including comprehensive privacy policy, data protection compliance with PIPEDA, and complete Canadian legal framework
✓ Added newsletter and communications consent clause (Section 10) allowing GLORY Media to send newsletters, updates, and promotional communications with unsubscribe options
✓ Fixed user deletion functionality by correcting foreign key constraint issues with proper cascade delete order
✓ Updated all speaker photos in Program panel with new professional headshots including Lance Chung, Marcus Hanson, Ellen Hyslop, Anastasia Bucsis, Diana Matheson, Alyson Walker, Jesse Marsch, Dwayne De Rosario, Kyle McMann, Bob Park, and Andi Petrillo
✓ Updated Network panel with all new professional speaker photos replacing placeholder images
✓ Implemented photo mapping system for consistent speaker image display across event attendees list
✓ Enhanced message avatars and attendee cards to use new professional headshots with fallback system
✓ Added complete speaker photo imports including Teresa Resch, Saroya Tinker, and all 15 professional yellow-background images
✓ Updated Program panel with latest batch of professional speaker photos (13 updated images)
✓ Synchronized Network panel with same latest photo versions for consistency
✓ Enhanced speaker photo quality with newest yellow-background professional headshots
✓ Maintained consistent branding and visual quality across both Program and Network panels
✓ Updated app title from "GLORY Sports Summit Beta" to "2025 GLORY Sports Summit" across all files including HTML title, documentation, and email templates
✓ Implemented secure password authentication system with bcrypt encryption for user login
✓ Added password column to users table with database migration for all existing users
✓ Created authentication endpoints with proper password verification and error handling
✓ Enhanced DatabaseStorage and MemStorage classes with authenticateUser method
✓ Updated login page to use new secure authentication endpoint with proper validation
✓ Tested authentication system with both valid and invalid credentials - working correctly
✓ Implemented LinkedIn OAuth authentication system with LinkedIn passport strategy
✓ Added LinkedIn fields (linkedinId, linkedinHeadline, linkedinProfileUrl, authProvider) to user schema
✓ Created LinkedIn authentication routes with proper OAuth flow and callback handling
✓ Added create-password functionality for LinkedIn users to set passwords after authentication
✓ Integrated LinkedIn sign-in button to login page with proper routing
✓ Added LinkedIn authentication middleware and session management
✓ Database migration completed with LinkedIn fields ready for use
✓ Fixed LinkedIn OAuth callback and session handling to work with current Replit domain
✓ Resolved redirect issues by integrating server-side authentication with frontend state management
✓ Added LinkedIn ID display to user profiles and attendee cards throughout the application
✓ Implemented read-only LinkedIn ID field in profile edit dialogs with sync notification
✓ Enhanced attendee networking with visible LinkedIn information for all users
✓ Completed full LinkedIn Sign-In integration with profile data pulling and account creation
✓ Implemented clickable user names and profile pictures throughout the app that open comprehensive user profile dialogs
✓ Added user profile dialog showing full bio, LinkedIn headline, company info, role badges, and LinkedIn networking button
✓ Enhanced chat messages and attendee cards with hover effects for clickable elements (blue ring for avatars, underline for names)
✓ Replaced email display in user profiles with "Find on LinkedIn" button for better networking focus
✓ Added social sharing functionality to Network tab with LinkedIn, Facebook, and Instagram sharing options
✓ Implemented smart Instagram sharing with text copying to clipboard and toast notifications
✓ Fixed critical hardcoded user ID issue throughout the application preventing proper user authentication
✓ Removed all hardcoded user ID 1 (David King) references from Network, Conversation, and Connection components
✓ Enhanced user authentication flow to properly maintain user sessions for both LinkedIn and password-based login
✓ Fixed Network tab to display correct user profile information based on authenticated user rather than hardcoded fallback
✓ Resolved LinkedIn authentication 404 error by implementing proper password creation flow detection
✓ Fixed profile persistence issue during tab navigation by centralizing user state management in App.tsx
✓ Enhanced authentication system to handle LinkedIn users without passwords by checking hasPassword status
✓ Improved user session management to maintain profile data consistently across all tabs
✓ Enhanced LinkedIn authentication to automatically parse job title and company from LinkedIn headlines
✓ Implemented intelligent headline parsing that extracts professional information using common separators
✓ Updated LinkedIn user profiles to display position and company data with "Find on LinkedIn" buttons for all users
✓ Created admin utility endpoint to update existing LinkedIn users with parsed job title and company information
✓ Added "Find on LinkedIn" buttons to user profile dialogs and suggested connection cards for enhanced networking
✓ Enhanced LinkedIn search functionality to include company information for more accurate profile discovery
✓ Removed LinkedIn sign-in option from login page, keeping only email/password authentication
✓ Created homepage with "Enter Event" and "Sign In" options matching original flow structure
✓ Added back buttons to login and create profile pages for easy navigation
✓ Linked GLORY logo to www.glory.media across all authentication pages with hover effects
✓ Added new Profile tab in bottom navigation for comprehensive user profile management
✓ Implemented profile editing functionality with avatar upload, form validation, and loading states
✓ Created backend PUT endpoint for user profile updates with proper validation and error handling
✓ Removed attendee count display from Network tab frontend while preserving backend tracking functionality
✓ Cleared all user data and messages from database for fresh launch start
✓ Reset all auto-increment sequences to start from ID 1
✓ Cleared browser localStorage to ensure completely clean user sessions
✓ Database now empty and ready for production launch with new users

## User Preferences
Preferred communication style: Simple, everyday language.