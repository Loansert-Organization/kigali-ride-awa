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

Run the Supabase CLI from the project root. This starts the local Postgres database, authentication and Edge Functions.

```bash
supabase start
```

Leave this process running in its terminal so the services remain available.

## 3. Configure environment variables

Create a `.env.local` file and copy the credentials printed by `supabase start` into it. A typical file looks like:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

## 4. Start the dev server

In a new terminal, run:

```bash
npm run dev
```

The app will be available at `http://localhost:5173` and will use the local Supabase instance.
