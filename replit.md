# GLORY Sports Summit Beta - Mobile Networking App

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

## User Preferences
Preferred communication style: Simple, everyday language.