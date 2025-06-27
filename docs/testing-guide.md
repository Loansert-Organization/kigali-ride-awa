# Kigali Ride AWA - Testing Guide

## Overview

This guide covers the testing strategy, tools, and best practices for the Kigali Ride AWA application. We use Vitest as our testing framework along with React Testing Library for component testing.

## Testing Stack

- **Vitest**: Fast unit test framework with native ESM support
- **React Testing Library**: Testing utilities for React components
- **@testing-library/user-event**: User interaction simulation
- **@testing-library/jest-dom**: Custom matchers for DOM elements
- **@vitest/ui**: Interactive UI for test debugging

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Open interactive UI
npm run test:ui
```

## Test Structure Example

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  const defaultProps = {
    title: 'Test Title',
    onAction: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly', () => {
    render(<MyComponent {...defaultProps} />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    const user = userEvent.setup();
    render(<MyComponent {...defaultProps} />);
    
    await user.click(screen.getByRole('button'));
    
    expect(defaultProps.onAction).toHaveBeenCalledOnce();
  });
});
```

## Testing Utilities

The custom render function in `src/test/utils.tsx` wraps components with all necessary providers:

```typescript
import { render } from '@/test/utils';

// Automatically provides:
// - React Router
// - React Query
// - Auth Context
// - Booking Context
// - Toast Provider
```

## Best Practices

1. **Test behavior, not implementation**
2. **Use accessible queries** (getByRole > getByLabelText > getByText)
3. **Mock external dependencies**
4. **Test edge cases** (loading, error, empty states)
5. **Keep tests focused and isolated**
6. **Use descriptive test names**

## Coverage Guidelines

- Overall: 80%+
- Critical paths: 95%+ (auth, payments, bookings)
- Utilities: 100%
- UI Components: 70%+ 