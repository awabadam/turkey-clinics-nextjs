# Turkey Clinics Guide: Next.js + Supabase Migration Design

## Overview

Migrate the dental clinic directory from Vite + Express + custom auth + local storage to Next.js App Router + Supabase (Auth, Storage, hosted PostgreSQL) + Vercel deployment. Prisma stays as the data access layer.

## Current State

| Layer | Current | Target |
|---|---|---|
| Frontend | React 19 + Vite + TanStack Router | Next.js App Router |
| Backend | Express.js (8 route files) | Next.js Route Handlers |
| Database | Self-hosted PostgreSQL + Prisma | Supabase PostgreSQL + Prisma |
| Auth | Custom JWT (bcrypt, localStorage) | Supabase Auth |
| File Storage | Multer + Sharp + local disk | Supabase Storage |
| Deployment | Docker Compose | Vercel |

## Prisma Schema Changes

The schema stays almost identical. Two changes:

1. **Remove `password` field from `User` model** — Supabase Auth manages credentials. The User table becomes a profiles table linked to `auth.users` via Supabase Auth ID.

2. **Change `id` on User to use Supabase Auth UUID**:
```prisma
model User {
  id            String    @id  // Supabase Auth UUID, no longer cuid()
  email         String    @unique
  // password field removed
  name          String?
  role          UserRole  @default(USER)
  ...
}
```

All other models (Clinic, Review, Booking, Procedure, Favorite, ClinicView) remain unchanged. Foreign keys to User still work since the ID is still a string.

## Authentication

### Supabase Auth Setup

- Email/password sign-up and login via `@supabase/ssr`
- Server-side session validation in middleware and Route Handlers
- No more JWT generation, bcrypt, or localStorage token management

### Auth Flow

1. **Sign up**: Supabase creates `auth.users` row → after-signup hook creates matching `User` row in Prisma with the Supabase UUID as ID
2. **Login**: Supabase handles credential check → sets HTTP-only cookie → middleware reads session
3. **Route protection**: `middleware.ts` checks Supabase session. For role-based access (ADMIN, CLINIC_OWNER), read role from Prisma `User` table.

### Role Mapping

Current roles stay the same: `USER`, `ADMIN`, `CLINIC_OWNER`. Stored in the Prisma `User` table (not Supabase user metadata) because Prisma is the data layer for all business logic.

Helper function pattern for Route Handlers:
```typescript
async function getAuthUser(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return prisma.user.findUnique({ where: { id: user.id } })
}
```

### What Gets Deleted

- `backend/src/lib/auth.ts` (JWT generation/verification)
- `backend/src/middleware/auth.ts` (Bearer token middleware)
- `backend/src/routes/auth.ts` (register, login, password change endpoints)
- `frontend/src/lib/auth.tsx` (AuthContext, localStorage token management)
- `bcryptjs`, `jsonwebtoken` dependencies

## File Storage

### Supabase Storage Setup

- Create a `clinic-images` bucket (public, 5MB limit, image types only)
- Upload via Supabase Storage client in API routes
- Sharp processing happens before upload (resize, optimize)

### Upload Flow

1. Client sends FormData to `/api/upload`
2. Route Handler receives file, processes with Sharp
3. Uploads processed buffer to Supabase Storage
4. Returns public URL from Supabase

### What Gets Deleted

- `backend/src/routes/upload.ts` (Multer setup)
- `backend/src/services/storage.ts` (local disk storage)
- `multer` dependency
- `public/uploads/` directory
- Docker volume mounts for uploads

## Project Structure

