# Deployment Guide

## VPS Deployment with Docker

### Prerequisites

- VPS with Docker and Docker Compose installed
- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt recommended)

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd Turkey-Clinic-Guide
```

### Step 2: Configure Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
nano .env
```

Key variables to set:
- `DATABASE_URL` - Will be set automatically by docker-compose
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your domain URL (e.g., `https://yourdomain.com`)
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Your Google Maps API key (optional)

### Step 3: Build and Start Containers

```bash
docker-compose -f docker/docker-compose.yml up -d --build
```

### Step 4: Initialize Database

```bash
# Generate Prisma client
docker-compose -f docker/docker-compose.yml exec app npx prisma generate

# Push database schema
docker-compose -f docker/docker-compose.yml exec app npx prisma db push

# Seed admin user (optional)
docker-compose -f docker/docker-compose.yml exec app npm run db:seed
```

### Step 5: Access Application

- Application: `http://your-vps-ip:3000`
- Admin Login: `admin@example.com` / `admin123` (change password after first login)

### Step 6: Set Up Reverse Proxy (Optional)

For production, use Nginx as reverse proxy:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL with Let's Encrypt

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Useful Commands

```bash
# View logs
docker-compose -f docker/docker-compose.yml logs -f app

# Stop containers
docker-compose -f docker/docker-compose.yml down

# Restart containers
docker-compose -f docker/docker-compose.yml restart

# Access app container shell
docker-compose -f docker/docker-compose.yml exec app sh

# Backup database
docker-compose -f docker/docker-compose.yml exec postgres pg_dump -U postgres turkey_clinic_guide > backup.sql
```

