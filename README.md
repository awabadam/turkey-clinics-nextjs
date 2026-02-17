# Turkey Clinic Guide

A full-stack dental directory website built with Next.js 14, PostgreSQL, and Docker.

## Features

- Browse and search dental clinics in Turkey
- Clinic detail pages with maps, reviews, and booking
- User authentication and reviews
- Admin panel for managing clinics and bookings
- Docker deployment ready

## Tech Stack

- **Frontend/Backend:** Next.js 14 (App Router) with TypeScript
- **Database:** PostgreSQL 15+
- **ORM:** Prisma
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS
- **Deployment:** Docker Compose

## Getting Started

### Prerequisites

- Node.js 20+
- Docker and Docker Compose (for deployment)
- PostgreSQL (for local development without Docker)

### Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration.

4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

### Docker Deployment

1. Build and start containers:
   ```bash
   docker-compose -f docker/docker-compose.yml up -d --build
   ```

2. Run database migrations:
   ```bash
   docker-compose -f docker/docker-compose.yml exec app npx prisma db push
   ```

3. Access the application at [http://localhost:3000](http://localhost:3000)

### Environment Variables

See `.env.example` for required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - Secret for NextAuth (generate with `openssl rand -base64 32`)
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps API key (optional)

### Database Management

- Generate Prisma client: `npm run db:generate`
- Push schema changes: `npm run db:push`
- Run migrations: `npm run db:migrate`
- Open Prisma Studio: `npm run db:studio`

## Project Structure

```
turkey-clinic-guide/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (public)/          # Public routes
│   │   ├── admin/             # Admin panel
│   │   └── api/               # API routes
│   ├── components/            # React components
│   ├── lib/                   # Utilities
│   └── types/                 # TypeScript types
├── docker/                    # Docker configuration
└── public/                    # Static assets
```

## License

MIT

