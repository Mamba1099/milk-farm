# User Registration System

## Overview

The registration system implements a secure user management flow with the following features:

### Roles

- **Farm Manager**: Admin role with full system access (only one allowed)
- **Employee**: Standard user role with limited access

### Admin Logic

- The system allows only **one farm manager** to exist
- If someone tries to register as a farm manager when one already exists, they are automatically registered as an employee
- The response includes a notification about the role change

### Security Features

- Password hashing with bcrypt (12 salt rounds)
- Input validation using Zod schemas
- Production-ready security headers
- CORS configuration for development and production
- Rate limiting ready headers
- XSS protection and content security policies

### Image Upload

- Integration with Supabase Storage for profile images
- File validation (size limit: 5MB, supported formats: JPEG, PNG, GIF, WebP)
- Automatic file naming and organization

## API Endpoints

### POST /api/register

Register a new user with the following fields:

- `username`: 3-20 characters, alphanumeric + underscores only
- `email`: Valid email address
- `password`: Min 8 characters with uppercase, lowercase, and number
- `confirmPassword`: Must match password
- `role`: "farm_manager" or "employee"
- `image`: Optional profile image file

**Response:**

```json
{
  "message": "User created successfully",
  "user": {
    "id": "user-id",
    "username": "username",
    "email": "email@example.com",
    "role": "employee",
    "image": "image-url",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "roleChanged": true, // If farm manager already exists
  "originalRole": "farm_manager",
  "assignedRole": "employee"
}
```

### GET /api/register

Health check endpoint that returns system status.

### OPTIONS /api/register

Handles CORS preflight requests.

## Environment Variables

```env
# Database
DATABASE_URL="your-postgres-database-url"

# Supabase (for image storage)
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# Production settings
NODE_ENV="development"
ALLOWED_ORIGIN="https://yourdomain.com"

# Security
JWT_SECRET="your-jwt-secret-key"
BCRYPT_SALT_ROUNDS=12
```

## Setup Instructions

1. **Database Setup:**

   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

2. **Supabase Setup:**

   - Create a Supabase project
   - Create a storage bucket named "images"
   - Set bucket policies for public read access
   - Update environment variables

3. **Environment Variables:**
   - Copy `.env.example` to `.env.local`
   - Fill in your database and Supabase credentials

## Production Considerations

### Security Headers

The API automatically sets production-ready security headers:

- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Cache-Control: no-store (for sensitive endpoints)

### CORS Configuration

- Development: Allows all origins (`*`)
- Production: Restricted to `ALLOWED_ORIGIN` environment variable

### Error Handling

- Detailed validation errors in development
- Generic error messages in production
- Comprehensive logging for debugging

### Database Constraints

- Unique constraints on username and email
- Role enum enforcement at database level
- Automatic timestamps for audit trails

## Testing the Registration Flow

1. **First User (Farm Manager):**

   ```bash
   curl -X POST http://localhost:3000/api/register \
     -H "Content-Type: application/json" \
     -d '{
       "username": "admin",
       "email": "admin@farm.com",
       "password": "AdminPass123",
       "confirmPassword": "AdminPass123",
       "role": "farm_manager"
     }'
   ```

2. **Second User (Attempting Farm Manager):**

   ```bash
   curl -X POST http://localhost:3000/api/register \
     -H "Content-Type: application/json" \
     -d '{
       "username": "manager2",
       "email": "manager2@farm.com",
       "password": "Manager123",
       "confirmPassword": "Manager123",
       "role": "farm_manager"
     }'
   ```

   This will create the user as an employee and return a role change notification.

3. **Employee User:**
   ```bash
   curl -X POST http://localhost:3000/api/register \
     -H "Content-Type: application/json" \
     -d '{
       "username": "employee1",
       "email": "employee1@farm.com",
       "password": "Employee123",
       "confirmPassword": "Employee123",
       "role": "employee"
     }'
   ```
