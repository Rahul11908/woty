# 2025 GLORY Sports Summit - Mobile Networking App

## Overview
This project is a mobile-first social networking application for the GLORY Sports Summit, designed to connect sports industry professionals. It enables attendees to network, chat, and collaborate during the summit. The application is a full-stack web application with a React frontend and Express.js backend, built with a modern TypeScript-based architecture and real-time messaging capabilities. Its purpose is to facilitate connections and communication among summit participants, enhancing their event experience and fostering professional relationships within the sports industry.

## User Preferences
Preferred communication style: Simple, everyday language.
Tab functionality summaries: User requested comprehensive 1-2 paragraph summaries for each app tab describing functionality and capabilities (documented in TAB_SUMMARIES.md).

## System Architecture

### Core Design
The application follows a full-stack web architecture with a clear separation between frontend and backend. It leverages TypeScript for type safety across the stack and is optimized for mobile-first responsiveness. Real-time communication is a core feature, facilitating dynamic interactions.

### Frontend
- **Framework**: React 18 with TypeScript
- **State Management**: TanStack Query for server state
- **UI/UX**: Tailwind CSS with shadcn/ui for components, Radix UI for accessibility. Mobile-first design is paramount, ensuring optimal display on handheld devices.
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM for type-safe database interactions
- **Session Management**: PostgreSQL-based session storage

### Key Features
- **User Management**: Authentication (email/password, LinkedIn OAuth), profile management with avatar uploads, and detailed user profiles displaying professional information.
- **Networking**: Connection requests, user discovery, and real-time group chat for summit attendees.
- **Messaging**: Private conversations and real-time message exchange.
- **Program Management**: Display of the summit schedule, panel details, speaker bios, and a system for attendees to submit questions for panels.
- **Admin Dashboard**: Functionality for managing users, questions, and group chat messages, along with analytics for user engagement.

### Data Flow
User authentication, conversation loading, message exchange, and connection requests drive the application's data flow. TanStack Query manages client-side state synchronization with the server.

### Project Structure
The codebase is organized into `client/` (React frontend), `server/` (Express backend), `shared/` (common TypeScript definitions like database schema), and `migrations/` (database schema changes).

## External Dependencies

### Databases & ORMs
- **PostgreSQL**: Primary database for all application data, hosted on Neon serverless for scalability.
- **Drizzle ORM**: Used for type-safe interaction with the PostgreSQL database.

### Frontend Libraries
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **shadcn/ui**: Reusable UI components.
- **Radix UI**: Primitives for building accessible UI components.
- **Lucide React**: Icon library.
- **date-fns**: For date manipulation and formatting.
- **Zod**: For runtime schema validation.

### Backend Libraries
- **Express.js**: Web application framework.
- **connect-pg-simple**: PostgreSQL-based session store.
- **bcrypt**: For password hashing.
- **passport-linkedin-oauth2**: For LinkedIn OAuth authentication.

### Development & Build Tools
- **TypeScript**: Primary language for the entire stack.
- **Vite**: Frontend build tool.
- **tsx**: For running TypeScript files directly in development.
- **esbuild**: For bundling backend code for production.
- **ESLint**: For code quality.

### Integrations
- **LinkedIn OAuth**: For user authentication and pulling professional profile data.
- **GLORY Media assets**: Integration of official GLORY Sports Summit branding, speaker photos, and sponsor logos.