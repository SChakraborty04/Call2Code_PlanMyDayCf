# PlanMyDay - AI-Powered Day Planner

## Let AI Plan your day worry free.

## 🌟 Live Demo

- **Frontend**: [https://astonishing-paprenjak-d7708a.netlify.app](https://astonishing-paprenjak-d7708a.netlify.app)
- **Backend API**: [https://call2code-render-backend.onrender.com](https://call2code-render-backend.onrender.com)

### Test Account
- **Email**: reovara22@gmail.com
- **Password**: TestReo1234@

## 🚀 Features Implemented

### 🔴 Hard Level (High Difficulty)
- **AI Task Generation with Plan Alignment** 🤖
  - Multi-model AI system using MistralAI for intelligent task creation
  - Context-aware scheduling considering user preferences, weather, and existing plans
  - Automatic conflict resolution and task optimization
  - Smart task alignment with existing daily schedules

- **Voice Navigation and Accessibility Features** 🎤
  - Natural language processing for voice input
  - Intelligent parsing of task details (duration, priority, scheduling)
  - Multi-format time recognition and validation
  - Voice command processing with structured output
  - Full voice-controlled navigation system
  - Accessibility compliance for screen readers

- **Text-to-Speech for Content** 🔊
  - AI-powered task dictation and reading
  - Contextual voice feedback for user actions
  - Time-aware verbal task summaries
  - Natural speech synthesis for all content
  - Multi-language support for speech output

- **Intelligent Performance Analytics** 📊
  - AI-powered productivity insights and recommendations
  - Pattern recognition for optimal working hours
  - Completion rate analysis with predictive suggestions
  - Time-aware contextual advice system

### � Intermediate Level (Medium Difficulty)
- **Dynamic Kanban Board Management** 📋
  - Drag-and-drop task management with real-time updates
  - Status tracking across multiple stages (Backlog, To Do, In Progress, Done)
  - Priority system with visual indicators
  - Time-based task scheduling and duration tracking

- **Weather-Integrated Planning** 🌤️
  - Real-time weather data integration for outdoor task suggestions
  - Location-based weather forecasting
  - Smart task recommendations based on weather conditions
  - Automatic indoor/outdoor task categorization

- **Authentication & Security** 🔐
  - Clerk-based secure user authentication
  - JWT token management and validation
  - Rate limiting and API protection
  - CORS configuration for secure cross-origin requests

- **Interactive Gaming System** 🎮
  - Built-in car racing game for productivity gamification
  - Score tracking and achievement system
  - Stress-relief gaming integration
  - Performance-based game rewards

### 🟢 Easy Level (Low Difficulty)
- **Creative 404/Error Handling** �
  - Custom animated 404 page with interactive elements
  - Contextual error messages with helpful suggestions
  - Fun error animations and recovery options
  - User-friendly error state management

- **Dark Mode Support** 🌙
  - System preference detection and manual toggle
  - Smooth theme transitions with animations
  - Consistent dark/light theme across all components
  - Persistent theme preference storage

- **Custom Loading States** ⏳
  - Creative loading animations for different actions
  - Context-aware loading indicators
  - Skeleton loading for better UX
  - Progressive loading with visual feedback

- **Responsive UI/UX Design** 📱
  - Modern, clean interface with shadcn/ui components
  - Mobile-responsive design for all screen sizes
  - Touch-friendly interactions
  - Smooth animations and transitions

- **NASA APOD Integration** 🚀
  - Daily Astronomy Picture of the Day display
  - Inspirational content integration
  - Educational astronomy facts
  - Beautiful visual experience enhancement

- **Task CRUD Operations** ✏️
  - Create, read, update, delete task functionality
  - Task categorization and filtering
  - Search and sort capabilities
  - Bulk task operations

- **Real-time Synchronization** ⚡
  - Live updates across multiple sessions
  - Instant task status changes
  - Real-time collaboration support
  - Automatic data persistence

## 🔗 APIs Used

### 🤖 AI & Machine Learning APIs
- **MistralAI API** (Primary AI Engine)
  - Endpoint: `https://api.mistral.ai/v1/chat/completions`
  - Purpose: Task generation, voice extraction, performance insights
  - Models: `mistral-small-latest`, `codestral-latest`
  - Features: Multi-model fallback, optimal model selection

### 🌤️ Weather & Location APIs
- **OpenWeatherMap API**
  - Current Weather: `https://api.openweathermap.org/data/2.5/weather`
  - 5-Day Forecast: `https://api.openweathermap.org/data/2.5/forecast`
  - Purpose: Weather-based task recommendations, outdoor activity planning
  - Features: Location-based forecasting, weather-responsive theming

### 🚀 External Content APIs
- **NASA APOD API**
  - Endpoint: `https://api.nasa.gov/planetary/apod`
  - Purpose: Daily inspiration, dynamic theming based on space imagery
  - Features: High-quality astronomy images, educational content

### 🔐 Authentication & User Management
- **Clerk API**
  - JWT Verification: `https://api.clerk.dev/v1/jwks`
  - User Management: Clerk Backend SDK
  - Purpose: Secure user authentication, session management
  - Features: Social login, JWT tokens, user profile management

### 🗄️ Database API
- **Neon PostgreSQL API**
  - Connection: Serverless PostgreSQL via `@neondatabase/serverless`
  - Purpose: Task storage, user preferences, performance analytics
  - Features: Auto-scaling, connection pooling, SQL queries

### 🎤 Browser APIs (Frontend)
- **Web Speech API**
  - Speech Recognition: `webkitSpeechRecognition` / `SpeechRecognition`
  - Speech Synthesis: `speechSynthesis.speak()`
  - Purpose: Voice navigation, text-to-speech features
  - Features: Multi-language support, continuous recognition

- **Geolocation API**
  - Location Access: `navigator.geolocation.getCurrentPosition()`
  - Purpose: Location-based weather and task suggestions
  - Features: Automatic location detection for weather data

## 📸 Screenshots

### 📋 Kanban Task Board
<img width="612" alt="P5" src="https://github.com/user-attachments/assets/b893ac54-626c-43ea-ab59-0223cfe80811" />

*Drag-and-drop task management with status tracking and priority indicators*

### 🤖 AI Task Generation
<img width="549" alt="P3" src="https://github.com/user-attachments/assets/bb8e3327-36a0-4c32-97cf-1720696f73f3" />

*Intelligent task creation with custom prompts and plan alignment*

### 🎤 Voice Task Input
<img width="631" alt="P6" src="https://github.com/user-attachments/assets/1d0099fd-7104-463e-8b7a-3eee82ea427c" />

*Natural language voice task extraction with real-time processing*

### 📊 Performance Analytics
<img width="617" alt="P2" src="https://github.com/user-attachments/assets/5dd9184e-dc39-4aa1-92e8-0eb63f3c7b5f" />

*Detailed productivity analytics with AI-powered recommendations*



### 🎮 Interactive Gaming
<img width="655" alt="P4" src="https://github.com/user-attachments/assets/491389db-0f89-4644-b173-6ead4bd5684b" />

*Built-in car racing game for productivity gamification*


### 🎭 Custom 404 Page
<img width="674" alt="P8" src="https://github.com/user-attachments/assets/852dea46-8b10-452d-a536-b5030fab26c3" />

*Creative animated 404 error handling with interactive elements*
*Not working in the hosted site due to server errors or the hosting may not support custom 404*


## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with custom animations
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **Authentication**: Clerk React SDK
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React & React Icons

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL (Neon Serverless)
- **Authentication**: Clerk Backend SDK
- **AI Integration**: MistralAI for task generation and insights
- **External APIs**: 
  - OpenWeatherMap for weather data
  - NASA API for Astronomy Picture of the Day
- **Security**: Helmet, CORS, Express Rate Limit

## 📦 Local Development Setup

### Prerequisites
- **Node.js 18.0.0 or higher** ([Download](https://nodejs.org/))
- **npm or yarn package manager**
- **Git** for version control
- **PostgreSQL database** (or [Neon](https://neon.tech) account)
- **API keys** for external services (see setup guide below)

### 🚀 Quick Start (5 minutes)

1. **Clone and Navigate**
   ```bash
   git clone <repository-url>
   cd <repo> 
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure your .env file (see environment setup below)
   npm run db:init
   npm run dev
   ```

3. **Frontend Setup** (in new terminal)
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   # Configure your .env file
   npm run dev
   ```

4. **Access Application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:8787`

### 🔧 Detailed Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   **Required Environment Variables:**
   ```env
   # Database Configuration
   NEON_DATABASE_URL=postgresql://username:password@host/database
   
   # Authentication (Clerk)
   CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxx
   
   # AI Services
   MISTRAL_API_KEY=xxxxxxxxxxxxxxxxxxxxxxx
   
   # External APIs (Optional but recommended)
   OPENWEATHER_KEY=xxxxxxxxxxxxxxxxxxxxxxx
   NASA_KEY=xxxxxxxxxxxxxxxxxxxxxxx
   
   # Server Configuration
   PORT=8787
   NODE_ENV=development
   ```

3. **Database Setup & Verification**
   ```bash
   # Initialize database schema
   npm run db:init
   
   # Check database connection
   npm run db:status
   
   # Expected output: "✅ Database connection successful"
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   **Server will start on:** `http://localhost:8787`
   
   **Health Check:** Visit `http://localhost:8787/health`

### 🎨 Detailed Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   **Required Environment Variables:**
   ```env
   # Backend API
   VITE_API_URL=http://localhost:8787
   
   # Authentication (Clerk)
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxx
   
   # Optional: External Services (if used in frontend)
   VITE_OPENWEATHER_KEY=xxxxxxxxxxxxxxxxxxxxxxx
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   **Frontend will start on:** `http://localhost:5173`

### 🔑 API Keys Setup Guide

#### 1. Clerk Authentication (Required)
```bash
# Step 1: Sign up at https://clerk.com
# Step 2: Create new application
# Step 3: Get your keys from the dashboard

# Backend (.env)
CLERK_SECRET_KEY=sk_test_your_secret_key

# Frontend (.env)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
```

#### 2. MistralAI (Required for AI features)
```bash
# Step 1: Sign up at https://mistral.ai
# Step 2: Generate API key from dashboard
# Step 3: Add to backend .env

MISTRAL_API_KEY=your_mistral_api_key
```

#### 3. OpenWeatherMap (Optional)
```bash
# Step 1: Sign up at https://openweathermap.org/api
# Step 2: Get free API key
# Step 3: Add to backend .env

OPENWEATHER_KEY=your_openweather_api_key
```

#### 4. NASA API (Optional)
```bash
# Step 1: Get free key at https://api.nasa.gov
# Step 2: Add to backend .env

NASA_KEY=your_nasa_api_key
```

#### 5. Neon Database (Required)
```bash
# Step 1: Sign up at https://neon.tech
# Step 2: Create new project
# Step 3: Copy connection string
# Step 4: Add to backend .env

NEON_DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
```

## 🧪 Testing Instructions

### 🚀 Basic Functionality Tests

#### 1. Backend API Testing
```bash
cd backend

# Test API endpoints
npm test

# Manual API testing
curl http://localhost:8787/health
# Expected: {"status": "OK", "timestamp": "..."}

# Test database connection
npm run db:status
# Expected: "✅ Database connection successful"
```

#### 2. Frontend Component Testing
```bash
cd frontend

# Run linting
npm run lint

# Build test
npm run build

# Preview build
npm run preview
```

### 🎯 Feature Testing Checklist

#### ✅ Authentication Flow
- [ ] User registration with email
- [ ] User login/logout
- [ ] JWT token persistence
- [ ] Protected route access

#### ✅ Task Management
- [ ] Create new task
- [ ] Edit existing task
- [ ] Delete task
- [ ] Drag-and-drop between columns
- [ ] Priority system (high/medium/low)
- [ ] Task scheduling with time

#### ✅ AI Features
- [ ] Generate AI tasks
- [ ] Voice task extraction
- [ ] AI assistant questions
- [ ] Performance insights
- [ ] Task dictation

#### ✅ Voice & Accessibility
- [ ] Voice navigation commands
- [ ] Text-to-speech functionality
- [ ] Microphone permission handling
- [ ] Speech recognition accuracy
- [ ] Screen reader compatibility

#### ✅ Theming & UI
- [ ] Dark/light mode toggle
- [ ] Weather-responsive theming
- [ ] NASA APOD theme adaptation
- [ ] Mobile responsiveness
- [ ] Loading states
- [ ] 404 error handling

#### ✅ External Integrations
- [ ] Weather data display
- [ ] NASA APOD loading
- [ ] Real-time updates
- [ ] Gaming system functionality

### 🔧 Debugging Common Issues

#### 🚨 Database Connection Issues
```bash
# Check if PostgreSQL is running
npm run db:status

# Reset database
npm run db:init

# Verify environment variables
echo $NEON_DATABASE_URL
```

#### 🚨 Authentication Problems
```bash
# Verify Clerk configuration
# Check if domain is configured in Clerk dashboard
# Ensure frontend/backend keys match
```

#### 🚨 AI Features Not Working
```bash
# Check MistralAI API key
curl -H "Authorization: Bearer $MISTRAL_API_KEY" \
     https://api.mistral.ai/v1/models

# Monitor API quota in dashboard
```

#### 🚨 Voice Features Issues
```bash
# Check browser compatibility
# Ensure HTTPS (required for voice APIs)
# Test microphone permissions
```

### 📊 Performance Testing

#### Load Testing
```bash
# Install testing tools
npm install -g artillery

# Run load tests
artillery quick --count 10 --num 100 http://localhost:8787/api/tasks
```

#### Lighthouse Audit
```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse http://localhost:5173 --output html --output-path ./lighthouse-report.html
```

### 🌐 Production Testing

#### Build Testing
```bash
# Backend build
cd backend
npm run build
npm start

# Frontend build
cd frontend
npm run build
npm run preview
```

#### Environment Testing
```bash
# Test with production environment variables
NODE_ENV=production npm start
```

### Prerequisites
- Node.js 18.0.0 or higher
- npm or yarn package manager
- PostgreSQL database (or Neon account)
- API keys for external services

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Call2Code_final/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file with:
   ```env
   # Database
   NEON_DATABASE_URL=your_postgresql_connection_string
   
   # Authentication
   CLERK_SECRET_KEY=your_clerk_secret_key
   
   # External APIs
   OPENWEATHER_KEY=your_openweather_api_key
   NASA_KEY=your_nasa_api_key
   MISTRAL_API_KEY=your_mistral_api_key
   
   # Server Configuration
   PORT=8787
   NODE_ENV=development
   ```

4. **Database Setup**
   ```bash
   # Initialize database schema
   npm run db:init
   
   # Verify database connection
   npm run db:status
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   The backend will be available at `http://localhost:8787`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file with:
   ```env
   # Backend API
   VITE_API_URL=http://localhost:8787
   
   # Authentication
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   
   # External Services (if used in frontend)
   VITE_OPENWEATHER_KEY=your_openweather_api_key
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   The frontend will be available at `http://localhost:5173`

## 🔑 API Keys Setup

### Required API Keys

1. **Clerk Authentication**
   - Sign up at [clerk.com](https://clerk.com)
   - Create a new application
   - Get your publishable and secret keys

2. **MistralAI** (Backend)
   - Sign up at [mistral.ai](https://mistral.ai)
   - Generate an API key
   - Used for AI task generation and insights

3. **OpenWeatherMap** (Optional)
   - Sign up at [openweathermap.org](https://openweathermap.org/api)
   - Get a free API key
   - Used for weather-based task suggestions

4. **NASA API** (Optional)
   - Get a free key at [api.nasa.gov](https://api.nasa.gov)
   - Used for daily astronomy inspiration

### Database Setup (Neon)

1. **Create Neon Account**
   - Sign up at [neon.tech](https://neon.tech)
   - Create a new project
   - Get your connection string

2. **Database Schema**
   The schema will be automatically initialized when you run `npm run db:init`

## 🚀 Production Deployment

### Backend Deployment (Render/Railway/Vercel)

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Set environment variables** in your hosting platform

3. **Deploy** using your preferred platform's deployment process

### Frontend Deployment (Netlify/Vercel)

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Configure build settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Set environment variables** in your hosting platform

## 📚 API Documentation

### Authentication
All API endpoints require authentication via Clerk JWT tokens.

### Key Endpoints

#### Tasks
- `GET /api/tasks` - Get user's tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

#### AI Features
- `POST /api/ai/generate-tasks` - Generate AI tasks
- `POST /api/ai/extract-voice` - Extract tasks from voice
- `POST /api/ai/ask-kanban` - Ask AI assistant
- `GET /api/ai/performance-insights` - Get productivity insights
- `GET /api/ai/dictate-tasks` - Get task dictation

#### Plans
- `POST /api/plans/generate` - Generate AI daily plan
- `GET /api/plans/current` - Get current plan

#### External Data
- `GET /api/weather` - Get weather data
- `GET /api/apod` - Get NASA Astronomy Picture of the Day

## 🎮 Features Guide

### Using Voice Tasks
1. Click the microphone icon in the task manager
2. Speak your tasks naturally: "I need to write a report for 2 hours, high priority"
3. Review and approve the extracted tasks
4. AI will automatically structure and schedule them

### AI Task Generation
1. Click "Generate AI Tasks" in the Kanban board
2. Add custom instructions (optional)
3. AI creates personalized tasks based on your preferences and schedule
4. Tasks are automatically aligned with your daily plan

### AI Assistant
1. Open the KanbanAI dialog
2. Ask questions like "What should I work on next?" or "How's my progress?"
3. Get contextual, time-aware suggestions
4. Use "dictate my tasks" for verbal summaries

### Performance Insights
- View detailed productivity analytics
- Track completion rates and time patterns
- Get AI-powered improvement suggestions
- Monitor daily and weekly progress

## 🔧 Development Scripts

### Backend Scripts
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server
npm test            # Run API tests
npm run db:init     # Initialize database schema
npm run db:status   # Check database connection
```

### Frontend Scripts
```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify your `NEON_DATABASE_URL` is correct
   - Check if your IP is whitelisted in Neon dashboard
   - Run `npm run db:status` to test connection

2. **Authentication Errors**
   - Verify Clerk keys are correct
   - Check if the domain is configured in Clerk dashboard
   - Ensure keys match between frontend and backend

3. **AI Features Not Working**
   - Verify `MISTRAL_API_KEY` is set correctly
   - Check API quota/billing status
   - Monitor console for specific error messages

4. **Build Failures**
   - Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
   - Check Node.js version compatibility
   - Verify all environment variables are set

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Open an issue on GitHub
- Check the troubleshooting section above
- Review the API documentation

## 🙏 Acknowledgments

- **Clerk** for authentication services
- **MistralAI** for AI capabilities
- **OpenWeatherMap** for weather data
- **NASA** for astronomy pictures
- **shadcn/ui** for UI components
- **Neon** for serverless PostgreSQL

---

**Built with ❤️ using modern web technologies for maximum productivity and user experience.**
