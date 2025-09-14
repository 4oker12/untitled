# Fixes & Issues Log

## Date: 2025-09-11

### Problem
- Admin login was not reflecting new users after logging out and back in.
- Roles and permissions were not synchronized between backend and frontend.
- Database seeding (seed scripts) was unclear and not connected properly.

### Root Cause
- Missing role-based access control (RBAC) logic on the backend.
- Frontend did not refresh the state after login.
- Database migrations were incomplete and seed scripts were not documented.

### Fixes
- Added RBAC middleware on the backend to distinguish between `admin` and `user` roles.
- Updated frontend login flow to re-fetch user roles after authentication.
- Connected seed scripts to `prisma` migrations and documented usage.

### Notes
- Always run `npx prisma migrate dev` before `npx prisma db seed`.
- To test:
  1. Register several new users.
  2. Login as admin → See full user list.
  3. Login as regular user → See only personal dashboard.
