# Architecture Overview

This document describes the architecture and design decisions for the Read It Later application.

## System Architecture

```
┌─────────────────┐
│   Web Browser   │
│   (React 19)    │
└────────┬────────┘
         │
         │ HTTPS
         │
┌────────▼────────┐     ┌─────────────────┐
│   iOS/Android   │     │   Vercel CDN    │
│  (React Native) │     │  (Web Hosting)  │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │ HTTPS/REST            │
         │                       │
         └───────────┬───────────┘
                     │
              ┌──────▼──────┐
              │   Railway   │
              │  Backend +  │
              │  PostgreSQL │
              └─────────────┘
```

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 15
- **ORM**: Prisma
- **Authentication**: Passport.js (Local, JWT, OAuth)
- **Article Extraction**: @extractus/article-extractor

### Web Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **HTTP Client**: Axios
- **Routing**: React Router v6

### Mobile
- **Framework**: React Native
- **Platform**: Expo (SDK 50)
- **Navigation**: React Navigation
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Storage**: AsyncStorage

## Project Structure

```
read-it-later/
├── backend/           # Node.js API server
│   ├── src/
│   │   ├── config/    # Configuration files
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Express middleware
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utility functions
│   ├── prisma/        # Database schema & migrations
│   └── package.json
│
├── web/              # React web application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API client
│   │   ├── store/        # State management
│   │   ├── types/        # TypeScript types
│   │   └── styles/       # Global styles
│   └── package.json
│
├── mobile/           # React Native mobile app
│   ├── src/
│   │   ├── screens/      # Screen components
│   │   ├── components/   # Reusable components
│   │   ├── navigation/   # Navigation setup
│   │   ├── services/     # API client
│   │   ├── store/        # State management
│   │   └── types/        # TypeScript types
│   └── package.json
│
├── shared/           # Shared code (future use)
├── docs/             # Documentation
└── docker-compose.yml # Local development
```

## Database Schema

### Users Table
- `id`: UUID (Primary Key)
- `email`: Unique email address
- `password`: Hashed password (nullable for OAuth users)
- `name`: User's display name
- `provider`: Authentication provider (local, google, apple)
- `providerId`: OAuth provider user ID
- `createdAt`, `updatedAt`: Timestamps

### Links Table
- `id`: UUID (Primary Key)
- `url`: Original URL
- `title`: Extracted article title
- `description`: Extracted description
- `imageUrl`: Featured image URL
- `content`: Full article HTML content
- `isRead`: Boolean read status
- `categoryId`: Foreign key to categories (nullable)
- `userId`: Foreign key to users
- `createdAt`, `updatedAt`: Timestamps

### Categories Table
- `id`: UUID (Primary Key)
- `name`: Category name (unique per user)
- `color`: Hex color code for UI
- `userId`: Foreign key to users
- `createdAt`, `updatedAt`: Timestamps

### Relationships
- User → Links (One-to-Many)
- User → Categories (One-to-Many)
- Category → Links (One-to-Many)
- All foreign keys use CASCADE delete

## Authentication Flow

### Local Authentication
1. User registers with email/password
2. Password is hashed with bcrypt (10 rounds)
3. JWT token is generated with user ID and email
4. Token is stored in localStorage (web) or AsyncStorage (mobile)
5. Token is sent in Authorization header for subsequent requests

### OAuth Flow (Google)
1. User clicks "Sign in with Google"
2. Redirected to Google OAuth consent screen
3. Google redirects to callback URL with auth code
4. Backend exchanges code for user profile
5. User is created or found in database
6. JWT token is generated and returned
7. Web/mobile stores token and redirects to app

### Token Validation
- Passport JWT strategy validates tokens on protected routes
- Tokens expire after 7 days (configurable)
- No refresh token implementation (can be added)

## API Design

### RESTful Principles
- Resources: Users, Links, Categories
- HTTP methods: GET, POST, PATCH, DELETE
- Status codes: 200, 201, 204, 400, 401, 404, 500
- JSON request/response bodies

### Endpoint Patterns
- `/api/auth/*` - Authentication
- `/api/links` - Link CRUD operations
- `/api/categories` - Category CRUD operations

### Validation
- express-validator for input validation
- Prisma schema validation at database level
- Custom business logic validation in controllers

## Article Extraction

Uses `@extractus/article-extractor` library:

