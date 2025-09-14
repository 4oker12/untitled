# Authentication System Implementation

## Overview

This document provides instructions for running and testing the authentication system implemented in the NestJS + GraphQL + Prisma application.

## Features Implemented

- Email/password authentication with JWT access and refresh tokens
- GraphQL operations for login, me, refreshTokens, and logout
- Token rotation on refresh for enhanced security
- Argon2 hashing for passwords and refresh tokens
- Input validation for email and password
- Proper error handling for invalid credentials and expired tokens

## Environment Variables

The following environment variables are used by the authentication system:

```
JWT_ACCESS_SECRET="secure_jwt_secret_for_access_tokens"
JWT_SECRET="secure_jwt_secret_for_access_tokens" # Kept for backward compatibility
JWT_REFRESH_SECRET="secure_jwt_secret_for_refresh_tokens"
```

These are already set up in the `.env` file.

## Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Generate Prisma client:
   ```bash
   cd backend
   npx prisma generate
   ```

3. Build the backend:
   ```bash
   npm run build -w backend
   ```

4. Start the backend:
   ```bash
   npm run start:prod -w backend
   ```

The GraphQL endpoint will be available at: http://localhost:4001/graphql

## Testing the Authentication Flow

You can test the authentication flow using the GraphQL playground or by sending requests directly to the GraphQL endpoint. Example queries and mutations are provided in the `AUTHENTICATION_EXAMPLES.md` file.

### Testing Flow

1. Login with valid credentials to get an access token and refresh token.
2. Use the access token to query the current user's information.
3. Use the refresh token to get a new pair of tokens.
4. Verify the new access token works.
5. Logout to revoke the refresh token.
6. Verify token expiration and revocation.

### Example Test User

The application is seeded with an admin user:
- Email: admin@example.com
- Password: adminpassword

## GraphQL Operations

### Login

```graphql
mutation Login($input: LoginInput!) {
  login(input: $input) {
    accessToken
    refreshToken
    user {
      id
      email
      name
      role
      createdAt
    }
  }
}
```

Variables:
```json
{
  "input": {
    "email": "admin@example.com",
    "password": "adminpassword"
  }
}
```

### Me

```graphql
query Me {
  me {
    id
    email
    name
    role
    createdAt
  }
}
```

Headers:
```
Authorization: Bearer <accessToken>
```

### Refresh Tokens

```graphql
mutation RefreshTokens($refreshToken: String!) {
  refreshTokens(refreshToken: $refreshToken) {
    accessToken
    refreshToken
  }
}
```

Variables:
```json
{
  "refreshToken": "<refreshToken>"
}
```

### Logout

```graphql
mutation Logout {
  logout
}
```

Headers:
```
Authorization: Bearer <accessToken>
```

## Security Considerations

- Access tokens expire after 15 minutes
- Refresh tokens expire after 7 days
- Refresh tokens are rotated on each refresh
- Passwords and refresh tokens are hashed using argon2
- Tokens are never stored in plain text

## Troubleshooting

If you encounter any issues:

1. Check that the environment variables are correctly set in the `.env` file
2. Ensure the database is properly set up and accessible
3. Verify that the JWT tokens are being correctly passed in the Authorization header
4. Check the server logs for any error messages

For more detailed information about the implementation, refer to the `AUTH_CHANGES_SUMMARY.md` file.