```
Turkey-clinics-guide/
├── app/
│   ├── layout.tsx                    # Root layout (providers, nav, footer)
│   ├── page.tsx                      # Home / clinic listing
│   ├── clinics/
│   │   └── [slug]/
│   │       └── page.tsx              # Clinic detail page
│   ├── compare/
│   │   └── page.tsx                  # Clinic comparison
│   ├── login/
│   │   └── page.tsx                  # Login form
│   ├── register/
│   │   └── page.tsx                  # Register form
│   ├── favorites/
│   │   └── page.tsx                  # User favorites (protected)
│   ├── account/
│   │   ├── layout.tsx                # Account layout (protected)
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   └── bookings/
│   │       └── page.tsx
│   ├── clinic-registration/
│   │   └── page.tsx                  # Clinic owner signup
│   ├── clinic-portal/
│   │   ├── layout.tsx                # Clinic owner layout (CLINIC_OWNER only)
│   │   └── manage/
│   │       └── page.tsx
│   ├── admin/
│   │   ├── layout.tsx                # Admin layout (ADMIN only)
│   │   ├── page.tsx                  # Dashboard
│   │   ├── clinics/
│   │   │   └── page.tsx
│   │   ├── clinic-requests/
│   │   │   └── page.tsx
│   │   ├── bookings/
│   │   │   └── page.tsx
│   │   ├── reviews/
│   │   │   └── page.tsx
│   │   ├── procedures/
│   │   │   └── page.tsx
│   │   └── analytics/
│   │       └── page.tsx
│   ├── auth/
│   │   ├── callback/
│   │   │   └── route.ts              # Supabase Auth callback handler
│   │   └── confirm/
│   │       └── route.ts              # Email confirmation handler
│   └── api/
│       ├── clinics/
│       │   ├── route.ts              # GET (list), POST (create)
│       │   └── [id]/
│       │       └── route.ts          # GET, PUT, DELETE single clinic
│       ├── bookings/
│       │   ├── route.ts              # GET (list), POST (create)
│       │   └── [id]/
│       │       └── route.ts          # GET, PUT (status update)
│       ├── reviews/
│       │   ├── route.ts              # GET, POST
│       │   └── [id]/
│       │       └── route.ts          # PUT, DELETE
│       ├── procedures/
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       ├── favorites/
│       │   └── route.ts              # GET, POST, DELETE
│       ├── analytics/
│       │   └── route.ts              # GET
│       └── upload/
│           └── route.ts              # POST (Supabase Storage)
├── components/
│   ├── ui/                           # shadcn/ui (copy as-is)
│   ├── clinic/                       # Clinic cards, detail, etc.
│   ├── admin/                        # Admin panel components
│   ├── account/                      # User account components
│   ├── search/                       # Search & filter components
│   ├── navigation/                   # Nav, header, footer
│   └── luxury/                       # Premium styling components
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Browser Supabase client
│   │   ├── server.ts                 # Server Supabase client (cookies)
│   │   └── middleware.ts             # Supabase session refresh
│   ├── prisma.ts                     # Prisma client singleton
│   └── utils.ts                      # cn() and helpers
├── hooks/                            # Custom React hooks (port from frontend/src/hooks/)
├── schemas/                          # Zod schemas (merge backend + frontend)
├── middleware.ts                     # Next.js middleware (auth + role guards)
├── prisma/
│   ├── schema.prisma                 # Modified schema (no password field)
│   └── seed.ts                       # Seed script (updated for Supabase Auth)
├── next.config.ts
├── tailwind.config.ts                # Port from frontend
├── components.json                   # shadcn config
├── package.json
└── .env.local                        # Supabase + DB credentials
```

## Route Handler Migration

Each Express route file maps to a Next.js Route Handler. Pattern:

**Express (before):**
```typescript
router.get('/', async (req, res) => {
  const clinics = await prisma.clinic.findMany()
  res.json(clinics)
})
```

**Next.js Route Handler (after):**
```typescript
export async function GET() {
  const clinics = await prisma.clinic.findMany()
  return Response.json(clinics)
}
```

### Route Mapping

| Express Route | Next.js Route Handler |
|---|---|
| `GET /api/clinics` | `app/api/clinics/route.ts` → `GET` |
| `POST /api/clinics` | `app/api/clinics/route.ts` → `POST` |
| `GET /api/clinics/:id` | `app/api/clinics/[id]/route.ts` → `GET` |
| `PUT /api/clinics/:id` | `app/api/clinics/[id]/route.ts` → `PUT` |
| `DELETE /api/clinics/:id` | `app/api/clinics/[id]/route.ts` → `DELETE` |
| `GET /api/bookings` | `app/api/bookings/route.ts` → `GET` |
| `POST /api/bookings` | `app/api/bookings/route.ts` → `POST` |
| `PUT /api/bookings/:id` | `app/api/bookings/[id]/route.ts` → `PUT` |
| `GET /api/reviews` | `app/api/reviews/route.ts` → `GET` |
| `POST /api/reviews` | `app/api/reviews/route.ts` → `POST` |
| `PUT /api/reviews/:id` | `app/api/reviews/[id]/route.ts` → `PUT` |
| `DELETE /api/reviews/:id` | `app/api/reviews/[id]/route.ts` → `DELETE` |
| `GET /api/procedures` | `app/api/procedures/route.ts` → `GET` |
| `POST /api/procedures` | `app/api/procedures/route.ts` → `POST` |
| `PUT /api/procedures/:id` | `app/api/procedures/[id]/route.ts` → `PUT` |
| `DELETE /api/procedures/:id` | `app/api/procedures/[id]/route.ts` → `DELETE` |
| `GET /api/favorites` | `app/api/favorites/route.ts` → `GET` |
| `POST /api/favorites` | `app/api/favorites/route.ts` → `POST` |
| `DELETE /api/favorites` | `app/api/favorites/route.ts` → `DELETE` |
| `GET /api/analytics` | `app/api/analytics/route.ts` → `GET` |
| `POST /api/upload` | `app/api/upload/route.ts` → `POST` |

### Auth in Route Handlers

Replace Express middleware pattern:

