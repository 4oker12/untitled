# Authentication Testing Guide

This guide provides steps to verify that the authentication and guards are working correctly for both GraphQL and HTTP endpoints.

## Prerequisites

- The backend server is running
- The frontend client is running (if available)
- You have access to a tool like curl, Postman, or GraphQL Playground

## Test Steps

### 1. Login (REST or GraphQL)

#### REST Login

```bash
curl -X POST http://localhost:4001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}' \
  -v
```

This should return:
- A 200 OK response
- An access token in the response body
- A refresh token in the cookies (check the `Set-Cookie` header)

#### GraphQL Login

```graphql
mutation {
  login(loginInput: {
    email: "user@example.com",
    password: "password123"
  }) {
    accessToken
    user {
      id
      email
      name
      role
    }
  }
}
```

Execute this mutation in GraphQL Playground or using curl:

```bash
curl -X POST http://localhost:4001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { login(loginInput: { email: \"user@example.com\", password: \"password123\" }) { accessToken user { id email name role } } }"}' \
  -v
```

This should return:
- A 200 OK response
- An access token in the response body
- A refresh token in the cookies (check the `Set-Cookie` header)

### 2. Call Protected GraphQL Query with Access Token

After obtaining the access token from the login step, use it to call a protected GraphQL query:

```graphql
query {
  me {
    id
    email
    name
    role
  }
}
```

Execute this query with the access token in the Authorization header:

```bash
curl -X POST http://localhost:4001/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"query": "query { me { id email name role } }"}' \
  --cookie "refresh_token=YOUR_REFRESH_TOKEN" \
  -v
```

This should return:
- A 200 OK response
- The user data in the response body

### 3. Call Another Protected Query/Mutation

Try another protected query or mutation to verify that the authentication is working consistently:

```graphql
query {
  users {
    id
    email
    name
    role
  }
}
```

Execute this query with the access token:

```bash
curl -X POST http://localhost:4001/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"query": "query { users { id email name role } }"}' \
  --cookie "refresh_token=YOUR_REFRESH_TOKEN" \
  -v
```

This should return:
- A 200 OK response
- A list of users in the response body

### 4. Test with Invalid/Expired Token

Try calling a protected query with an invalid or expired token:

```bash
curl -X POST http://localhost:4001/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer INVALID_TOKEN" \
  -d '{"query": "query { me { id email name role } }"}' \
  -v
```

This should return:
- A 401 Unauthorized response or a GraphQL error indicating that the token is invalid

### 5. Test Refresh Token Flow

If your refresh token flow is implemented, test it by:

```bash
curl -X POST http://localhost:4001/auth/refresh \
  -H "Content-Type: application/json" \
  --cookie "refresh_token=YOUR_REFRESH_TOKEN" \
  -v
```

Or with GraphQL:

```graphql
mutation {
  refreshToken {
    accessToken
  }
}
```

```bash
curl -X POST http://localhost:4001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { refreshToken { accessToken } }"}' \
  --cookie "refresh_token=YOUR_REFRESH_TOKEN" \
  -v
```

This should return:
- A 200 OK response
- A new access token in the response body
- Possibly a new refresh token in the cookies

## Verification Checklist

- [ ] Login works and returns access token and refresh token
- [ ] Protected GraphQL queries work with valid access token
- [ ] Protected HTTP endpoints work with valid access token
- [ ] Invalid/expired tokens are properly rejected
- [ ] Refresh token flow works correctly
- [ ] Role-based access control works (if implemented)
- [ ] Rate limiting works (if implemented)

## Troubleshooting

If you encounter issues:

1. Check the server logs for detailed error messages
2. Verify that the request includes the correct headers and cookies
3. Ensure that the token format is correct
4. Check that the token is not expired
5. Verify that the user has the required roles for the requested resource

## Client-Side Integration

If you're using a frontend client, ensure that:

1. The client sends the access token in the Authorization header
2. The client includes credentials in the request (credentials: 'include')
3. The client handles token refresh when the access token expires
