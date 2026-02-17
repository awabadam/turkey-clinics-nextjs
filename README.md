# Turkey Clinic Guide

A full-stack dental clinic directory for Turkey: browse clinics, view details with maps, book appointments, and manage content via an admin panel.

## Features

- Browse and search dental clinics in Turkey
- Clinic detail pages with maps (Google Maps), reviews, and booking
- User authentication (register, login, JWT)
- Clinic owner registration and dashboard
- Admin panel for managing clinics, procedures, and bookings
- Docker deployment ready

## Tech Stack

- **Frontend:** React 19, Vite, TypeScript, TanStack Router, Tailwind CSS
- **Backend:** Express, TypeScript, Prisma
- **Database:** PostgreSQL 15+
- **Auth:** JWT (no NextAuth)
- **Deployment:** Docker Compose

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL (for local development without Docker)
- Docker and Docker Compose (optional, for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/Turkey-Clinic-Guide.git
   cd Turkey-Clinic-Guide
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```
   This installs root, frontend, and backend dependencies.

3. **Environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set at least:
   - `DATABASE_URL` – PostgreSQL connection string
   - `JWT_SECRET` – e.g. `openssl rand -base64 32`
   - `FRONTEND_URL` – e.g. `http://localhost:3000`
   - `VITE_API_URL` – e.g. `http://localhost:3001/api`  
   See `.env.example` for all options (Google Maps, SMTP, etc.). **Do not commit `.env`.**

4. **Database**
   From the project root (Prisma lives here):
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Run the app**
   ```bash
   npm run dev
   ```
   - Frontend: [http://localhost:3000](http://localhost:3000)  
   - Backend API: [http://localhost:3001](http://localhost:3001)

### Docker

1. **Build and start**
   ```bash
   docker-compose -f docker/docker-compose.yml up -d --build
   ```

2. **Database**  
   Use the same `db:generate` / `db:push` flow as above, or run them inside the backend container. Ensure `DATABASE_URL` and `JWT_SECRET` are set (e.g. in `.env` or in Compose env).

3. **Access**  
   App: [http://localhost:3000](http://localhost:3000)

### Deployment (VPS with Docker)

- Clone the repo, copy `.env.example` to `.env`, set `JWT_SECRET`, `DATABASE_URL` (or let Docker set it), and `FRONTEND_URL`/`VITE_API_URL` for production.
- Build and start: `docker-compose -f docker/docker-compose.yml up -d --build`
- Initialize DB (run once):  
  `docker-compose -f docker/docker-compose.yml exec backend npx prisma generate`  
  `docker-compose -f docker/docker-compose.yml exec backend npx prisma db push`
- Use a reverse proxy (e.g. Nginx) and SSL (e.g. Let's Encrypt) for production.  
  Proxy to `http://localhost:3000` (frontend) and `http://localhost:3001` (API) or serve the built frontend statically and proxy only the API.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | **Required.** Secret for JWT (e.g. `openssl rand -base64 32`) |
| `PORT` | Backend port (default 3001) |
| `FRONTEND_URL` | Frontend origin (for CORS) |
| `VITE_API_URL` | API base URL used by the frontend |
| `VITE_GOOGLE_MAPS_API_KEY` | Optional; for maps on clinic pages |
| `SMTP_*` / `ADMIN_EMAIL` | Optional; for booking/notification emails |

See `.env.example` for the full list.

### Scripts (from project root)

| Script | Description |
|--------|-------------|
| `npm run install:all` | Install deps in root, frontend, and backend |
| `npm run dev` | Run frontend + backend in dev mode |
| `npm run build` | Build frontend and backend |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to DB (no migrations) |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:studio` | Open Prisma Studio |

## Project Structure

```
Turkey-Clinic-Guide/
├── backend/          # Express API, Prisma (client only)
│   └── src/
├── frontend/         # Vite + React app
│   └── src/
├── prisma/           # Schema and migrations
│   └── schema.prisma
├── docker/           # Dockerfile(s), docker-compose
├── public/           # Static uploads (e.g. clinic images)
├── .env.example      # Example env (copy to .env, do not commit .env)
└── package.json      # Root scripts (dev, build, db)
```

## License

MIT
