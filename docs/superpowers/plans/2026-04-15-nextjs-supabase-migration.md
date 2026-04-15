# Next.js + Supabase Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the Turkey Clinics Guide from Vite + Express + custom JWT auth + local storage to Next.js App Router + Supabase (Auth, Storage, hosted PostgreSQL) + Vercel deployment.

**Architecture:** Fresh Next.js project at repo root replaces `frontend/` and `backend/` directories. Prisma stays as data layer with `DATABASE_URL` pointing to Supabase PostgreSQL. Supabase Auth replaces custom JWT. Supabase Storage replaces local file uploads. Express routes become Next.js Route Handlers.

**Tech Stack:** Next.js 15, React 19, Supabase (Auth + Storage + PostgreSQL), Prisma, shadcn/ui, Tailwind CSS, React Query, Zod, Sharp

**Spec:** `docs/superpowers/specs/2026-04-15-nextjs-supabase-migration-design.md`

---

## File Structure

```
Turkey-clinics-guide/
├── app/
│   ├── layout.tsx                         # Root layout with providers
│   ├── page.tsx                           # Home / clinic listing
│   ├── globals.css                        # Ported from frontend/src/index.css
│   ├── clinics/
│   │   └── [slug]/
│   │       └── page.tsx                   # Clinic detail
│   ├── compare/
│   │   └── page.tsx                       # Clinic comparison
│   ├── login/
│   │   └── page.tsx                       # Supabase Auth login
│   ├── register/
│   │   └── page.tsx                       # Supabase Auth register
│   ├── favorites/
│   │   └── page.tsx                       # User favorites (protected)
│   ├── account/
│   │   ├── layout.tsx                     # Account layout (protected)
│   │   ├── profile/
│   │   │   └── page.tsx                   # Profile editing
│   │   └── bookings/
│   │       └── page.tsx                   # User bookings
│   ├── clinic-registration/
│   │   └── page.tsx                       # Self-service clinic signup
│   ├── clinic-portal/
│   │   ├── layout.tsx                     # Clinic owner layout (CLINIC_OWNER)
│   │   └── manage/
│   │       └── page.tsx                   # Edit clinic details
│   ├── admin/
│   │   ├── layout.tsx                     # Admin layout (ADMIN)
│   │   ├── page.tsx                       # Dashboard
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
│   │   └── callback/
│   │       └── route.ts                   # Supabase Auth callback
│   └── api/
│       ├── clinics/
│       │   ├── route.ts                   # GET list, POST create
│       │   ├── stats/
│       │   │   └── route.ts              # GET stats
│       │   ├── search/
│       │   │   └── route.ts              # GET autocomplete
│       │   ├── my-clinic/
│       │   │   └── route.ts              # GET owner's clinic
│       │   ├── register/
│       │   │   └── route.ts              # POST self-service registration
│       │   ├── slug/
│       │   │   └── [slug]/
│       │   │       └── route.ts          # GET by slug
│       │   ├── [id]/
│       │   │   └── route.ts              # GET, PUT, DELETE single
│       │   └── admin/
│       │       ├── pending/
│       │       │   └── route.ts          # GET pending clinics
│       │       └── [id]/
│       │           ├── approve/
│       │           │   └── route.ts      # PUT approve
│       │           └── reject/
│       │               └── route.ts      # PUT reject
│       ├── bookings/
│       │   ├── route.ts                   # GET, POST
│       │   └── [id]/
│       │       └── route.ts              # PUT status
│       ├── reviews/
│       │   ├── route.ts                   # GET, POST
│       │   └── [id]/
│       │       ├── route.ts              # DELETE
│       │       └── verify/
│       │           └── route.ts          # PUT verify
│       ├── procedures/
│       │   ├── route.ts                   # GET, POST
│       │   └── [id]/
│       │       └── route.ts              # PUT, DELETE
│       ├── favorites/
│       │   └── route.ts                   # GET, POST, DELETE
│       ├── analytics/
│       │   ├── route.ts                   # GET admin analytics
│       │   └── view/
│       │       └── route.ts              # POST record view
│       └── upload/
│           └── route.ts                   # POST upload to Supabase Storage
├── components/                            # Ported from frontend/src/components/
│   ├── ui/                                # shadcn/ui (copy as-is)
│   ├── clinic/
│   ├── admin/
│   ├── account/
│   ├── search/
│   ├── navigation/
│   └── providers.tsx                      # QueryClient + Theme + Auth providers
├── lib/
│   ├── supabase/
│   │   ├── client.ts                      # Browser Supabase client
│   │   ├── server.ts                      # Server Supabase client
│   │   └── middleware.ts                  # Session refresh helper
│   ├── prisma.ts                          # Prisma client singleton
│   ├── auth.ts                            # getAuthUser() helper
│   ├── api.ts                             # Simplified fetch client (no tokens)
│   └── utils.ts                           # cn(), slugify()
├── hooks/
│   ├── use-auth.ts                        # Supabase auth hook
│   ├── use-toast.ts                       # Toast hook (port as-is)
│   └── use-clinics.ts                     # Clinic data hooks (port, update fetcher)
├── schemas/
│   ├── booking.ts                         # Port from backend/src/schemas/
│   ├── review.ts
│   └── clinic-registration.ts
├── middleware.ts                           # Next.js middleware (auth)
├── prisma/
│   ├── schema.prisma                      # Updated (no password field)
│   └── seed.ts                            # Updated for Supabase Auth
├── next.config.ts
├── tailwind.config.ts                     # Ported from frontend/
├── postcss.config.mjs
├── tsconfig.json
├── components.json                        # shadcn config (updated paths)
├── package.json
└── .env.local                             # Supabase credentials
```

