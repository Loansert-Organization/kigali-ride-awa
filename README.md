# Kigali Ride AWA - Lifuti PWA

This project is a Progressive Web App for a ride-sharing service, built with React, TypeScript, Vite, and Supabase.

## 🚀 Features

### For Passengers
- **Quick Booking**: Book rides with just a few taps
- **Real-time Driver Tracking**: See available drivers on the map
- **Smart Matching**: AI-powered trip matching for optimal routes
- **Favorite Locations**: Save frequently visited places
- **Multiple Payment Options**: Cash and mobile money support
- **Trip History**: View past rides and receipts

### For Drivers
- **Trip Creation**: Post upcoming trips with customizable details
- **Passenger Requests**: Accept or decline ride requests
- **Earnings Dashboard**: Track daily, weekly, and monthly earnings
- **Route Optimization**: Smart suggestions for efficient routes
- **Online/Offline Toggle**: Control availability status

### Admin Features
- **Production Dashboard**: Real-time system monitoring
- **User Management**: Manage drivers and passengers
- **Trip Analytics**: Comprehensive trip and revenue analytics
- **AI-Powered Insights**: Smart analytics and predictions

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and builds
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **React Query** for data fetching
- **React Router** for navigation

### Backend
- **Supabase** for authentication and database
- **Edge Functions** for serverless API endpoints
- **PostgreSQL** with Row Level Security
- **Real-time subscriptions** for live updates

### Services
- **Google Maps API** for location services
- **WhatsApp Business API** for OTP authentication
- **Push Notifications** via service workers
- **AI Integration** for smart features

## 📋 Prerequisites

- Node.js 18+ and npm 9+
- Supabase CLI: `npm install -g supabase`

## 🚀 Getting Started

Follow these steps to get the development environment running.

### 1. Prerequisites

-   Node.js (v18 or later)
-   npm
-   Supabase CLI: `npm install -g supabase`

### 2. Installation

Clone the repository and install the dependencies.

```bash
git clone <repository-url>
cd kigali-ride-awa
npm install
```

### 3. Supabase Local Setup

The app requires a local Supabase instance to be running for database and Edge Function support.

**In a separate terminal**, run the following command from the project root:

```bash
supabase start
```

This will start the local Supabase services (database, auth, functions) and provide you with local API keys and a URL. **Keep this terminal running while you develop.**

### 4. Environment Variables

Create a `.env.local` file in the project root. Copy the local credentials provided by `supabase start` into it.

It should look like this:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE
```

**Note:** You need to obtain your own Google Maps API key.

### 5. Run the Application

Once the Supabase services are running and your `.env.local` file is set up, you can start the Vite development server.

```bash
npm run dev
```

The application will now be running on `http://localhost:5173` (or another port if 5173 is busy) and will be able to connect to your local Supabase instance.

## 📁 Project Structure

```
kigali-ride-awa/
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React contexts (Auth, Booking)
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Route pages
│   ├── services/       # API and external services
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
├── supabase/
│   ├── functions/      # Edge Functions
│   └── migrations/     # Database migrations
├── docs/               # Documentation
└── public/             # Static assets
```

## 🧪 Testing

We use Vitest and React Testing Library for testing.

### Run tests
```bash
npm test                 # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report
npm run test:ui         # Open Vitest UI
```

### Test Coverage Goals
- Overall: 80%+
- Critical paths: 95%+
- Utilities: 100%

## 📦 Building for Production

```bash
# Type check and build
npm run build

# Preview production build
npm run preview
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript compiler
- `npm test` - Run tests
- `npm run test:coverage` - Generate test coverage
- `npm run analyze` - Analyze bundle size

## 📚 Documentation

- [API Documentation](docs/api-documentation.md) - Complete API reference
- [Component Guide](docs/component-guide.md) - Component usage and examples
- [Testing Guide](docs/testing-guide.md) - Testing strategies and patterns
- [Architecture Overview](docs/architecture-improvements-phase2.md) - System architecture

## 🔐 Security

- Row Level Security (RLS) enabled on all database tables
- JWT-based authentication
- Secure API endpoints with proper authorization
- Input validation and sanitization
- Rate limiting on sensitive endpoints

## 🎯 Code Quality

- **TypeScript**: 100% type coverage (0 `any` types)
- **ESLint**: Configured for React and TypeScript
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks (if configured)

## 🚀 Deployment

The application can be deployed to various platforms:

### Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

### Netlify
```bash
npm run build
# Deploy the 'dist' folder
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Ensure all tests pass
- No `any` types without justification

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Maps powered by [Google Maps Platform](https://developers.google.com/maps)
- Backend by [Supabase](https://supabase.com)

## 📞 Support

For support, email support@kigaliride.rw or join our Slack channel.

---

**Made with ❤️ in Kigali, Rwanda**

## ✅ Key Development Scripts

-   `npm run dev`: Starts the Vite dev server.
-   `npm run build`: Builds the app for production.
-   `npm run lint`: Lints the code.
-   `npm run type-check`: Checks for TypeScript errors.
-   `supabase start`: Starts the local Supabase environment.
-   `supabase stop`: Stops the local Supabase environment.

*This README was updated to include essential local development setup instructions.*
