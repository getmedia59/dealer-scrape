# API Documentation

This document outlines the REST API endpoints available in the Vehicle Marketplace Scraping Service.

## Base URL

All API endpoints are relative to:
https://your-domain.com/api

For local development:
http://localhost:3000


## Authentication

All API endpoints (except authentication endpoints) require authentication. Include a valid JWT token in the Authorization header:
Authorization: Bearer <jwt_token>


You can obtain a JWT token using the authentication endpoints.

## Response Format

All responses follow a standard format:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

Or in case of an error:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

## API Endpoints

### Authentication

#### POST /auth/register

Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "User Name"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "User Name"
    }
  },
  "error": null
}
```

#### POST /auth/login

Log in an existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "User Name"
    },
    "token": "jwt-token"
  },
  "error": null
}
```

#### POST /auth/logout

Log out the current user.

**Response:**
```json
{
  "success": true,
  "data": null,
  "error": null
}
```

#### POST /auth/reset-password

Request a password reset.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Password reset email sent"
  },
  "error": null
}
```

### Dealers

#### GET /dealers

Get a list of all dealers.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search term (optional)
- `status`: Filter by status (optional, 'active' or 'inactive')

**Response:**
```json
{
  "success": true,
  "data": {
    "dealers": [
      {
        "id": "dealer-uuid",
        "name": "Example Dealer",
        "website_url": "https://example.com",
        "status": "active",
        "created_at": "2023-06-01T12:00:00Z",
        "updated_at": "2023-06-01T12:00:00Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "pages": 5
    }
  },
  "error": null
}
```

#### GET /dealers/:id

Get a specific dealer by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "dealer": {
      "id": "dealer-uuid",
      "name": "Example Dealer",
      "website_url": "https://example.com",
      "status": "active",
      "created_at": "2023-06-01T12:00:00Z",
      "updated_at": "2023-06-01T12:00:00Z"
    }
  },
  "error": null
}
```

#### POST /dealers

Create a new dealer.

**Request Body:**
```json
{
  "name": "New Dealer",
  "website_url": "https://newdealer.com",
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "dealer": {
      "id": "new-dealer-uuid",
      "name": "New Dealer",
      "website_url": "https://newdealer.com",
      "status": "active",
      "created_at": "2023-06-01T12:00:00Z",
      "updated_at": "2023-06-01T12:00:00Z"
    }
  },
  "error": null
}
```

#### PUT /dealers/:id

Update an existing dealer.

**Request Body:**
```json
{
  "name": "Updated Dealer Name",
  "website_url": "https://updatedurl.com",
  "status": "inactive"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "dealer": {
      "id": "dealer-uuid",
      "name": "Updated Dealer Name",
      "website_url": "https://updatedurl.com",
      "status": "inactive",
      "created_at": "2023-06-01T12:00:00Z",
      "updated_at": "2023-06-02T12:00:00Z"
    }
  },
  "error": null
}
```

#### DELETE /dealers/:id

Delete a dealer.

**Response:**
```json
{
  "success": true,
  "data": null,
  "error": null
}
```

### Scraper Configurations

#### GET /scrapers

Get a list of all scraper configurations.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `dealer_id`: Filter by dealer ID (optional)
- `is_template`: Filter templates only (optional, boolean)

**Response:**
```json
{
  "success": true,
  "data": {
    "scrapers": [
      {
        "id": "scraper-uuid",
        "dealer_id": "dealer-uuid",
        "name": "Example Scraper",
        "is_template": false,
        "created_at": "2023-06-01T12:00:00Z",
        "updated_at": "2023-06-01T12:00:00Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "pages": 3
    }
  },
  "error": null
}
```

#### GET /scrapers/:id

Get a specific scraper configuration by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "scraper": {
      "id": "scraper-uuid",
      "dealer_id": "dealer-uuid",
      "name": "Example Scraper",
      "config_json": {
        "selectors": {
          "vehicle_container": ".vehicle-listing",
          "make": ".vehicle-make",
          "model": ".vehicle-model",
          "price": ".vehicle-price"
        },
        "pagination": {
          "type": "button",
          "selector": ".pagination-next"
        }
      },
      "is_template": false,
      "created_at": "2023-06-01T12:00:00Z",
      "updated_at": "2023-06-01T12:00:00Z"
    }
  },
  "error": null
}
```

#### POST /scrapers

Create a new scraper configuration.

**Request Body:**
```json
{
  "dealer_id": "dealer-uuid",
  "name": "New Scraper",
  "config_json": {
    "selectors": {
      "vehicle_container": ".vehicle-card",
      "make": ".vehicle-make",
      "model": ".vehicle-model",
      "price": ".vehicle-price"
    },
    "pagination": {
      "type": "button",
      "selector": ".load-more"
    }
  },
  "is_template": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "scraper": {
      "id": "new-scraper-uuid",
      "dealer_id": "dealer-uuid",
      "name": "New Scraper",
      "config_json": {
        "selectors": {
          "vehicle_container": ".vehicle-card",
          "make": ".vehicle-make",
          "model": ".vehicle-model",
          "price": ".vehicle-price"
        },
        "pagination": {
          "type": "button",
          "selector": ".load-more"
        }
      },
      "is_template": false,
      "created_at": "2023-06-01T12:00:00Z",
      "updated_at": "2023-06-01T12:00:00Z"
    }
  },
  "error": null
}
```

#### PUT /scrapers/:id

Update an existing scraper configuration.

**Request Body:**
```json
{
  "name": "Updated Scraper",
  "config_json": {
    "selectors": {
      "vehicle_container": ".vehicle-item",
      "make": ".make",
      "model": ".model",
      "price": ".price"
    }
  }
}
```

#### DELETE /scrapers/:id

Delete a scraper configuration.

### Jobs

#### GET /jobs

Get a list of all scraping jobs.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `status`: Filter by status (optional)
- `config_id`: Filter by scraper configuration ID (optional)
- `dealer_id`: Filter by dealer ID (optional)

#### GET /jobs/:id

Get a specific job by ID.

#### POST /jobs

Create and schedule a new job.

**Request Body:**
```json
{
  "config_id": "scraper-uuid",
  "scheduled_at": "2023-06-02T12:00:00Z",
  "recurrence": {
    "type": "daily",
    "time": "12:00",
    "days": ["monday", "wednesday", "friday"]
  }
}
```

#### PUT /jobs/:id/cancel

Cancel a scheduled or running job.

#### GET /jobs/:id/vehicles

Get vehicles collected by a specific job.

### Vehicles

#### GET /vehicles

Get a list of all vehicles.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `dealer_id`: Filter by dealer ID (optional)
- `job_id`: Filter by job ID (optional)
- `status`: Filter by status (optional)
- `search`: Search term (optional)

#### GET /vehicles/:id

Get a specific vehicle by ID.

#### PUT /vehicles/:id

Update a vehicle record.

#### DELETE /vehicles/:id

Delete a vehicle record.

### Statistics

#### GET /stats/dashboard

Get dashboard statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "activeJobs": 5,
    "completedJobs": 120,
    "totalVehicles": 5780,
    "newVehiclesToday": 87,
    "jobSuccessRate": 98.5,
    "recentJobs": [
      {
        "id": "job-uuid",
        "dealer_name": "Example Dealer",
        "status": "completed",
        "vehicle_count": 145,
        "completed_at": "2023-06-01T14:30:00Z"
      }
    ]
  },
  "error": null
}
```

#### GET /stats/jobs

Get job statistics.

#### GET /stats/dealers

Get dealer statistics.

## Rate Limiting

API requests are rate limited to 100 requests per minute per user. If you exceed this limit, you'll receive a 429 Too Many Requests response with headers indicating when you can retry.

## Error Codes

- `AUTH_REQUIRED`: Authentication is required
- `INVALID_CREDENTIALS`: Invalid login credentials
- `PERMISSION_DENIED`: User doesn't have permission
- `RESOURCE_NOT_FOUND`: Requested resource not found
- `VALIDATION_ERROR`: Input validation failed
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `SERVER_ERROR`: Internal server error

## Versioning

The API is versioned through the URL path. The current version is v1: /api/v1/resource


When breaking changes are introduced, a new version path will be created.