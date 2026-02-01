---
name: "Backend Models Standards"
description: "Enforces backend development standards and best practices for models, APIs, and data structures. Use when designing backend architecture, creating data models, or establishing API standards."
---

# Backend Models Standards

## What This Skill Does

Provides comprehensive guidelines for backend model design, API structure, and data layer architecture following industry best practices.

## Prerequisites

- Understanding of backend frameworks (Express, Fastify, NestJS, etc.)
- Database knowledge (SQL/NoSQL)
- RESTful API principles

## Quick Start

### Model Structure
```typescript
// Standard model structure
interface User {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### API Standards
- Use RESTful naming conventions
- Implement proper HTTP status codes
- Include pagination for list endpoints
- Validate input data

## Best Practices

### 1. Model Design
- Use UUIDs for primary keys
- Include audit fields (createdAt, updatedAt)
- Implement soft deletes where appropriate
- Normalize data relationships

### 2. API Structure
- Version your APIs (/api/v1/)
- Use consistent naming (kebab-case)
- Implement proper error responses
- Document with OpenAPI/Swagger

### 3. Validation
- Validate at the boundary
- Use schema validation (Zod, Joi, class-validator)
- Sanitize user inputs
- Handle edge cases
