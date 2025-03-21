# Contributing Guidelines

Thank you for your interest in contributing to the Vehicle Marketplace Scraping Service. This document outlines the standards and workflows we use to ensure high-quality, maintainable code.

## Code of Conduct

- Be respectful and inclusive in your communication
- Give and receive constructive feedback gracefully
- Focus on solving problems rather than assigning blame
- Communicate clearly and consider the perspectives of others

## Development Workflow

### Git Workflow

We follow a GitHub Flow workflow:

1. Create a new branch from `main` for each feature or bugfix
   - Use a descriptive name with the format: `feature/description` or `fix/description`
   - Example: `feature/dealer-management` or `fix/auth-redirect-loop`

2. Make regular commits with clear, descriptive messages
   - Follow the [Conventional Commits](https://www.conventionalcommits.org/) format
   - Example: `feat(dealers): add dealer creation form`

3. Open a Pull Request (PR) when ready for review
   - Fill out the PR template with details about your changes
   - Link relevant issues using GitHub keywords (fixes, closes, etc.)

4. Ensure CI checks pass before requesting review
   - All tests should pass
   - Linting should pass
   - Type checking should pass

5. Address review feedback and update your PR
   - Respond to all comments
   - Make requested changes or explain why they shouldn't be made

6. Squash and merge once approved
   - Maintain a clean commit history in the main branch

### Branch Protection

The `main` branch is protected and requires:
- Passing CI checks
- At least one approving review
- No merge conflicts

## Coding Standards

### General Guidelines

- Follow the DRY (Don't Repeat Yourself) principle
- Write self-documenting code with clear variable and function names
- Keep functions small and focused on a single responsibility
- Prioritize readability over cleverness

### TypeScript

- Use TypeScript for all code
- Define interfaces for all data structures
- Use strict type checking
- Avoid using `any` type when possible
- Use enums for predefined sets of values

### React & Next.js

- Use functional components with hooks
- Follow the React hooks rules
- Keep components small and focused
- Use the Next.js App Router conventions
- Implement proper error boundaries

### CSS & Styling

- Use Tailwind CSS for styling
- Follow the shadcn/ui component patterns
- Maintain a consistent design language
- Use CSS variables for theming when appropriate

## Testing Requirements

### Unit Tests

- Write unit tests for all business logic functions
- Aim for >80% test coverage for utility functions
- Use Jest for testing framework

### Integration Tests

- Write integration tests for API routes
- Test database interactions with a test database
- Ensure authentication flows work correctly

### E2E Tests

- Write end-to-end tests for critical user flows
- Use Playwright for E2E testing
- Test on multiple browsers (Chrome, Firefox, Safari)

### Test Guidelines

- Tests should be isolated and not depend on other tests
- Mock external services for unit and integration tests
- Keep test code as clean as production code
- Use meaningful assertions and error messages

## Documentation Requirements

### Code Documentation

- Add JSDoc comments for functions and interfaces
- Document non-obvious behavior or edge cases
- Include examples for complex functions

### User Documentation

- Update user manual when adding or changing features
- Provide screenshots for UI changes
- Document API changes

### Architecture Documentation

- Update tech-stack.md when changing architectural components
- Document database schema changes
- Keep diagrams up-to-date

## Pull Request Process

1. Ensure you've followed the coding standards and testing requirements
2. Update documentation as needed
3. Fill out the PR template completely
4. Request review from appropriate team members
5. Address all feedback before merging

## Getting Help

If you need help or have questions:
- Check existing documentation first
- Ask questions in the project's communication channels
- Be specific about what you're trying to accomplish
- Share what you've already tried

Thank you for helping improve our project!