---

### Task 1: Scaffold Next.js Project

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `tailwind.config.ts`, `components.json`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`

- [ ] **Step 1: Create a new branch for the migration**

```bash
git checkout -b migration/nextjs-supabase
```

- [ ] **Step 2: Initialize Next.js in a temp directory**

```bash
cd /tmp && npx create-next-app@latest turkey-temp --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --turbopack
```

- [ ] **Step 3: Copy Next.js scaffolding into project root**

Copy from `/tmp/turkey-temp` into the project root: `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `next-env.d.ts`, `app/` directory. Do NOT overwrite `prisma/` or `docs/`.

- [ ] **Step 4: Create `package.json` with all dependencies**

Merge dependencies from both `frontend/package.json` and `backend/package.json`, adding Next.js and Supabase packages. Remove Express, Vite, TanStack Router, Multer, bcryptjs, jsonwebtoken, cors, dotenv:

```json
{
  "name": "turkey-clinic-guide",
  "version": "0.2.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "postinstall": "prisma generate",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "@hookform/resolvers": "^5.2.2",
    "@prisma/client": "^5.19.0",
    "@radix-ui/react-accordion": "^1.2.12",
    "@radix-ui/react-avatar": "^1.1.11",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-separator": "^1.1.8",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-toast": "^1.2.15",
    "@supabase/ssr": "^0.5.0",
    "@supabase/supabase-js": "^2.45.0",
    "@tanstack/react-query": "^5.59.0",
    "@tanstack/react-query-devtools": "^5.91.2",
    "@tanstack/react-table": "^8.20.5",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "framer-motion": "^12.26.2",
    "lucide-react": "^0.562.0",
    "next": "^15.0.0",
    "nodemailer": "^7.0.12",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-helmet-async": "^2.0.5",
    "react-hook-form": "^7.71.1",
    "sharp": "^0.34.5",
    "tailwind-merge": "^3.4.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/node": "^24.10.1",
    "@types/nodemailer": "^7.0.5",
    "@types/react": "^19.2.5",
    "@types/react-dom": "^19.2.3",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "prisma": "^5.19.0",
    "tailwindcss": "^3.4.4",
    "tailwindcss-animate": "^1.0.7",
    "tsx": "^4.7.0",
    "typescript": "~5.9.3"
  }
}
```

- [ ] **Step 5: Port `tailwind.config.ts`**

Copy from `frontend/tailwind.config.ts`. Update the `content` paths:

```typescript
content: [
  "./app/**/*.{js,ts,jsx,tsx,mdx}",
  "./components/**/*.{js,ts,jsx,tsx,mdx}",
],
```

Keep all theme extensions (fonts, colors, keyframes, animations) exactly as they are.

- [ ] **Step 6: Port `globals.css`**

Copy `frontend/src/index.css` to `app/globals.css`. Content is identical — CSS variables for light/dark themes, base layer styles, Lenis smooth scroll styles.

- [ ] **Step 7: Update `components.json` for shadcn**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

- [ ] **Step 8: Create placeholder `app/layout.tsx`**

```tsx
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Turkey Clinic Guide",
  description: "Find and compare dental clinics in Turkey",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 9: Create placeholder `app/page.tsx`**

```tsx
export default function HomePage() {
  return <div>Turkey Clinic Guide - Migration in progress</div>
}
```

- [ ] **Step 10: Install dependencies and verify the app starts**

```bash
npm install
npm run dev
```

Expected: Next.js dev server starts, page renders at localhost:3000.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with dependencies and config"
```

---

### Task 2: Set Up Prisma + Supabase Database

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `lib/prisma.ts`
- Create: `.env.local`

- [ ] **Step 1: Update Prisma schema**

Remove `password` field from User, change `id` to use plain `@id` (Supabase Auth UUID):

