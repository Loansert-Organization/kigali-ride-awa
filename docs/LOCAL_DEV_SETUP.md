# Local Development Setup

Follow these steps to run the project locally with Supabase and the Vite development server.

## Prerequisites

- Node.js 18+ with npm
- Supabase CLI installed (`npm install -g supabase`)

## 1. Install dependencies

```bash
npm install
```

## 2. Start Supabase

Start the Supabase services from the project root:

```bash
supabase start
```

Leave this command running so the database and auth services remain available.

## 3. Configure environment variables

Create a `.env.local` file in the project root and paste the credentials printed by `supabase start`.
A minimal file looks like:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

## 4. Start the development server

In a new terminal, run:

```bash
npm run dev
```

The app will be available at `http://localhost:5173` and will connect to your local Supabase instance.
