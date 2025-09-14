# Authentication Examples

This document provides example GraphQL queries and mutations for testing the authentication flow.

## Login Mutation

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

## Me Query

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

## Refresh Tokens Mutation

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

## Logout Mutation

```graphql
mutation Logout {
  logout
}
```

Headers:
```
Authorization: Bearer <accessToken>
```

## Testing Flow

1. Call the `login` mutation with valid credentials to get an access token and refresh token.
2. Call the `me` query with the access token to get the current user's information.
3. Call the `refreshTokens` mutation with the refresh token to get a new access token and refresh token.
4. Call the `me` query with the new access token to verify it works.
5. Call the `logout` mutation with the access token to revoke the refresh token.
6. Call the `me` query with the access token to verify it still works until it expires.
7. After the access token expires, call the `refreshTokens` mutation with the revoked refresh token to verify it fails.

## cURL Examples

### Login

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation Login($input: LoginInput!) { login(input: $input) { accessToken refreshToken user { id email name role createdAt } } }", "variables":{"input":{"email":"admin@example.com","password":"adminpassword"}}}' \
  http://localhost:4001/graphql
```

### Me

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{"query":"query Me { me { id email name role createdAt } }"}' \
  http://localhost:4001/graphql
```

### Refresh Tokens

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation RefreshTokens($refreshToken: String!) { refreshTokens(refreshToken: $refreshToken) { accessToken refreshToken } }", "variables":{"refreshToken":"<refreshToken>"}}' \
  http://localhost:4001/graphql
```

### Logout

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{"query":"mutation Logout { logout }"}' \
  http://localhost:4001/graphql
```
