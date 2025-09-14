# BFF Layer Removal - Changes Summary

## Overview
This document summarizes the changes made to simplify the architecture by removing the BFF (Backend-For-Frontend) layer and having the client talk directly to the backend's GraphQL endpoint.

## Changes Made

### 1. Removed BFF Layer
- Removed the BFF service from docker-compose.yml
- Added FRONTEND_URL environment variable to the backend service in docker-compose.yml

### 2. Updated Client Configuration
- Verified that the client is already configured to talk directly to the backend's GraphQL endpoint
- The client uses VITE_API_URL environment variable to determine the API URL, with a default of http://localhost:4001
- The GraphQL endpoint is constructed by appending /graphql to this URL

### 3. Updated Scripts
- Updated the "dev" script in the root package.json to start both the backend and client concurrently
- Added the "concurrently" package as a dev dependency to the root package.json

### 4. Updated Documentation
- Updated the README.md file to reflect the new single-endpoint flow
- Added documentation about environment variables
- Added information about running the application in containers

## Environment Variables

### Client
- VITE_API_URL: URL of the backend API (default: http://localhost:4001)

### Backend
- FRONTEND_URL: URL of the frontend for CORS configuration

## Testing Instructions

### Local Development
1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Create a .env file in the backend directory with the required variables (see backend/.env.example)
   - Create a .env file in the client directory with VITE_API_URL=http://localhost:4001 (or use the default)

3. Run database migrations and seed:
   ```bash
   npm run migrate
   npm run seed
   ```

4. Start the application:
   ```bash
   npm run dev
   ```

5. Verify that:
   - The backend starts on port 4001
   - The client starts on port 5173
   - The client can connect to the backend's GraphQL endpoint
   - Authentication works (login, accessing protected resources)
   - GraphQL operations succeed (queries, mutations)

### Docker Containers
1. Set up environment variables:
   - Create a .env file in the root directory with the required variables

2. Start the containers:
   ```bash
   docker-compose up -d
   ```

3. Verify that:
   - The backend container starts and is accessible at http://localhost:4001
   - The GraphQL endpoint is accessible at http://localhost:4001/graphql
   - Authentication works
   - GraphQL operations succeed

## GraphQL Endpoint
- Development: http://localhost:4001/graphql
- Production: <PUBLIC_BACKEND_URL>/graphql

## Tested Scenarios
- Authentication: Login mutation with email/password
- Authenticated Query: Me query with JWT token
- Public Query: Any public query that doesn't require authentication
- Admin Operations: Admin-only queries/mutations with admin JWT token

## Rollback Plan
If issues are encountered, the BFF layer can be re-enabled by:
1. Restoring the BFF service in docker-compose.yml
2. Updating the client's VITE_API_URL to point to the BFF (http://localhost:4000)
3. Reverting the "dev" script in the root package.json
