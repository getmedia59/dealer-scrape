# Project Setup Guide

## Prerequisites

- Node.js 18.x or later
- npm 9.x or later
- Git
- Supabase account
- Firecrawl account

## Initial Setup

### 1. Create Next.js Project

```bash
npx create-next-app@latest vehicle-scraper --typescript --eslint --tailwind --app
cd vehicle-scraper
```

### 2. Install Required Dependencies

```bash
# UI Components and Styling
npm install @radix-ui/react-icons @radix-ui/react-slot class-variance-authority clsx tailwindcss-animate lucide-react
npm install -D @tailwindcss/forms @tailwindcss/typography

# Form Handling
npm install react-hook-form @hookform/resolvers zod

# Data Fetching and State Management
npm install swr zustand immer

# Authentication and Database
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js

# UI Components
npm install @shadcn/ui
npx shadcn-ui init

# Data Visualization
npm install recharts @tremor/react

# Date/Time Handling
npm install date-fns
```

### 3. Set Up Supabase

1. Create a new Supabase project from the [Supabase Dashboard](https://app.supabase.io/)
2. Create a `.env.local` file in the project root with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
3. Set up database schema using the SQL provided in the tech-stack.md file

### 4. Set Up Firecrawl MCP

1. Create a Firecrawl account
2. Set up a new project in Firecrawl
3. Add your API key to `.env.local`:
   ```
   FIRECRAWL_API_KEY=your-firecrawl-api-key
   FIRECRAWL_PROJECT_ID=your-firecrawl-project-id
   ```

### 5. Configure Next.js Middleware for Authentication

Create a `middleware.ts` file in the root directory:

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  // If no session and trying to access protected routes
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }
  
  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
}
```

### 6. Set Up Project Structure

Create the following directory structure:
app/
├── (auth)/
│ ├── login/
│ ├── register/
│ └── reset-password/
├── (dashboard)/
│ ├── dashboard/
│ ├── dealers/
│ ├── jobs/
│ ├── scrapers/
│ └── settings/
├── api/
├── components/
│ ├── dealers/
│ ├── jobs/
│ ├── layout/
│ ├── scrapers/
│ └── ui/
├── lib/
│ ├── actions/
│ ├── hooks/
│ ├── supabase/
│ ├── firecrawl/
│ └── utils/
└── public/


### 7. Start Development Server

```bash
npm run dev
```

Your application should now be running at http://localhost:3000

## Next Steps

Follow the implementation roadmap in the guide.md file to progressively build out the features of your application, starting with Phase 1: Foundation.