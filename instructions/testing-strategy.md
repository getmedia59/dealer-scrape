# Testing Strategy

This document outlines the testing approach for the Vehicle Marketplace Scraping Service to ensure high-quality, reliable code.

## Testing Levels

### Unit Testing

Unit tests focus on testing individual components in isolation.

#### Coverage Targets
- Utility functions: 90%+ coverage
- React components: 80%+ coverage
- API route handlers: 85%+ coverage

#### Focus Areas
- Form validation logic
- Data transformation functions
- Authentication helper functions
- UI component rendering
- State management utilities

#### Tools
- Jest: Testing framework
- React Testing Library: Component testing
- MSW (Mock Service Worker): API mocking

#### Example Unit Test (React Component)

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { DealerForm } from './DealerForm';

describe('DealerForm', () => {
  it('should validate required fields', async () => {
    render(<DealerForm onSubmit={jest.fn()} />);
    
    // Submit empty form
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    
    // Check for validation messages
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/website url is required/i)).toBeInTheDocument();
  });
  
  it('should call onSubmit with form data when valid', async () => {
    const onSubmitMock = jest.fn();
    render(<DealerForm onSubmit={onSubmitMock} />);
    
    // Fill form
    fireEvent.change(screen.getByLabelText(/name/i), { 
      target: { value: 'Test Dealer' } 
    });
    fireEvent.change(screen.getByLabelText(/website url/i), { 
      target: { value: 'https://example.com' } 
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    
    // Check if onSubmit was called with correct data
    expect(onSubmitMock).toHaveBeenCalledWith({
      name: 'Test Dealer',
      websiteUrl: 'https://example.com',
      status: 'active'
    });
  });
});
```

### Integration Testing

Integration tests verify that different parts of the application work together correctly.

#### Focus Areas
- API endpoints
- Database interactions
- Authentication flows
- Form submissions and API integration
- Component compositions

#### Tools
- Jest: Testing framework
- Supertest: API testing
- Test database: Isolated Supabase instance for testing

#### Example Integration Test (API Route)

```typescript
import { createMocks } from 'node-mocks-http';
import dealersHandler from '../../../pages/api/dealers';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn()
}));

describe('/api/dealers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should return dealers list for GET request', async () => {
    // Mock Supabase query response
    const mockFromFn = jest.fn().mockReturnThis();
    const mockSelectFn = jest.fn().mockReturnThis();
    const mockOrderFn = jest.fn().mockReturnThis();
    const mockPaginateFn = jest.fn().mockReturnThis();
    const mockDataFn = jest.fn().mockResolvedValue({
      data: [
        { id: '1', name: 'Dealer 1', website_url: 'https://dealer1.com', status: 'active' },
        { id: '2', name: 'Dealer 2', website_url: 'https://dealer2.com', status: 'inactive' }
      ],
      error: null
    });
    
    (createClient as jest.Mock).mockReturnValue({
      from: mockFromFn,
      select: mockSelectFn,
      order: mockOrderFn,
      paginate: mockPaginateFn,
      data: mockDataFn
    });
    
    // Create mocked req/res
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    });
    
    // Call API route handler
    await dealersHandler(req, res);
    
    // Assertions
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      data: {
        dealers: [
          { id: '1', name: 'Dealer 1', website_url: 'https://dealer1.com', status: 'active' },
          { id: '2', name: 'Dealer 2', website_url: 'https://dealer2.com', status: 'inactive' }
        ],
        pagination: { page: 1, limit: 20, total: 2, pages: 1 }
      },
      error: null
    });
  });
});
```

### End-to-End Testing

E2E tests validate complete user flows from start to finish.

#### Critical Flows to Test
- User registration and login
- Creating a dealer and scraper configuration
- Scheduling and running a job
- Viewing and exporting collected data
- Configuration of notifications
- Admin panel operations

#### Tools
- Playwright: E2E testing framework
- Test environments: Dedicated staging environment

#### Example E2E Test

```typescript
import { test, expect } from '@playwright/test';

test.describe('Dealer Management', () => {
  test.beforeEach(async ({ page }) => {
    // Log in first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await expect(page).toHaveURL(/dashboard/);
  });
  
  test('should create a new dealer', async ({ page }) => {
    // Navigate to dealers page
    await page.click('text=Dealers');
    
    // Click add dealer button
    await page.click('text=Add Dealer');
    
    // Fill the form
    await page.fill('input[name="name"]', 'Test Auto Dealer');
    await page.fill('input[name="websiteUrl"]', 'https://testautodealer.com');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Verify success message
    await expect(page.locator('.toast')).toContainText('Dealer created successfully');
    
    // Verify dealer appears in the list
    await expect(page.locator('table')).toContainText('Test Auto Dealer');
  });
});
```

### Performance Testing

Performance tests evaluate system behavior under various load conditions.

#### Focus Areas
- API response times
- Concurrent job execution
- Database query performance
- UI rendering performance

#### Tools
- k6: Load testing
- Lighthouse: Frontend performance
- Database query analyzers

#### Example Performance Test (k6)

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 20 },  // Stay at 20 users for 1 minute
    { duration: '30s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p95<500'], // 95% of requests should complete within 500ms
  },
};

export default function() {
  const BASE_URL = 'https://staging-app.example.com';
  const TOKEN = 'test-token'; // Use a token for a test user
  
  // GET dealers list
  const dealersResponse = http.get(`${BASE_URL}/api/dealers`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
    },
  });
  
  check(dealersResponse, {
    'dealers status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  sleep(1);
}
```

## Test Data Management

### Test Database

- Use a separate Supabase instance for testing
- Reset database to a known state before test runs
- Seed database with test fixtures

### Test Fixtures

- Create reusable test fixtures for common entities (users, dealers, etc.)
- Store fixtures in a dedicated directory
- Use factories to generate test data with reasonable defaults

### Mocking Strategy

- Mock external services (Firecrawl, email service, etc.)
- Use Mock Service Worker for API mocking
- Create controlled environments for integration tests

## CI/CD Integration

### Test Execution in CI

- Run unit and integration tests on every pull request
- Run E2E tests on staging before production deployment
- Run performance tests on a weekly schedule

### Test Reports

- Generate and store test reports in CI
- Track test coverage over time
- Alert on significant test failures or coverage drops

### Quality Gates

- Require minimum test coverage (80%+)
- Require all tests to pass before merging
- Require performance tests to meet thresholds

## Testing Best Practices

### General Guidelines

1. Write tests before or alongside code (TDD where possible)
2. Keep tests simple and focused
3. Use descriptive test names
4. Avoid test interdependence
5. Clean up after tests

### Component Testing

1. Test behavior, not implementation
2. Focus on user interactions
3. Verify accessibility
4. Test edge cases and error states

### API Testing

1. Test all HTTP methods
2. Verify authentication and authorization
3. Test validation and error responses
4. Test with various query parameters

### Database Testing

1. Test queries directly
2. Verify transactions work correctly
3. Test data migrations
4. Check performance of complex queries

## Monitoring and Continuous Improvement

### Monitoring Test Health

- Track flaky tests
- Monitor test execution time
- Review test coverage regularly

### Test Maintenance

- Update tests when requirements change
- Refactor tests to reduce duplication
- Remove obsolete tests

### Continuous Improvement

- Regular test review sessions
- Address technical debt in tests
- Enhance test automation infrastructure