# Migration Notes: Fixing Cross-Package Imports

## Summary of Changes

This migration resolves the issue of illegal cross-imports between the backend and client packages. The following changes were made:

1. Removed the stray frontend folder (`backend/client/`) that was causing cross-imports
2. Consolidated GraphQL utility code into a single implementation in `client/src/lib/graphql.ts`
3. Removed the "client" dependency from `backend/package.json`
4. Updated TypeScript configurations to prevent cross-package imports
5. Added ESLint rules to prevent backend from importing client code and vice versa

## Commands to Run

After pulling these changes, run the following commands to ensure everything is working correctly:

```bash
# Install dependencies
npm install

# Build the backend
npm run build -w backend
# or
cd backend && npm run build

# Build the client
npm run build -w client
# or
cd client && npm run build
```

## Environment Variables

No changes were made to environment variables. The client continues to use `VITE_API_URL` to reach the backend GraphQL endpoint.

## Verification Checklist

- [ ] Run `npm install` to ensure all dependencies are installed
- [ ] Run `npm run build -w backend` to verify the backend builds successfully
- [ ] Run `npm run build -w client` to verify the client builds successfully
- [ ] Run ESLint to check for any remaining cross-imports: `npx eslint .`
- [ ] Verify that the GraphQL endpoint works by running both backend and client:
  - Start backend: `npm run dev -w backend`
  - Start client: `npm run dev -w client`
  - Navigate to the client in a browser and verify that GraphQL requests work
- [ ] Check for any remaining cross-imports with grep:
  - In backend: `grep -r "from '.*client" backend/src`
  - In client: `grep -r "from '.*backend" client/src`

## Technical Details

### GraphQL Utility Consolidation

The GraphQL utility code was consolidated into a single implementation in `client/src/lib/graphql.ts`. This file now:

- Uses environment variables for the API URL
- Accepts an `accessToken` parameter instead of importing `getAccessToken` from `api.ts`
- Includes all the functionality from both implementations

### TypeScript Configuration Updates

Both `backend/tsconfig.json` and `client/tsconfig.json` were updated to prevent cross-package imports:

- Added explicit `exclude` entries to prevent importing from the other package
- Set `baseUrl` and `paths` to encourage imports from within each package

### ESLint Rules

Added ESLint rules to prevent cross-imports:

- Used `import-x/no-restricted-paths` to prevent imports between backend and client
- Added helpful error messages explaining that HTTP/GraphQL endpoints should be used instead

These changes ensure a clean separation between the backend and client packages, with communication only happening over the GraphQL HTTP endpoint.
