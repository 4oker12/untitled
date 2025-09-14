# Fullstack App — Admin & User Roles

## Overview
This is a fullstack web application with role-based access:
- **Admin**: can view all users
- **User**: sees only personal dashboard

## Tech Stack
- **Frontend**: React + Vite + TailwindCSS
- **Backend**: NestJS with GraphQL + Prisma + PostgreSQL
- **Auth**: JWT-based authentication
- **Deployment**: Docker (planned)
- **Package Management**: npm workspaces

## Structure
This is a monorepo using npm workspaces with the following structure:
- /client → React frontend app
- /backend → NestJS backend with GraphQL, Prisma, and PostgreSQL

## Available Scripts

### Root Scripts
```bash
# Install all dependencies
npm install

# Development
npm run dev           # Start both client and backend development servers
npm run dev:client    # Start the client development server only
npm run dev:backend   # Start the backend development server only

# Building
npm run build         # Build all workspaces
npm run build:client  # Build only the client
npm run build:backend # Build only the backend

# Starting
npm run start:client  # Start the client in preview mode
npm run start:backend # Start the backend in production mode

# Testing
npm run test          # Run tests across all workspaces

# Code Quality
npm run lint          # Run ESLint on the root
npm run lint:all      # Run ESLint across all workspaces
npm run lint:fix      # Fix ESLint issues in the root
npm run format        # Format code with Prettier in the root
npm run format:check  # Check formatting with Prettier in the root
npm run format:all    # Format code across all workspaces
npm run typecheck     # Run TypeScript type checking in the root
npm run typecheck:all # Run TypeScript type checking across all workspaces

# Database
npm run migrate       # Run Prisma migrations
npm run generate      # Generate Prisma client
npm run seed          # Seed the database
```

## Environment Variables

### Client (.env.development or .env)
```
VITE_API_URL=http://localhost:4001  # URL of the backend API
```

### Backend (.env)
```
DATABASE_URL=<DB_URL>               # PostgreSQL connection string
ADMIN_EMAIL=<ADMIN_EMAIL>           # Admin user email for seeding
ADMIN_PASSWORD=<ADMIN_PASSWORD>     # Admin user password for seeding
JWT_ACCESS_SECRET=<JWT_ACCESS_SECRET> # Secret for JWT access tokens
JWT_SECRET=<JWT_SECRET>             # Secret for JWT tokens
JWT_REFRESH_SECRET=<JWT_REFRESH_SECRET> # Secret for JWT refresh tokens
FRONTEND_URL=<FRONTEND_URL>         # URL of the frontend for CORS
```

## How to Run

### Local Development
```bash
# Install dependencies
npm install

# Backend migrations & seed
npm run migrate
npm run seed

# Start both backend and client with a single command
npm run dev

# Or start them separately
npm run dev:backend
npm run dev:client
```

### Docker Containers
```bash
# Create a .env file in the root directory with required variables
# Start the containers
docker-compose up -d

# The backend will be available at http://localhost:4001
# The GraphQL endpoint will be at http://localhost:4001/graphql
```

## Features
- JWT Authentication
- Role-based Access Control (RBAC)
- Admin Panel for user management
- Seed scripts for demo data
- npm workspace monorepo setup
