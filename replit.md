# SkillTracker - Student Skill Management Platform

## Overview

SkillTracker is a comprehensive web application designed for students to track their learning journey, discover opportunities, and compete with peers. The platform allows users to manage their skills portfolio, receive personalized recommendations, participate in challenges, and view leaderboards. Built with modern web technologies, it features a React-based frontend with a Node.js/Express backend and PostgreSQL database.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: TailwindCSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Build Tool**: Vite for development and bundling
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Style**: RESTful API endpoints
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage

### Database Architecture
- **Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM with schema-first approach
- **Schema Location**: `shared/schema.ts` for type-safe database operations
- **Migrations**: Drizzle Kit for database migrations

## Key Components

### Authentication System
- **Provider**: Replit Auth with OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions table (mandatory for Replit Auth)
- **User Management**: Centralized user storage with profile management
- **Authorization**: Role-based access control with admin functionality

### Core Entities
1. **Users**: Profile management with college, course, and graduation details
2. **Skills**: User skills with categories, levels, and progress tracking
3. **Badges**: Achievement system for user accomplishments
4. **Recommendations**: Personalized course, internship, and event suggestions
5. **Challenges**: Time-based skill challenges with progress tracking
6. **Leaderboards**: Competitive ranking system

### UI Components
- **shadcn/ui**: Comprehensive component library with dark mode support
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Interactive Elements**: Forms, dialogs, cards, and navigation components
- **State Feedback**: Toast notifications and loading states

## Data Flow

### User Journey
1. **Authentication**: Users authenticate via Replit Auth
2. **Profile Setup**: Complete profile with academic information
3. **Skill Management**: Add, update, and track skill progress
4. **Recommendations**: Receive personalized learning opportunities
5. **Challenges**: Participate in time-based skill challenges
6. **Competition**: View leaderboard rankings

### API Communication
- **Authentication Flow**: Session-based authentication with middleware protection
- **Data Fetching**: TanStack Query for caching and synchronization
- **Error Handling**: Centralized error handling with user feedback
- **Real-time Updates**: Optimistic updates with server reconciliation

## External Dependencies

### Core Libraries
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui**: Headless UI components
- **react-hook-form**: Form state management
- **zod**: Runtime type validation

### Development Tools
- **Vite**: Build tool with HMR and optimization
- **TypeScript**: Static type checking
- **TailwindCSS**: Utility-first styling
- **ESBuild**: Fast JavaScript bundling

### Authentication
- **passport**: Authentication middleware
- **openid-client**: OpenID Connect implementation
- **connect-pg-simple**: PostgreSQL session store

## Deployment Strategy

### Environment Configuration
- **Development**: Local development with Vite dev server
- **Production**: Built static assets served by Express
- **Database**: Neon PostgreSQL with environment-based connection strings
- **Sessions**: PostgreSQL-backed session storage

### Build Process
1. **Frontend Build**: Vite builds React app to `dist/public`
2. **Backend Build**: ESBuild bundles server code to `dist/index.js`
3. **Static Serving**: Express serves built frontend assets
4. **Database**: Drizzle migrations applied via `npm run db:push`

### Replit Integration
- **Auto-deployment**: Configured for Replit's autoscale deployment
- **Port Configuration**: Server runs on port 5000, exposed as port 80
- **Module Dependencies**: Node.js 20, Web, and PostgreSQL 16 modules

## Recent Changes

### June 16, 2025 - Job Role-Based Personalized System
- ✅ Implemented job role preference system in user profiles
- ✅ Created personalized coding challenges based on user skill level and job role
- ✅ Enhanced recommendation engine to prioritize job role matching
- ✅ Added weekly coding challenge feature with submission tracking
- ✅ Limited recommendations to 6 most relevant items to avoid overwhelming users
- ✅ Built coding challenge leaderboard with point system
- ✅ Added comprehensive profile form with job role selection
- ✅ Implemented smart difficulty detection for coding challenges

### Technical Improvements
- Job role-based recommendation algorithm with scoring system
- Personalized coding challenge API endpoints
- Coding submission tracking with status and feedback
- Enhanced database schema with job roles and coding challenges
- Improved user experience with focused, relevant content delivery

## Changelog

```
Changelog:
- June 16, 2025. Initial setup
- June 16, 2025. Complete feature implementation with skill-based recommendations
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```