# Kigali Ride AWA

A comprehensive ride-sharing platform for Kigali, Rwanda, connecting drivers and passengers through a modern web application built with React, TypeScript, and Supabase.

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
- Supabase account
- Google Maps API key
- WhatsApp Business API access (for OTP)

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/kigali-ride-awa.git
cd kigali-ride-awa
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file based on `.env.example`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### 4. Run the development server
```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

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
