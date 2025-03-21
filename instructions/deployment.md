# Deployment Guide

This document provides comprehensive instructions for deploying the Vehicle Marketplace Scraping Service to different environments.

## Deployment Environments

### Development Environment

The development environment is used by developers for active development and testing.

#### Setup Instructions

1. **Local Setup**
   ```bash
   # Clone the repository
   git clone https://github.com/your-org/vehicle-scraper.git
   cd vehicle-scraper
   
   # Install dependencies
   npm install
   
   # Copy environment variables template
   cp .env.example .env.local
   
   # Start development server
   npm run dev
   ```

2. **Environment Variables**
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
   - `FIRECRAWL_API_KEY`: API key for Firecrawl
   - `NEXT_PUBLIC_APP_URL`: Development URL (usually http://localhost:3000)

3. **Development Database**
   - Use a dedicated Supabase project for development
   - Initialize the database schema using the provided migrations
   - Seed the database with sample data for testing

### Staging Environment

The staging environment mirrors the production setup and is used for testing before deploying to production.

#### Deployment Steps

1. **Vercel Setup**
   - Create a new project in Vercel
   - Connect to your Git repository
   - Configure build settings:
     - Build Command: `npm run build`
     - Output Directory: `.next`
     - Install Command: `npm install`

2. **Environment Variables**
   - Configure the same environment variables as development
   - Use staging-specific values for:
     - Supabase project
     - Firecrawl project
     - `NEXT_PUBLIC_APP_URL`: Staging URL
     - Add `NEXT_PUBLIC_ENVIRONMENT=staging`

3. **Supabase Setup**
   - Create a dedicated staging Supabase project
   - Run migrations to set up the database schema
   - Configure auth settings:
     - Set site URL to match staging URL
     - Configure redirect URLs
     - Set up email templates

4. **Deployment**
   - Automatic deployment from the `staging` branch
   - Alternatively, manual deployment:
     ```bash
     npm run build
     vercel --prod
     ```

### Production Environment

The production environment is the live system used by end users.

#### Deployment Steps

1. **Vercel Setup**
   - Similar to staging, but connect to the `main` branch
   - Configure custom domain if needed
   - Enable production optimizations:
     - Serverless function concurrency
     - Edge caching
     - Image optimization

2. **Environment Variables**
   - Production Supabase project credentials
   - Production Firecrawl credentials
   - `NEXT_PUBLIC_APP_URL`: Production URL
   - `NEXT_PUBLIC_ENVIRONMENT=production`
   - Add any production-specific feature flags

3. **Production Database**
   - Create a production Supabase project
   - Run migrations to set up the schema
   - Set up database policies for security
   - Configure scheduled backups

4. **Deployment**
   - Merge to `main` branch to trigger deployment
   - Use a pull request workflow with approvals
   - Manual deployment command if needed:
     ```bash
     npm run build
     vercel --prod
     ```

## CI/CD Pipeline

### GitHub Actions Workflow

Create a `.github/workflows/main.yml` file with the following content:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, staging ]
  pull_request:
    branches: [ main, staging ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run test

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/staging'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_STAGING }}
          vercel-args: '--prod'

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_PRODUCTION }}
          vercel-args: '--prod'
```

### Continuous Integration

1. **Automated Testing**
   - Run linting checks
   - Execute unit tests
   - Run integration tests
   - Verify build process

2. **Pull Request Checks**
   - Require passing CI checks
   - Enforce code review approvals
   - Check for test coverage thresholds

### Continuous Deployment

1. **Staging Deployment**
   - Automatic deployment to staging on merge to `staging` branch
   - Run E2E tests after deployment
   - Notify team of successful deployment

2. **Production Deployment**
   - Automatic deployment to production on merge to `main` branch
   - Require manual approval before deployment
   - Run smoke tests after deployment
   - Monitor for post-deployment issues

## Database Migrations

### Running Migrations

1. **Development**
   ```bash
   npm run migration:dev
   ```

2. **Staging/Production**
   - Migrations run automatically as part of the CI/CD pipeline
   - Backup database before running migrations
   - Test migrations on staging first

### Creating New Migrations

```bash
# Create a new migration
npm run migration:create -- --name add_new_table

# Apply pending migrations
npm run migration:up

# Revert last migration
npm run migration:down
```

## Monitoring and Logging

### Setup Monitoring

1. **Vercel Analytics**
   - Enable in Vercel dashboard
   - Monitor serverless function performance
   - Track API usage

2. **Sentry Integration**
   - Add Sentry SDK to the project
   - Configure error tracking
   - Set up performance monitoring

3. **Uptime Monitoring**
   - Set up health check endpoints
   - Configure external monitoring service
   - Set up alerts for downtime

### Logging Configuration

1. **Structured Logging**
   - Use a structured logging format
   - Include request IDs for tracking
   - Log important events and errors

2. **Log Storage**
   - Configure log retention policies
   - Set up log analysis tools
   - Create dashboards for monitoring

## Scaling Considerations

### Horizontal Scaling

- Vercel automatically scales serverless functions
- Configure function concurrency settings
- Optimize database queries for scale

### Database Scaling

- Monitor database performance
- Set up database connection pooling
- Consider read replicas for heavy read loads
- Implement caching for frequently accessed data

### Job Processing

- Scale Firecrawl resources as needed
- Implement queue management for job processing
- Monitor job execution times and resource usage

## Disaster Recovery

### Backup Procedures

1. **Database Backups**
   - Configure automated Supabase backups
   - Store backups in secure location
   - Test restoration process regularly

2. **Application State**
   - Ensure stateless application design
   - Document recovery procedures
   - Maintain infrastructure as code

### Recovery Plan

1. **Database Restore**
   ```bash
   # Restore database from backup
   supabase db restore --project-ref <project-id> --backup-id <backup-id>
   ```

2. **Application Deployment**
   - Deploy specific version from Git
   - Verify application functionality
   - Roll back if issues are detected

## Security Considerations

### SSL Configuration

- Enforce HTTPS for all connections
- Configure proper SSL certificates
- Set up HTTP to HTTPS redirects

### Authentication Security

- Review Supabase auth settings
- Configure password policies
- Implement MFA for admin accounts
- Set appropriate JWT expiration times

### API Security

- Use rate limiting for API endpoints
- Implement proper CORS configuration
- Validate all input data
- Use parameterized queries for database access

## Post-Deployment Verification

### Smoke Tests

Run basic smoke tests after deployment:
```bash
# Run smoke tests
npm run test:smoke
```

### Health Checks

- Verify API endpoints return correct responses
- Check database connections
- Test authentication flows
- Verify integration with Firecrawl

## Rollback Procedures

### Application Rollback

```bash
# Deploy previous version
vercel --prod --cwd . --scope <team> --yes --name vehicle-scraper --build-env NEXT_PUBLIC_APP_VERSION=<previous-version>
```

### Database Rollback

- Restore from pre-deployment backup
- Run downgrade migrations if applicable
- Verify data integrity after rollback

## Maintenance Windows

- Schedule maintenance during low-traffic periods
- Communicate maintenance to users in advance
- Implement maintenance mode page
- Minimize downtime during updates

---

This deployment guide should be updated as the infrastructure evolves. Always test deployment procedures on staging before applying to production.