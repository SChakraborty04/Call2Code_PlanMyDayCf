# Express.js Backend API

This is an Express.js backend server that provides API endpoints for a task management and daily planning application. It includes user authentication via Clerk, database integration with Neon PostgreSQL, and integrations with external APIs for weather data and NASA's Astronomy Picture of the Day.

## Features

- **Authentication**: JWT token verification using Clerk
- **Database**: PostgreSQL with Neon serverless
- **External APIs**: 
  - OpenWeatherMap for weather data
  - NASA APOD for astronomy pictures
  - MistralAI for generating daily plans
- **CORS**: Enabled for cross-origin requests
- **Security**: Helmet middleware for security headers

## Get started

1. Clone this project and install dependencies:
   ```bash
   npm install
   ```

2. Copy the environment example file and configure your environment variables:
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your actual API keys and database URL:
   - `NEON_DATABASE_URL`: Your Neon PostgreSQL connection string
   - `CLERK_SECRET_KEY`: Your Clerk secret key for JWT verification
   - `OPENWEATHER_KEY`: Your OpenWeatherMap API key
   - `NASA_KEY`: Your NASA API key
   - `MISTRAL_API_KEY`: Your MistralAI API key

4. Initialize the database schema:
   ```bash
   npm run db:init
   ```

5. Verify database setup:
   ```bash
   npm run db:status
   ```

## Development

1. Start the development server:
   ```bash
   npm run dev
   ```

2. The server will start on `http://localhost:3001`

3. Health check endpoint: `http://localhost:3001/health`

### Global Access (Expose to Internet)

To make your local backend accessible from anywhere on the internet:

#### Option 1: Quick Start with ngrok
```bash
# Install ngrok globally (one-time)
npm install -g ngrok

# Run both server and tunnel
npm run tunnel
```

#### Option 2: Use the startup scripts
```bash
# Windows
start-tunnel.bat

# Linux/Mac
./start-global.sh
```

#### Option 3: Manual ngrok setup
```bash
# Terminal 1: Start your backend
npm run dev

# Terminal 2: Create tunnel
ngrok http 3001
```

Your backend will be available at both:
- Local: `http://localhost:3001`
- Global: `https://your-unique-id.ngrok.io` (check ngrok output)

📖 **For more options and production deployment, see [GLOBAL_ACCESS.md](./GLOBAL_ACCESS.md)**

### Security Features

- ✅ Rate limiting (100 requests per 15 minutes per IP)
- ✅ Helmet security headers
- ✅ CORS protection
- ✅ JWT authentication via Clerk
- ✅ Request logging (development mode)

## Production

1. Build the TypeScript code:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## API Endpoints

### Public Endpoints
- `GET /` - Server status
- `GET /health` - Health check
- `GET /api/apod` - NASA Astronomy Picture of the Day

### Admin Endpoints
- `GET /admin/db/status` - Database connection and table status
- `POST /admin/db/init` - Initialize database schema

### Protected Endpoints (require authentication)
- `POST /api/tasks` - Create a new task
- `GET /api/tasks` - Get user's tasks for today
- `DELETE /api/tasks/:id` - Delete a task
- `POST /api/preferences` - Save user preferences
- `GET /api/preferences` - Get user preferences
- `POST /api/plan` - Generate a daily plan
- `GET /api/plan` - Get today's plan
- `GET /api/weather` - Get weather for user's city

## Database Management

### Manual Database Operations
```bash
# Initialize database schema
npm run db:init

# Check database status and tables
npm run db:status
```

### Database Schema
The application uses PostgreSQL with the following tables:
- `users` - User accounts (Clerk integration)
- `preferences` - User preferences and settings
- `tasks` - Daily tasks
- `events` - Calendar events
- `plans` - Generated daily plans (JSON)

See `schema.sql` for the complete database schema.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 3001) | No |
| `NODE_ENV` | Environment (development/production) | No |
| `NEON_DATABASE_URL` | PostgreSQL connection string | Yes |
| `CLERK_SECRET_KEY` | Clerk JWT secret key | Yes |
| `OPENWEATHER_KEY` | OpenWeatherMap API key | Yes |
| `NASA_KEY` | NASA API key | Yes |
| `MISTRAL_API_KEY` | MistralAI API key | Yes |
| `FRONTEND_URL` | Frontend URL for CORS (default: *) | No |
