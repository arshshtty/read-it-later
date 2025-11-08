# Read It Later

A modern, multi-platform read-it-later application that lets you save articles, organize them, and read them beautifully across web, iOS, and Android.

## Features

- 📱 **Multi-platform**: Web, iOS, and Android apps
- 🔄 **Real-time sync**: Your reading list syncs across all devices
- 🏷️ **Categories**: Organize your saved articles
- 📖 **Reader mode**: Clean reading experience with dark and sepia themes
- 🔍 **Search**: Quick text search across all saved articles
- ✅ **Read tracking**: Mark articles as read/unread
- 🔐 **Secure auth**: Email/password and social login (Google, Apple)

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **Web**: React 19, Vite, TanStack Query, Tailwind CSS
- **Mobile**: React Native (Expo)
- **Auth**: Passport.js with JWT

## Project Structure

```
read-it-later/
├── backend/          # Node.js API server
├── web/              # React web application
├── mobile/           # React Native mobile app
├── shared/           # Shared TypeScript types and utilities
├── docs/             # Project documentation
└── docker-compose.yml # Local development environment
```

## Getting Started

See [docs/SETUP.md](docs/SETUP.md) for detailed setup instructions.

### Quick Start (Local Development)

1. **Prerequisites**
   - Node.js 18+
   - Docker and Docker Compose
   - npm 9+

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development environment**
   ```bash
   npm run dev
   ```

   This will start:
   - PostgreSQL database on port 5432
   - Backend API on http://localhost:3000
   - Web app on http://localhost:5173

4. **Mobile development**
   ```bash
   npm run dev:mobile
   ```

## Documentation

- [Setup Guide](docs/SETUP.md)
- [API Documentation](docs/API.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## License

MIT