1. User submits URL
2. Backend fetches the URL
3. Extractor parses HTML and extracts:
   - Title
   - Description
   - Featured image
   - Main article content (cleaned HTML)
4. Extracted data is stored in database
5. If extraction fails, minimal data is stored

## Reader Mode Implementation

### Web
- Three themes: Light, Dark, Sepia
- CSS classes apply theme-specific colors
- Article content rendered as HTML
- Custom styles for typography and spacing

### Mobile
- Same three themes
- react-native-render-html renders article content
- Platform-specific styling with StyleSheet

## State Management

### Zustand Store (Auth)
```typescript
{
  user: User | null,
  token: string | null,
  isAuthenticated: boolean,
  setAuth: (user, token) => void,
  logout: () => void
}
```

### TanStack Query (Data Fetching)
- Server state management
- Automatic caching and refetching
- Optimistic updates for mutations
- Query keys: ['links'], ['categories'], ['link', id]

## Security Considerations

### Implemented
- Password hashing with bcrypt
- JWT for stateless authentication
- CORS configuration
- Input validation
- SQL injection prevention (Prisma ORM)
- XSS prevention (React escapes by default)

### TODO for Production
- Rate limiting
- HTTPS enforcement
- Helmet.js security headers
- CSRF protection
- Content Security Policy
- Secure cookie settings
- Environment-specific secrets
- API key rotation

## Performance Optimizations

### Backend
- Prisma query optimization
- Database indexes on userId and categoryId
- Connection pooling (Prisma default)

### Web
- Vite build optimization
- Code splitting (React Router lazy loading ready)
- Image lazy loading (can be added)
- Service worker for offline support (future)

### Mobile
- React Native's built-in optimizations
- Expo's over-the-air updates
- Image caching (can be improved)

## Scalability Considerations

### Current Limitations
- Single server deployment
- No caching layer (Redis)
- No CDN for images
- No background job processing

### Future Improvements
- Horizontal scaling with load balancer
- Redis for session storage and caching
- S3 for image storage
- Queue system for article extraction (Bull/BullMQ)
- Read replicas for database
- Microservices architecture (if needed)

## Deployment Architecture

### Development
```
Docker Compose
├── PostgreSQL container
├── Backend container
└── Web container
```

### Production
```
Railway
├── PostgreSQL (managed)
└── Backend (Node.js)

Vercel
└── Web (Static + Edge Functions)

App Stores
├── iOS (TestFlight → App Store)
└── Android (Internal Test → Play Store)
```

## Monitoring & Logging

### Current
- Console logging in development
- Prisma query logging
- Express error handling

### Recommended for Production
- Structured logging (Winston/Pino)
- Error tracking (Sentry)
- Application monitoring (New Relic/DataDog)
- Database monitoring (built-in Railway/Neon)
- Uptime monitoring (UptimeRobot)

## Testing Strategy

### Not Yet Implemented
- Unit tests (Jest)
- Integration tests (Supertest)
- E2E tests (Playwright/Cypress)
- Mobile testing (Jest + React Native Testing Library)

### Recommended Coverage
- API endpoints (integration tests)
- Authentication flows
- CRUD operations
- Error handling
- Edge cases

## Development Workflow

1. **Local Development**
   - Docker Compose for full stack
   - Hot reload for all services
   - Prisma Studio for database inspection

2. **Code Changes**
   - Edit code in respective workspace
   - Auto-reload reflects changes
   - Test manually in browser/simulator

3. **Database Changes**
   - Modify Prisma schema
   - Run `prisma migrate dev`
   - Migration applied locally

4. **Deployment**
   - Push to Git
   - Railway auto-deploys backend
   - Vercel auto-deploys web
   - Mobile built and submitted manually

## Future Enhancements

### Features
- Browser extension (Chrome, Firefox)
- Email integration (save via email)
- Tags/labels (in addition to categories)
- Full-text search (PostgreSQL FTS or Elasticsearch)
- Sharing/collaboration
- Reading statistics
- Highlights and annotations
- PDF export
- Offline mode (PWA)
- Dark mode (system-wide, not just reader)

### Technical
- GraphQL API (alternative to REST)
- Server-side rendering (Next.js)
- Native mobile apps (Swift/Kotlin)
- Desktop apps (Electron/Tauri)
- CLI tool
- API versioning
- Webhook support
- Third-party integrations (Pocket, Instapaper sync)
