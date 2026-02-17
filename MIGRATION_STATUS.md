# Migration Status: Next.js to Vite + TanStack

## Completed

### Infrastructure
- ✅ Created frontend/backend directory structure
- ✅ Setup Vite frontend with React + TypeScript
- ✅ Installed TanStack Router, Query, Form, Table
- ✅ Setup Express backend with TypeScript
- ✅ Configured Tailwind CSS (copied config)
- ✅ Copied UI components from src/components/ui
- ✅ Setup Prisma (shared between frontend/backend)

### Authentication
- ✅ Created JWT authentication backend (`backend/src/routes/auth.ts`)
- ✅ Created auth middleware (`backend/src/lib/auth.ts`)
- ✅ Created auth context/provider (`frontend/src/lib/auth.tsx`)
- ✅ Created login route (`frontend/src/routes/login.tsx`)
- ✅ Updated server.ts to use auth routes

### Basic Setup
- ✅ Created root route (`frontend/src/routes/__root.tsx`)
- ✅ Created home route (`frontend/src/routes/index.tsx`)
- ✅ Created API client (`frontend/src/lib/api.ts`)
- ✅ Created utility functions (`frontend/src/lib/utils.ts`)
- ✅ Created package.json for monorepo root

## Remaining Work

### Backend API Routes (Todo #9)
Need to migrate from `src/app/api/` to `backend/src/routes/`:
- [ ] clinics.ts (GET, POST)
- [ ] clinics/:id.ts (GET, PUT, DELETE)
- [ ] clinics/slug/:slug.ts (GET)
- [ ] reviews.ts (GET, POST)
- [ ] bookings.ts (POST)
- [ ] bookings/:id.ts (PUT)
- [ ] favorites.ts (GET, POST, DELETE)
- [ ] upload.ts (POST - multer)
- [ ] analytics.ts (GET)
- [ ] procedures.ts (GET, POST)
- [ ] procedures/:id.ts (PUT, DELETE)

### Frontend Routes (Todos #5-8)
- [ ] Home/clinic listing page (`/`) - with filters
- [ ] Clinic detail page (`/clinics/$slug`)
- [ ] Favorites page (`/favorites`)
- [ ] Compare page (`/compare`)
- [ ] Account pages (`/account`, `/account/bookings`)
- [ ] Admin routes (`/admin/*`)

### Frontend Components Migration
- [ ] Navigation components (MainNav, UserMenu)
- [ ] Clinic components (ClinicList, ClinicDetail, etc.)
- [ ] Search/Filter components (AdvancedFilters)
- [ ] Admin components (ClinicForm, etc.)
- [ ] Update imports from Next.js to TanStack Router

### TanStack Query Hooks
- [ ] useClinics() hook
- [ ] useClinic() hook
- [ ] useFavorites() hook
- [ ] useBookings() hook
- [ ] useReviews() hook
- [ ] useAnalytics() hook

### Docker Configuration (Todo #10)
- [ ] Create Dockerfile.frontend
- [ ] Create Dockerfile.backend
- [ ] Update docker-compose.yml
- [ ] Update environment variables

### Testing (Todo #11)
- [ ] Test authentication flow
- [ ] Test clinic browsing
- [ ] Test user features
- [ ] Test admin functionality
- [ ] Fix any issues

## Key Changes from Next.js

1. **Routing**: Next.js App Router → TanStack Router (file-based)
2. **API Routes**: Next.js API routes → Express routes
3. **Authentication**: NextAuth.js → JWT tokens
4. **Data Fetching**: Server Components → TanStack Query
5. **Forms**: react-hook-form → TanStack Form (admin forms)
6. **SSR**: Lost SSR/SSG (SPA-only)

## Notes

- Prisma schema is shared and unchanged
- UI components (Shadcn) are mostly compatible (remove "use client" directives)
- Tailwind config is copied and works
- Path aliases (@/*) are configured in both frontend and backend