In `prisma/schema.prisma`, update the User model:

```prisma
model User {
  id            String    @id  // Supabase Auth UUID
  email         String    @unique
  name          String?
  role          UserRole  @default(USER)
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  reviews       Review[]
  bookings      Booking[]
  favorites     Favorite[]
  ownedClinic   Clinic?
}
```

All other models remain unchanged.

- [ ] **Step 2: Create `.env.local`**

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

Add `.env.local` to `.gitignore` if not already present.

- [ ] **Step 3: Update schema for connection pooling**

Add `directUrl` to datasource for migrations:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

- [ ] **Step 4: Create `lib/prisma.ts`**

```typescript
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

- [ ] **Step 5: Generate Prisma client and push schema**

```bash
npx prisma generate
npx prisma db push
```

Expected: Schema syncs to Supabase PostgreSQL, Prisma client generates without errors.

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma lib/prisma.ts .gitignore
git commit -m "feat: configure Prisma with Supabase PostgreSQL"
```

---

### Task 3: Set Up Supabase Auth Clients

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/middleware.ts`
- Create: `lib/auth.ts`
- Create: `middleware.ts`

- [ ] **Step 1: Create browser Supabase client**

Create `lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 2: Create server Supabase client**

Create `lib/supabase/server.ts`:

```typescript
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  )
}
```

- [ ] **Step 3: Create middleware Supabase helper**

Create `lib/supabase/middleware.ts`:

```typescript
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect unauthenticated users from protected routes
  const protectedPaths = ["/account", "/favorites", "/clinic-portal", "/admin"]
  const isProtected = protectedPaths.some((p) =>
    request.nextUrl.pathname.startsWith(p)
  )

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  const authPaths = ["/login", "/register"]
  const isAuthPage = authPaths.some((p) =>
    request.nextUrl.pathname.startsWith(p)
  )

  if (isAuthPage && user) {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
```

- [ ] **Step 4: Create Next.js middleware**

Create `middleware.ts` at project root:

```typescript
import { type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
```

- [ ] **Step 5: Create auth helper for Route Handlers**

Create `lib/auth.ts`:

```typescript
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export async function getAuthUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  })

  return dbUser
}

export async function requireAuth() {
  const user = await getAuthUser()
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  return user
}

export async function requireAdmin() {
  const user = await getAuthUser()
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (user.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }
  return user
}
```

- [ ] **Step 6: Create auth callback route**

Create `app/auth/callback/route.ts`:

```typescript
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Ensure user exists in Prisma database
      await prisma.user.upsert({
        where: { id: data.user.id },
        update: { email: data.user.email! },
        create: {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name || null,
        },
      })

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
```

- [ ] **Step 7: Verify middleware works**

```bash
npm run dev
```

Visit `http://localhost:3000/account` — should redirect to `/login`.
Visit `http://localhost:3000/` — should render normally.

- [ ] **Step 8: Commit**

```bash
git add lib/supabase/ lib/auth.ts middleware.ts app/auth/
git commit -m "feat: set up Supabase Auth with middleware and route protection"
```

---

### Task 4: Port Shared Libraries and Components

**Files:**
- Create: `lib/utils.ts`, `lib/api.ts`
- Copy: `components/ui/` (all shadcn components)
- Create: `hooks/use-toast.ts`, `hooks/use-auth.ts`, `hooks/use-clinics.ts`
- Create: `schemas/booking.ts`, `schemas/review.ts`, `schemas/clinic-registration.ts`
- Create: `components/providers.tsx`

- [ ] **Step 1: Create `lib/utils.ts`**

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "")
}
```

- [ ] **Step 2: Create `lib/api.ts`**

Simplified — no more token management, cookies are sent automatically:

```typescript
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit & { body?: unknown } = {}
): Promise<T> {
  const isFormData = options.body instanceof FormData

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string>),
  }

  const { body, ...fetchOptions } = options
  const requestBody: BodyInit | null | undefined = isFormData
    ? (body as FormData)
    : body
      ? JSON.stringify(body as Record<string, unknown>)
      : undefined

  const response = await fetch(`/api${endpoint}`, {
    ...fetchOptions,
    headers: headers as HeadersInit,
    body: requestBody,
  })

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Request failed" }))
    throw new Error(error.error || error.message || "Request failed")
  }

  return response.json()
}

