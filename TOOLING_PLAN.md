# Tooling Plan and Current Commands

## Current Project Structure

The project is structured as a monorepo with the following packages:

- **backend**: NestJS application with GraphQL, using Prisma with PostgreSQL and JWT auth
- **client**: React 18 application with TypeScript, Vite, and Tailwind CSS

## Current Commands

### Root Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Starts the backend development server |
| `npm run build` | Builds the backend |
| `npm run migrate` | Runs Prisma migrations |
| `npm run seed` | Seeds the database |
| `npm run client:dev` | Starts the client development server |
| `npm run client:build` | Builds the client |

### Backend Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Starts the NestJS application in watch mode |
| `npm run build` | Builds the NestJS application |
| `npm run start:prod` | Runs the built application |
| `npm run prisma:migrate` | Runs Prisma migrations |
| `npm run prisma:generate` | Generates Prisma client |
| `npm run prisma:seed` | Seeds the database |
| `npm run test` | Runs Jest tests |

### Client Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Starts the Vite development server |
| `npm run build` | Builds the client application |
| `npm run preview` | Previews the built application |

## Current Configuration

### TypeScript

- **Root**: Has a base tsconfig.json and tsconfig.base.json
- **Backend**: Extends from the root tsconfig.base.json
- **Client**: Has its own tsconfig.json (not extending from the base)

### ESLint and Prettier

- **ESLint**: Using flat config (eslint.config.js) at the root level
- **Prettier**: Configuration at the root level (.prettierrc)

## Refactoring Plan

### Phase 1: Verify npm workspaces

- Confirm workspaces configuration in root package.json
- Ensure existing scripts remain intact
- Test installation and verify existing commands still work

### Phase 2: Root script passthrough

- Add root scripts that proxy to each package
- Ensure Windows compatibility
- Test that both root and package-level scripts work

### Phase 3: Centralize TypeScript configuration

- Update base tsconfig at the root
- Ensure backend tsconfig extends from the base
- Update client tsconfig to extend from the base
- Fix any errors from strict mode with minimal changes

### Phase 4: Unify linting and formatting

- Consolidate ESLint configuration
- Configure Prettier
- Add root scripts for linting and formatting

### Phase 5: Improve developer experience

- Add structured logging
- Create bootstrap script
- Update documentation
