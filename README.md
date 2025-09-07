# Untitled Monorepo

This repository is a TypeScript monorepo containing a NestJS backend and a Vite + React client. Below is the current project structure and quick notes to get you oriented.

## Project Structure

```
.
├─ README.md
├─ docker-compose.yml
├─ eslint.config.js
├─ package.json
├─ package-lock.json
├─ pnpm-workspace.yaml
├─ public/
├─ server/
├─ shared-types/
│  └─ ...
├─ src/
│  └─ ...
├─ tools/
│  └─ ...
├─ tsconfig.base.json
├─ tsconfig.json
├─ bff/
│  └─ ... (placeholder)
├─ client/
│  └─ ... (placeholder)
└─ backend/
   ├─ package.json
   ├─ prisma/
   │  ├─ schema.prisma
   │  └─ dev.db (created after prisma migrate/generate on SQLite)
   └─ src/
      ├─ main.ts
      ├─ app.module.ts
      ├─ common/
      │  └─ prisma.service.ts
      └─ modules/
         ├─ health/
         │  └─ health.controller.ts, health.module.ts
         ├─ auth/
         │  ├─ auth.module.ts
         │  └─ auth.resolver.ts
         └─ users/
            ├─ users.module.ts
            ├─ users.service.ts
            ├─ users.controller.ts
            ├─ users.resolver.ts
            └─ models/
               └─ user.model.ts
```

Notes:
- Backend uses NestJS with GraphQL (code-first) and Prisma (SQLite in dev via prisma/schema.prisma).
- GraphQL endpoint: http://localhost:4001/graphql (when backend is running).
- REST endpoints: GET /health, GET /users, GET /users/:id.

## Quickstart

Backend (NestJS + Prisma):
- cd backend
- npm install
- npx prisma generate
- npx prisma migrate dev --name init
- npm run dev
- Local URL: http://localhost:4001 (GraphQL Playground: http://localhost:4001/graphql)

Frontend (Vite + React):
- cd client
- npm install
- npm run dev
- Local URL: http://localhost:5173

Notes:
- Ensure backend is running so the frontend can communicate with it.
- Do not commit .env files or secrets. .gitignore is configured accordingly.