```typescript
// Before: Express middleware chain
router.get('/', authMiddleware, adminMiddleware, handler)

// After: inline in Route Handler
export async function GET() {
  const user = await getAuthUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role !== 'ADMIN') return Response.json({ error: 'Forbidden' }, { status: 403 })
  // ... handler logic
}
```

## Frontend Migration

### Component Porting Strategy

Most components copy directly with minor changes:

1. **shadcn/ui components** (`components/ui/`) — copy as-is, zero changes
2. **Feature components** (`clinic/`, `admin/`, `search/`, etc.) — copy, then:
   - Replace `import { api } from '@/lib/api'` with direct `fetch('/api/...')` or keep React Query with updated fetchers
   - Replace `useAuth()` hook with Supabase auth hook
   - Replace TanStack Router `Link` with Next.js `Link`
   - Replace `useNavigate()` with `useRouter()` from `next/navigation`
3. **Layout components** — restructure into Next.js layout files

### Key Import Changes

| Old Import | New Import |
|---|---|
| `import { Link } from '@tanstack/react-router'` | `import Link from 'next/link'` |
| `import { useNavigate } from '@tanstack/react-router'` | `import { useRouter } from 'next/navigation'` |
| `import { useAuth } from '@/lib/auth'` | `import { useAuth } from '@/hooks/use-auth'` (Supabase-based) |
| `navigate({ to: '/path' })` | `router.push('/path')` |

### React Query

Keep React Query for client-side data fetching. Update the API client:

```typescript
// lib/api.ts (simplified - no more token management)
export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || 'Request failed')
  }
  return response.json()
}
```

No more Bearer tokens — Supabase Auth cookies are sent automatically.

## Middleware

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Refresh Supabase auth session
  let response = NextResponse.next({ request })
  const supabase = createServerClient(/* env vars, cookie config */)
  const { data: { user } } = await supabase.auth.getUser()

  // Protected route patterns
  const protectedPaths = ['/account', '/favorites', '/clinic-portal', '/admin']
  const isProtected = protectedPaths.some(p => request.nextUrl.pathname.startsWith(p))

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/account/:path*', '/favorites', '/clinic-portal/:path*', '/admin/:path*']
}
```

Role-based access (ADMIN, CLINIC_OWNER) is checked in the layout components and Route Handlers, not middleware, since middleware can't query Prisma.

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# Optional
GOOGLE_MAPS_API_KEY=...
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=...
ADMIN_EMAIL=...
```

## Dependencies

### Add
- `next` — framework
- `@supabase/supabase-js` — Supabase client
- `@supabase/ssr` — server-side auth with cookies
- `sharp` — stays for image processing
- `@prisma/client` — stays
- All existing frontend deps (shadcn, radix, react-query, tailwind, framer-motion, etc.)

### Remove
- `express`, `cors`, `express-rate-limit` — replaced by Next.js
- `bcryptjs` — replaced by Supabase Auth
- `jsonwebtoken` — replaced by Supabase Auth
- `multer` — replaced by Supabase Storage
- `nodemailer` — can stay if email notifications are needed
- `dotenv` — Next.js handles env natively
- `@tanstack/react-router`, `@tanstack/router-plugin` — replaced by Next.js App Router
- `vite`, `@vitejs/plugin-react` — replaced by Next.js
- `concurrently` — single dev server now

## Deployment

### Vercel Setup
- Connect GitHub repo
- Framework preset: Next.js (auto-detected)
- Set environment variables in Vercel dashboard
- Prisma generates at build time via `postinstall` script

### Supabase Setup
- Create project at supabase.com
- Get project URL + anon key
- Get database connection string (use pooler/transaction mode for serverless)
- Create `clinic-images` storage bucket
- Run `npx prisma db push` to create tables

### package.json scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "postinstall": "prisma generate",
    "db:push": "prisma db push",
    "db:seed": "tsx prisma/seed.ts"
  }
}
```

## What Gets Deleted

- `backend/` directory (entire Express app)
- `frontend/` directory (entire Vite app)
- `docker/` directory (Docker Compose, Dockerfiles, nginx.conf)
- `render.yaml` (no longer deploying to Render)
- Root `package.json` workspace scripts

## Migration Order

1. Scaffold Next.js project at repo root
2. Set up Supabase clients (browser + server)
3. Update Prisma schema (remove password), connect to Supabase DB
4. Port shadcn/ui components and Tailwind config
5. Build auth pages (login, register) with Supabase Auth
6. Build middleware for route protection
7. Port API routes (Express → Route Handlers)
8. Port pages (TanStack Router → App Router), one section at a time:
   - Public pages (home, clinic detail, compare)
   - Auth-protected pages (account, favorites)
   - Clinic owner pages (portal, management)
   - Admin pages (dashboard, management panels)
9. Set up Supabase Storage for uploads
10. Deploy to Vercel
11. Delete old directories (backend/, frontend/, docker/)
