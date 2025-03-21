# Tech Stack & Architecture Document

## Core Technologies

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Component Library**: shadcn UI (based on Radix UI)
- **State Management**: React Context API + Zustand for complex state
- **Forms**: React Hook Form with Zod validation
- **Data Fetching**: SWR or TanStack Query
- **Charts/Visualization**: Recharts or Tremor

### Backend
- **API Routes**: Next.js API routes (serverless functions)
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage for file uploads
- **Scraping Engine**: Firecrawl integration via MCP
- **Caching**: Redis (optional for high-performance needs)

### DevOps & Infrastructure
- **Hosting**: Vercel for Next.js application
- **Database Hosting**: Supabase managed hosting
- **CI/CD**: GitHub Actions
- **Monitoring**: Vercel Analytics + custom monitoring
- **Error Tracking**: Sentry

## Architecture Flow

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│               │     │               │     │               │
│  Next.js App  │◄────┤  Supabase     │◄────┤  Firecrawl    │
│  (Frontend)   │     │  (Database)   │     │  (Scraping)   │
│               │     │               │     │               │
└───────┬───────┘     └───────────────┘     └───────────────┘
        │                                            ▲
        │                                            │
        │                                            │
        │         ┌───────────────┐                  │
        └────────►│  Next.js API  ├──────────────────┘
                  │  (Backend)    │
                  │               │
                  └───────────────┘
```

## Database Schema

### Users Table
- id (UUID, PK)
- email (string, unique)
- name (string)
- avatar_url (string, nullable)
- role (string: 'admin', 'user')
- created_at (timestamp)
- last_login (timestamp)

### Dealers Table
- id (UUID, PK)
- name (string)
- website_url (string)
- status (string: 'active', 'inactive')
- created_by (UUID, FK to users)
- created_at (timestamp)
- updated_at (timestamp)

### Scraper_Configs Table
- id (UUID, PK)
- dealer_id (UUID, FK to dealers)
- name (string)
- config_json (jsonb)
- is_template (boolean)
- created_by (UUID, FK to users)
- created_at (timestamp)
- updated_at (timestamp)

### Scraping_Jobs Table
- id (UUID, PK)
- config_id (UUID, FK to scraper_configs)
- status (string: 'pending', 'running', 'completed', 'failed')
- scheduled_at (timestamp)
- started_at (timestamp, nullable)
- completed_at (timestamp, nullable)
- result_stats (jsonb)
- error_details (jsonb, nullable)
- created_by (UUID, FK to users)

### Vehicles Table
- id (UUID, PK)
- dealer_id (UUID, FK to dealers)
- job_id (UUID, FK to scraping_jobs)
- external_id (string)
- data (jsonb)
- images (array)
- status (string: 'new', 'updated', 'removed')
- created_at (timestamp)
- updated_at (timestamp)

## Authentication Flow

1. User registers or logs in via Supabase Auth UI
2. Supabase handles authentication and returns JWT
3. JWT is stored in browser and used for authenticated requests
4. Next.js middleware verifies JWT on protected routes
5. Role-based access control enforced at API and UI levels

## Scraping Process Flow

1. User configures a scraper for a dealer website
2. User schedules a job or triggers immediate execution
3. Next.js API routes communicate with Firecrawl MCP
4. Firecrawl executes the scraping job
5. Results are processed and normalized
6. Normalized data is stored in Supabase
7. User receives notification of job completion

## Development Workflow

1. Set up local development environment with:
   - Next.js project
   - Supabase local development
   - Environment variables configuration
2. Implement features in order of the implementation roadmap
3. Use Git feature branches with conventional commits
4. Implement automated testing (unit, integration, E2E)
5. Use pull requests with code reviews
6. CI pipeline for build verification and testing
7. Staged deployments (development, staging, production)

## Environment Configuration

### Development Environment
- Local Next.js dev server
- Local or development Supabase instance
- Firecrawl sandbox environment
- Environment variables for local configuration

### Production Environment
- Vercel hosted Next.js application
- Production Supabase instance
- Production Firecrawl instance
- Secrets management via Vercel/Supabase

## Getting Started Instructions

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up environment variables (copy `.env.example` to `.env.local`)
4. Set up Supabase and Firecrawl MCPs
5. Run development server with `npm run dev`
6. Follow feature implementation according to roadmap

This document should be regularly updated as the project evolves. 