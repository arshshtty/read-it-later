# API Documentation

Base URL: `http://localhost:3000/api` (development)

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### Register

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe" // optional
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt-token-here"
}
```

### Login

Authenticate with email and password.

**Endpoint:** `POST /api/auth/login`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt-token-here"
}
```

### Get Current User

Get the authenticated user's profile.

**Endpoint:** `GET /api/auth/me`

**Headers:** Requires authentication

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### OAuth (Google)

**Endpoint:** `GET /api/auth/google`

Redirects to Google OAuth consent screen.

**Callback:** `GET /api/auth/google/callback`

Handles OAuth callback and redirects to web app with token.

## Links

### Create Link

Save a new link with automatic metadata extraction.

**Endpoint:** `POST /api/links`

**Headers:** Requires authentication

**Body:**
```json
{
  "url": "https://example.com/article",
  "categoryId": "category-uuid" // optional
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "url": "https://example.com/article",
  "title": "Article Title",
  "description": "Article description...",
  "imageUrl": "https://example.com/image.jpg",
  "content": "<html>Article content...</html>",
  "isRead": false,
  "categoryId": "category-uuid",
  "userId": "user-uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "category": {
    "id": "uuid",
    "name": "Tech",
    "color": "#3b82f6"
  }
}
```

### Get All Links

Retrieve all saved links with optional filtering.

**Endpoint:** `GET /api/links`

**Headers:** Requires authentication

**Query Parameters:**
- `categoryId` (optional): Filter by category
- `isRead` (optional): Filter by read status (true/false)
- `search` (optional): Search in title, description, and URL

**Example:**
```
GET /api/links?search=javascript&isRead=false
```

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "url": "https://example.com/article",
    "title": "Article Title",
    "description": "Description...",
    "imageUrl": "https://example.com/image.jpg",
    "content": "<html>...</html>",
    "isRead": false,
    "categoryId": "category-uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "category": {
      "id": "uuid",
      "name": "Tech",
      "color": "#3b82f6"
    }
  }
]
```

### Get Single Link

**Endpoint:** `GET /api/links/:id`

**Headers:** Requires authentication

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "url": "https://example.com/article",
  "title": "Article Title",
  "description": "Description...",
  "imageUrl": "https://example.com/image.jpg",
  "content": "<html>Full article content...</html>",
  "isRead": false,
  "categoryId": "category-uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "category": {
    "id": "uuid",
    "name": "Tech",
    "color": "#3b82f6"
  }
}
```

### Update Link

Update link properties (mark as read, change category).

**Endpoint:** `PATCH /api/links/:id`

**Headers:** Requires authentication

**Body:**
```json
{
  "isRead": true,
  "categoryId": "new-category-uuid" // or null to remove category
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "url": "https://example.com/article",
  "title": "Article Title",
  "isRead": true,
  "categoryId": "new-category-uuid",
  ...
}
```

### Delete Link

**Endpoint:** `DELETE /api/links/:id`

**Headers:** Requires authentication

**Response:** `204 No Content`

## Categories

### Create Category

**Endpoint:** `POST /api/categories`

**Headers:** Requires authentication

**Body:**
```json
{
  "name": "Technology",
  "color": "#3b82f6" // optional hex color
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "name": "Technology",
  "color": "#3b82f6",
  "userId": "user-uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Get All Categories

**Endpoint:** `GET /api/categories`

**Headers:** Requires authentication

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "Technology",
    "color": "#3b82f6",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "_count": {
      "links": 5
    }
  }
]
```

### Update Category

**Endpoint:** `PATCH /api/categories/:id`

**Headers:** Requires authentication

**Body:**
```json
{
  "name": "Tech & Science",
  "color": "#10b981"
}
```

**Response:** `200 OK`

### Delete Category

Deletes category and sets all associated links' categoryId to null.

**Endpoint:** `DELETE /api/categories/:id`

**Headers:** Requires authentication

**Response:** `204 No Content`

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "error": "Link not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Detailed error (development only)"
}
```

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting in production using packages like `express-rate-limit`.

## CORS

CORS is configured to allow requests from:
- `http://localhost:5173` (web dev)
- `http://localhost:3000` (same origin)

Configure additional origins via the `CORS_ORIGINS` environment variable (comma-separated).