export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: "GET" }),
  post: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      method: "POST",
      body: data as BodyInit | null | undefined,
      ...options,
    }),
  put: <T>(endpoint: string, data?: unknown) =>
    apiRequest<T>(endpoint, {
      method: "PUT",
      body: data as BodyInit | null | undefined,
    }),
  delete: <T>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: "DELETE", body: undefined }),
}
```

- [ ] **Step 3: Copy all shadcn/ui components**

```bash
cp -r frontend/src/components/ui/ components/ui/
```

These files require no changes — they use `@/lib/utils` which is already at the same alias path.

- [ ] **Step 4: Create `hooks/use-toast.ts`**

Copy `frontend/src/hooks/use-toast.ts` as-is — it has no router or auth dependencies.

```bash
mkdir -p hooks
cp frontend/src/hooks/use-toast.ts hooks/use-toast.ts
```

- [ ] **Step 5: Create `hooks/use-auth.ts`**

New Supabase-based auth hook replacing the old AuthContext:

```typescript
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { api } from "@/lib/api"

interface User {
  id: string
  email: string
  name: string | null
  role: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user: sbUser },
      } = await supabase.auth.getUser()
      setSupabaseUser(sbUser)

      if (sbUser) {
        try {
          const dbUser = await api.get<User>("/auth/me")
          setUser(dbUser)
        } catch {
          setUser(null)
        }
      }
      setIsLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSupabaseUser(session?.user ?? null)
      if (session?.user) {
        try {
          const dbUser = await api.get<User>("/auth/me")
          setUser(dbUser)
        } catch {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw new Error(error.message)
  }

  const register = async (email: string, password: string, name?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    })
    if (error) throw new Error(error.message)
    return data
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSupabaseUser(null)
  }

  return { user, supabaseUser, isLoading, login, register, logout }
}
```

- [ ] **Step 6: Create `hooks/use-clinics.ts`**

Port from `frontend/src/hooks/useClinics.ts`, update to use new `api` import:

```typescript
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"

export interface Clinic {
  id: string
  name: string
  slug: string
  description?: string
  address: string
  city: string
  phone: string
  email?: string
  website?: string
  latitude?: number
  longitude?: number
  services: string[]
  languages: string[]
  certifications: string[]
  accreditations: string[]
  doctorCount?: number
  establishedYear?: number
  images: string[]
  beforeAfterImages: string[]
  trustBadges: string[]
  successStories: string[]
  testimonials?: unknown
  featured: boolean
  averageRating?: number
  createdAt: string
  updatedAt: string
  _count?: {
    reviews: number
  }
}

