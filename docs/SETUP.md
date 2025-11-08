# Setup Guide

This guide will help you set up the Read It Later application for local development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Docker** and **Docker Compose**
- **Git**

For mobile development:
- **Expo CLI**: `npm install -g expo-cli`
- **iOS Simulator** (macOS only) or **Android Studio** with an emulator

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd read-it-later
```

### 2. Install Dependencies

```bash
npm install
```

This will install dependencies for all workspaces (backend, web, mobile, shared).

### 3. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and update the following variables:

```env
# Database
DATABASE_URL=postgresql://readitlater:dev_password_change_in_production@localhost:5432/readitlater

# Backend
JWT_SECRET=your_secure_random_string_here

# Optional: OAuth credentials (for Google/Apple login)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 4. Start Development Environment

Start all services using Docker Compose:

```bash
npm run dev
```

This will start:
- PostgreSQL database on port 5432
- Backend API on http://localhost:3000
- Web application on http://localhost:5173

The first time you run this, it will:
- Download Docker images
- Install dependencies
- Run database migrations
- Start all services

### 5. Verify Installation

Check that everything is running:

- Backend health check: http://localhost:3000/health
- Web application: http://localhost:5173

You should see the login page.

## Individual Service Setup

### Backend Only

```bash
cd backend
npm install
npm run dev
```

Make sure PostgreSQL is running (either via Docker Compose or locally).

### Web Only

```bash
cd web
npm install
npm run dev
```

### Mobile Development

```bash
cd mobile
npm install
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your physical device

**Note**: Update the API URL in `mobile/src/services/api.ts` to point to your backend:
- For physical device: Use your computer's local IP (e.g., `http://192.168.1.100:3000`)
- For simulators: `http://localhost:3000` should work

## Database Management

### Run Migrations

```bash
cd backend
npm run prisma:migrate
```

### Open Prisma Studio (Database GUI)

```bash
cd backend
npm run prisma:studio
```

This opens a web interface at http://localhost:5555 to browse and edit your database.

### Reset Database

```bash
cd backend
npx prisma migrate reset
```

This will drop the database, recreate it, and run all migrations.

## Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

```bash
# Find and kill process on port 3000 (backend)
lsof -ti:3000 | xargs kill -9

# Find and kill process on port 5173 (web)
lsof -ti:5173 | xargs kill -9
```

### Docker Issues

If Docker services aren't starting:

```bash
# Stop all containers
docker-compose down

# Remove volumes (WARNING: This deletes your database)
docker-compose down -v

# Rebuild and start
docker-compose up --build
```

### Database Connection Issues

Make sure PostgreSQL is running:

```bash
docker-compose ps
```

Check the DATABASE_URL in your `.env` file matches the database credentials in `docker-compose.yml`.

### Module Not Found Errors

```bash
# Clean install all dependencies
npm run clean
npm install
```

## Next Steps

- Read the [Architecture Overview](./ARCHITECTURE.md)
- Check out the [API Documentation](./API.md)
- Learn about [Deployment](./DEPLOYMENT.md)

## Development Tips

### Hot Reload

All services support hot reload:
- Backend: Changes to TypeScript files automatically restart the server
- Web: Vite hot module replacement
- Mobile: Expo fast refresh

### Code Quality

Before committing:

```bash
# Backend
cd backend
npm run build

# Web
cd web
npm run build
```

### Database Schema Changes

1. Modify `backend/prisma/schema.prisma`
2. Create migration: `cd backend && npx prisma migrate dev --name description_of_change`
3. The migration is automatically applied in development

## Support

If you encounter issues:

1. Check this documentation
2. Review error logs in terminal
3. Check Docker logs: `docker-compose logs`
4. Open an issue on GitHub
