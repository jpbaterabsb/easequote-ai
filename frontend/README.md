# EaseQuote AI - Frontend

Frontend application for EaseQuote AI quote management system.

## Tech Stack

- **Vite 7.x** - Build tool
- **React 19** - UI library
- **TypeScript** - Type safety
- **SWC** - Fast compiler
- **TailwindCSS 4.x** - Styling
- **Shadcn/UI** - Component library (Radix UI)
- **Zustand** - State management
- **React Router DOM** - Routing
- **React Hook Form + Zod** - Form handling & validation
- **Supabase** - Backend (Auth, Database, Storage)
- **date-fns** - Date utilities
- **Lucide React** - Icons

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file in the root directory:
```bash
VITE_SUPABASE_URL=https://njkizbytxifukrhnogxh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qa2l6Ynl0eGlmdWtyaG5vZ3hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NDU5MTIsImV4cCI6MjA3ODIyMTkxMn0._OFWQaTACIU8i0OgKEpX3GIAQd8WXjwu2n8vQ8rovX8
VITE_ENV=development
```

3. Run development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── components/     # React components
│   └── ui/        # Shadcn/UI components
├── lib/           # Utilities and configurations
│   ├── supabase/  # Supabase client
│   └── utils.ts   # Helper functions
├── store/         # Zustand stores
├── App.tsx        # Main app component
└── main.tsx       # Entry point
```

## Path Aliases

- `@/` - Points to `src/`

Example: `import { Button } from '@/components/ui/button'`