export interface ClinicsResponse {
  clinics: Clinic[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ClinicFilters {
  city?: string
  search?: string
  services?: string[]
  languages?: string[]
  minRating?: string
  sortBy?: string
  page?: number
  limit?: number
}

export function useClinics(filters: ClinicFilters = {}) {
  const params = new URLSearchParams()

  if (filters.city && filters.city !== "all") params.set("city", filters.city)
  if (filters.search) params.set("search", filters.search)
  if (filters.services && filters.services.length > 0) {
    params.set("services", filters.services.join(","))
  }
  if (filters.languages && filters.languages.length > 0) {
    params.set("languages", filters.languages.join(","))
  }
  if (filters.minRating && filters.minRating !== "all") {
    params.set("minRating", filters.minRating)
  }
  if (filters.sortBy) params.set("sortBy", filters.sortBy)
  if (filters.page) params.set("page", filters.page.toString())
  if (filters.limit) params.set("limit", filters.limit.toString())

  return useQuery<ClinicsResponse>({
    queryKey: ["clinics", filters],
    queryFn: () =>
      api.get<ClinicsResponse>(`/clinics?${params.toString()}`),
  })
}

export function useClinic(slug: string) {
  return useQuery<Clinic>({
    queryKey: ["clinic", slug],
    queryFn: () => api.get<Clinic>(`/clinics/slug/${slug}`),
    enabled: !!slug,
  })
}
```

- [ ] **Step 7: Port Zod schemas**

```bash
mkdir -p schemas
cp frontend/src/schemas/*.ts schemas/ 2>/dev/null || true
cp backend/src/schemas/booking.ts schemas/booking.ts
cp backend/src/schemas/review.ts schemas/review.ts
cp backend/src/schemas/clinic-registration.ts schemas/clinic-registration.ts
```

Remove the `password` field from `schemas/clinic-registration.ts` since Supabase Auth handles it separately now. Update to:

```typescript
import { z } from "zod"

export const clinicRegistrationSchema = z.object({
  clinicName: z.string().min(2),
  address: z.string().min(5),
  city: z.string().min(2),
  phone: z.string().min(5),
  website: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
  ownerName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

export type ClinicRegistrationInput = z.infer<typeof clinicRegistrationSchema>
```

Note: Keep `password` in the frontend schema — it's sent to the API route which uses it to create the Supabase Auth user.

- [ ] **Step 8: Create `components/providers.tsx`**

```tsx
"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState, type ReactNode } from "react"
import { ThemeProvider } from "./theme-provider"

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

- [ ] **Step 9: Install `next-themes` for theme provider**

The old app used a custom ThemeProvider. Use `next-themes` instead for simpler SSR-compatible theming:

```bash
npm install next-themes
```

Create `components/theme-provider.tsx`:

```tsx
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

- [ ] **Step 10: Update `app/layout.tsx` with providers**

```tsx
import type { Metadata } from "next"
import { Providers } from "@/components/providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "Turkey Clinic Guide",
  description: "Find and compare dental clinics in Turkey",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

- [ ] **Step 11: Verify build compiles**

```bash
npm run build
```

Expected: Build succeeds with no type errors.

- [ ] **Step 12: Commit**

```bash
git add lib/ hooks/ schemas/ components/ app/layout.tsx
git commit -m "feat: port shared libraries, hooks, schemas, and providers"
```

---

### Task 5: Create Auth API Route and Auth Pages

**Files:**
- Create: `app/api/auth/me/route.ts`
- Create: `app/login/page.tsx`
- Create: `app/register/page.tsx`

- [ ] **Step 1: Create `/api/auth/me` route handler**

Create `app/api/auth/me/route.ts`:

```typescript
import { getAuthUser } from "@/lib/auth"

export async function GET() {
  const user = await getAuthUser()

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  return Response.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
}
```

- [ ] **Step 2: Create login page**

Create `app/login/page.tsx`. Port the UI from `frontend/src/routes/login.tsx`, replacing `useAuth()` login with Supabase and `useNavigate` with `useRouter`:

```tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await login(email, password)
      router.push("/")
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
```

- [ ] **Step 3: Create register page**

Create `app/register/page.tsx`. Same pattern as login, using `register` from `useAuth`:

```tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      await register(email, password, name)
      router.push("/")
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>
            Sign up to book appointments and save clinics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
```

Note: Remove the `import { prisma }` line — that was an error. The register page is a client component and should NOT import Prisma. The user creation in the database happens in the auth callback route (Task 3, Step 6) or via a separate API call after signup.

- [ ] **Step 4: Create API route to sync user on signup**

Create `app/api/auth/signup-sync/route.ts`:

```typescript
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const dbUser = await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name || null,
    },
  })

  return Response.json({
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role,
  })
}
```

- [ ] **Step 5: Update `hooks/use-auth.ts` to call signup-sync after registration**

In the `register` function, after successful signup, call the sync endpoint:

```typescript
const register = async (email: string, password: string, name?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  })
  if (error) throw new Error(error.message)

  // Sync user to database
  if (data.user) {
    await fetch("/api/auth/signup-sync", { method: "POST" })
  }

  return data
}
```

- [ ] **Step 6: Verify auth flow works**

```bash
npm run dev
```

1. Visit `/register` — create an account
2. Visit `/login` — sign in
3. Visit `/account` — should be accessible when logged in, redirect to `/login` when not

- [ ] **Step 7: Commit**

```bash
git add app/api/auth/ app/login/ app/register/ hooks/use-auth.ts
git commit -m "feat: implement Supabase Auth with login, register, and user sync"
```

---

### Task 6: Port API Routes (Clinics)

**Files:**
- Create: `app/api/clinics/route.ts`, `app/api/clinics/[id]/route.ts`, `app/api/clinics/slug/[slug]/route.ts`, `app/api/clinics/stats/route.ts`, `app/api/clinics/search/route.ts`, `app/api/clinics/my-clinic/route.ts`, `app/api/clinics/register/route.ts`, `app/api/clinics/admin/pending/route.ts`, `app/api/clinics/admin/[id]/approve/route.ts`, `app/api/clinics/admin/[id]/reject/route.ts`

- [ ] **Step 1: Create clinics list + create route**

Create `app/api/clinics/route.ts`. Port the GET (list with filters) and POST (admin create) from `backend/src/routes/clinics.ts`:

Convert `req.query` to `request.nextUrl.searchParams`, `req.body` to `await request.json()`, `res.json()` to `Response.json()`. Replace `authMiddleware`/`adminMiddleware` with `getAuthUser()`/`requireAdmin()`.

The GET handler is public (no auth). The POST handler requires admin.

- [ ] **Step 2: Create single clinic routes**

Create `app/api/clinics/[id]/route.ts` with GET, PUT, DELETE handlers.
Create `app/api/clinics/slug/[slug]/route.ts` with GET handler.

Same conversion pattern: Express `req.params.id` becomes `params.id` from the route handler's second argument.

- [ ] **Step 3: Create clinic utility routes**

Create `app/api/clinics/stats/route.ts` — GET stats (public).
Create `app/api/clinics/search/route.ts` — GET autocomplete (public).
Create `app/api/clinics/my-clinic/route.ts` — GET owner's clinic (auth required).

- [ ] **Step 4: Create clinic registration route**

Create `app/api/clinics/register/route.ts`. This route needs special handling — it creates both a Supabase Auth user and a Prisma User + Clinic in a transaction:

```typescript
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { clinicRegistrationSchema } from "@/schemas/clinic-registration"
import { createClient } from "@supabase/supabase-js"
import { slugify } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = clinicRegistrationSchema.parse(body)

    // Use admin client to create user
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Create Supabase Auth user
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: { name: data.ownerName },
      })

    if (authError) {
      return Response.json({ error: authError.message }, { status: 400 })
    }

    // Generate slug
    let slug = slugify(data.clinicName)
    const existingClinic = await prisma.clinic.findUnique({ where: { slug } })
    if (existingClinic) {
      slug = `${slug}-${Date.now()}`
    }

    // Create User and Clinic in transaction
    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: authData.user.id,
          email: data.email,
          name: data.ownerName,
          role: "CLINIC_OWNER",
        },
      })

      await tx.clinic.create({
        data: {
          name: data.clinicName,
          slug,
          address: data.address,
          city: data.city,
          phone: data.phone,
          website: data.website || null,
          description: data.description || null,
          status: "PENDING_APPROVAL",
          ownerId: authData.user.id,
        },
      })
    })

    return Response.json(
      { message: "Clinic registration submitted successfully" },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error registering clinic:", error)
    return Response.json(
      { error: "Failed to register clinic" },
      { status: 500 }
    )
  }
}
```

Note: This requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (server-side only, not prefixed with `NEXT_PUBLIC_`).

- [ ] **Step 5: Create admin clinic management routes**

Create `app/api/clinics/admin/pending/route.ts` — GET pending clinics (admin).
Create `app/api/clinics/admin/[id]/approve/route.ts` — PUT approve (admin).
Create `app/api/clinics/admin/[id]/reject/route.ts` — PUT reject (admin).

All use `requireAdmin()` for auth.

- [ ] **Step 6: Verify clinic routes work**

```bash
npm run dev
```

Test with curl:
```bash
curl http://localhost:3000/api/clinics
curl http://localhost:3000/api/clinics/stats
```

Expected: JSON responses with clinic data (or empty arrays if DB is empty).

- [ ] **Step 7: Commit**

```bash
git add app/api/clinics/
git commit -m "feat: port clinic API routes to Next.js Route Handlers"
```

---

### Task 7: Port Remaining API Routes

**Files:**
- Create: `app/api/bookings/route.ts`, `app/api/bookings/[id]/route.ts`
- Create: `app/api/reviews/route.ts`, `app/api/reviews/[id]/route.ts`, `app/api/reviews/[id]/verify/route.ts`
- Create: `app/api/procedures/route.ts`, `app/api/procedures/[id]/route.ts`
- Create: `app/api/favorites/route.ts`
- Create: `app/api/analytics/route.ts`, `app/api/analytics/view/route.ts`

- [ ] **Step 1: Port bookings routes**

Create `app/api/bookings/route.ts` with GET (auth required, returns user's bookings or all for admin) and POST (public with optional auth, creates booking + sends email).

Create `app/api/bookings/[id]/route.ts` with PUT (update status, auth required).

Port the email service by copying `backend/src/services/email.ts` to `lib/email.ts` with no changes needed (it's pure Node.js with nodemailer).

- [ ] **Step 2: Port reviews routes**

Create `app/api/reviews/route.ts` with GET (public) and POST (auth required).
Create `app/api/reviews/[id]/route.ts` with DELETE (admin only).
Create `app/api/reviews/[id]/verify/route.ts` with PUT (admin only).

- [ ] **Step 3: Port procedures routes**

Create `app/api/procedures/route.ts` with GET (public) and POST (admin only).
Create `app/api/procedures/[id]/route.ts` with PUT and DELETE (admin only).

- [ ] **Step 4: Port favorites routes**

Create `app/api/favorites/route.ts` with GET, POST, DELETE (all auth required).

For DELETE, use query parameter: `DELETE /api/favorites?clinicId=xxx`.

- [ ] **Step 5: Port analytics routes**

Create `app/api/analytics/route.ts` with GET (admin only — dashboard analytics).
Create `app/api/analytics/view/route.ts` with POST (public — record clinic view).

- [ ] **Step 6: Port email service**

```bash
mkdir -p lib
cp backend/src/services/email.ts lib/email.ts
```

Update imports — the file uses `@prisma/client` types which still work.

- [ ] **Step 7: Verify all API routes**

```bash
npm run dev
```

Test each endpoint with curl:
```bash
curl http://localhost:3000/api/clinics
curl http://localhost:3000/api/reviews
curl http://localhost:3000/api/procedures
```

- [ ] **Step 8: Commit**

```bash
git add app/api/ lib/email.ts
git commit -m "feat: port bookings, reviews, procedures, favorites, and analytics API routes"
```

---

### Task 8: Port Navigation and Layout Components

**Files:**
- Copy + modify: `components/navigation/` from `frontend/src/components/navigation/`
- Copy: `components/luxury/` from `frontend/src/components/luxury/`

- [ ] **Step 1: Copy navigation components**

```bash
cp -r frontend/src/components/navigation/ components/navigation/
```

In every file, apply these replacements:
- `import { Link } from '@tanstack/react-router'` → `import Link from "next/link"`
- `import { useNavigate } from '@tanstack/react-router'` → `import { useRouter } from "next/navigation"`
- `navigate({ to: '/path' })` → `router.push('/path')`
- `import { useAuth } from '@/lib/auth'` → `import { useAuth } from "@/hooks/use-auth"`
- TanStack Router `Link` props: `to="/path"` stays the same, but remove `search` and `params` props (use `href` with query strings instead)
- Add `"use client"` at the top of each file

- [ ] **Step 2: Copy luxury components**

```bash
cp -r frontend/src/components/luxury/ components/luxury/
```

Add `"use client"` directive to any files using hooks or browser APIs.

- [ ] **Step 3: Copy remaining component directories**

```bash
cp -r frontend/src/components/clinic/ components/clinic/
cp -r frontend/src/components/admin/ components/admin/
cp -r frontend/src/components/account/ components/account/
cp -r frontend/src/components/search/ components/search/
```

Apply the same import replacements as Step 1 across all files.

- [ ] **Step 4: Update `app/layout.tsx` with navigation**

Import and render the header/navigation component in the root layout:

```tsx
import type { Metadata } from "next"
import { Providers } from "@/components/providers"
import { SiteHeader } from "@/components/navigation/site-header"
import "./globals.css"

export const metadata: Metadata = {
  title: "Turkey Clinic Guide",
  description: "Find and compare dental clinics in Turkey",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <SiteHeader />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  )
}
```

Adjust the component name (`SiteHeader`) to match whatever the actual navigation component is named in the ported files.

- [ ] **Step 5: Verify layout renders**

```bash
npm run dev
```

Expected: Navigation bar renders on all pages.

- [ ] **Step 6: Commit**

```bash
git add components/ app/layout.tsx
git commit -m "feat: port navigation, layout, and feature components"
```

---

### Task 9: Port Pages

**Files:**
- Create/modify: All page files under `app/`

- [ ] **Step 1: Port home page (`app/page.tsx`)**

Port from `frontend/src/routes/index.tsx`. This is the clinic listing page with search/filter. Convert to a client component (uses React Query). Replace TanStack Router search params with `useSearchParams` from `next/navigation`.

- [ ] **Step 2: Port clinic detail page (`app/clinics/[slug]/page.tsx`)**

Port from `frontend/src/routes/clinics.$slug.tsx`. Replace `useParams` from TanStack Router with Next.js `params` prop. This page can have a server component wrapper that passes the slug to client components.

- [ ] **Step 3: Port compare page (`app/compare/page.tsx`)**

Port from `frontend/src/routes/compare.tsx`. Client component with `useSearchParams`.

- [ ] **Step 4: Port favorites page (`app/favorites/page.tsx`)**

Port from `frontend/src/routes/favorites.tsx`. Client component, auth required (middleware handles redirect).

- [ ] **Step 5: Port account pages**

Create `app/account/layout.tsx` — protected layout wrapper that checks auth.
Port `app/account/profile/page.tsx` from `frontend/src/routes/account/profile.tsx`.
Port `app/account/bookings/page.tsx` from `frontend/src/routes/account/bookings.tsx`.

For the profile page, password change now uses Supabase Auth:

```typescript
const { supabaseUser } = useAuth()
const supabase = createClient()

// Change password
const { error } = await supabase.auth.updateUser({
  password: newPassword,
})
```

- [ ] **Step 6: Port clinic portal pages**

Create `app/clinic-portal/layout.tsx` — checks CLINIC_OWNER role.
Port `app/clinic-portal/manage/page.tsx` from `frontend/src/routes/clinic-portal/manage.tsx`.
Port `app/clinic-registration/page.tsx` from `frontend/src/routes/clinic-registration.tsx`.

- [ ] **Step 7: Port admin pages**

Create `app/admin/layout.tsx` — checks ADMIN role, renders admin sidebar.
Port each admin page:
- `app/admin/page.tsx` ← `frontend/src/routes/admin/dashboard.tsx`
- `app/admin/clinics/page.tsx` ← `frontend/src/routes/admin/clinics.tsx`
- `app/admin/clinic-requests/page.tsx` ← `frontend/src/routes/admin/clinic-requests.tsx`
- `app/admin/bookings/page.tsx` ← `frontend/src/routes/admin/bookings.tsx`
- `app/admin/reviews/page.tsx` ← `frontend/src/routes/admin/reviews.tsx`
- `app/admin/procedures/page.tsx` ← `frontend/src/routes/admin/procedures.tsx`
- `app/admin/analytics/page.tsx` ← `frontend/src/routes/admin/analytics.tsx`

Each page follows the same conversion pattern:
- Add `"use client"` directive
- Replace router imports
- Replace auth imports
- Replace `Link` imports and props

- [ ] **Step 8: Verify all pages render**

```bash
npm run dev
```

Navigate through all routes and verify they render without errors.

- [ ] **Step 9: Commit**

```bash
git add app/
git commit -m "feat: port all pages from TanStack Router to Next.js App Router"
```

---

### Task 10: Set Up Supabase Storage for Uploads

**Files:**
- Create: `app/api/upload/route.ts`

- [ ] **Step 1: Create upload route handler**

Create `app/api/upload/route.ts`:

```typescript
import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { createClient } from "@supabase/supabase-js"
import sharp from "sharp"

export async function POST(request: NextRequest) {
  const user = await getAuthUser()
  if (!user || user.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const formData = await request.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 })
  }

  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ]
  if (!allowedTypes.includes(file.type)) {
    return Response.json(
      { error: "Invalid file type. Only images are allowed." },
      { status: 400 }
    )
  }

  if (file.size > 5 * 1024 * 1024) {
    return Response.json(
      { error: "File too large. Maximum 5MB." },
      { status: 400 }
    )
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())

    // Process with Sharp
    const processed = await sharp(buffer)
      .resize(1920, 1920, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer()

    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const filename = `${timestamp}-${randomString}.webp`

    // Upload to Supabase Storage
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error: uploadError } = await supabaseAdmin.storage
      .from("clinic-images")
      .upload(filename, processed, {
        contentType: "image/webp",
        upsert: false,
      })

    if (uploadError) {
      return Response.json(
        { error: uploadError.message },
        { status: 500 }
      )
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage
      .from("clinic-images")
      .getPublicUrl(filename)

    return Response.json({ url: publicUrl })
  } catch (error) {
    console.error("Error uploading file:", error)
    return Response.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: Create Supabase Storage bucket**

In the Supabase dashboard:
1. Go to Storage → Create new bucket
2. Name: `clinic-images`
3. Public bucket: Yes
4. File size limit: 5MB
5. Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`

- [ ] **Step 3: Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`**

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

- [ ] **Step 4: Verify upload works**

Test via curl with an authenticated admin session, or through the admin UI.

- [ ] **Step 5: Commit**

```bash
git add app/api/upload/
git commit -m "feat: implement file uploads with Supabase Storage"
```

---

### Task 11: Deploy to Vercel

**Files:**
- Modify: `next.config.ts`
- Modify: `package.json`

- [ ] **Step 1: Configure `next.config.ts` for Supabase images**

```typescript
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 2: Install Vercel CLI and link project**

```bash
npm i -g vercel
vercel link
```

- [ ] **Step 3: Set environment variables on Vercel**

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add DATABASE_URL
vercel env add DIRECT_URL
```

- [ ] **Step 4: Deploy preview**

```bash
vercel
```

Expected: Preview deployment succeeds, app is accessible at the preview URL.

- [ ] **Step 5: Run database setup on production**

```bash
npx prisma db push
```

Ensure `DATABASE_URL` points to Supabase.

- [ ] **Step 6: Deploy to production**

```bash
vercel --prod
```

- [ ] **Step 7: Commit**

```bash
git add next.config.ts
git commit -m "feat: configure for Vercel deployment with Supabase image domains"
```

---

### Task 12: Cleanup Old Files

**Files:**
- Delete: `backend/`, `frontend/`, `docker/`, `render.yaml`

- [ ] **Step 1: Verify the new app works end-to-end**

Test all critical flows:
- Home page loads with clinic listing
- Clinic detail page works
- Login/register flow works
- Booking creation works
- Admin panel accessible for admin users
- File upload works

- [ ] **Step 2: Delete old directories**

```bash
rm -rf backend/ frontend/ docker/ render.yaml
```

- [ ] **Step 3: Update `.env.example`**

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres

# Optional
GOOGLE_MAPS_API_KEY=
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
ADMIN_EMAIL=
```

- [ ] **Step 4: Update `.gitignore`**

Ensure it includes:
```
node_modules/
.next/
.env.local
.env*.local
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove old Express/Vite/Docker files, update env example"
```

- [ ] **Step 6: Push and deploy**

```bash
git push origin migration/nextjs-supabase
```

Create a PR or merge to main when ready.
