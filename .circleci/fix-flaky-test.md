# Fixing Flaky Tests Guide - Savings App

## Overview
This guide provides best practices for fixing flaky tests in our React + Vite + Vitest application. Flaky tests are tests that sometimes pass and sometimes fail due to timing issues, race conditions, or other non-deterministic behavior.

## Command Restrictions

- You MUST NOT use `sleep()` or `setTimeout()` for delays in test scripts
- You MUST NOT use `eval()` as it poses security risks
- Avoid using shell wildcards in destructive operations (e.g., `rm -rf *`)
- Never use fixed timeouts like `await new Promise(resolve => setTimeout(resolve, 1000))`

## Code Style Preferences

- Prefer functional components over class components in React
- Use explicit error handling over try-catch-all patterns
- Use async/await syntax over Promise chains for readability
- Always use `waitFor()` instead of fixed timeouts for async operations
- Prefer `findBy*` queries over `getBy*` for async elements

## Security Considerations

- Always flag use of `dangerouslySetInnerHTML` in React components
- Highlight any potential XSS vulnerabilities in user input handling
- Point out hardcoded credentials or API keys
- Flag any use of `eval()` or `Function()` constructors
- Ensure proper sanitization of user inputs in forms

## Documentation Standards

- Complex async operations MUST include explanatory comments
- Flaky test fixes MUST document the root cause and solution
- Test setup and teardown MUST be clearly documented

## Common Flaky Test Patterns & Solutions

### 1. Race Conditions with Async Operations

#### ❌ **Problematic Code:**
```javascript
test('should handle rapid form submissions', async () => {
  const user = userEvent.setup()
  render(<App />)
  
  const amountInput = screen.getByTestId('amount-input')
  const addButton = screen.getByTestId('add-spending-btn')
  
  await user.type(amountInput, '10.00')
  
  // Rapid clicks without waiting - causes race conditions
  await user.click(addButton)
  await user.click(addButton) // Second click races with first
  await user.click(addButton) // Third click also races
  
  // This assertion fails due to race condition
  const spendingItems = screen.getAllByTestId('spending-item')
  expect(spendingItems).toHaveLength(1) // FLAKY!
})
```

#### ✅ **Fixed Code:**
```javascript
test('should handle rapid form submissions', async () => {
  const user = userEvent.setup()
  render(<App />)
  
  const amountInput = screen.getByTestId('amount-input')
  const addButton = screen.getByTestId('add-spending-btn')
  
  await user.type(amountInput, '10.00')
  
  // Wait for each operation to complete
  await user.click(addButton)
  await waitFor(() => {
    expect(screen.getByTestId('spending-item')).toBeInTheDocument()
  })
  
  // Clear form and try again
  await user.clear(amountInput)
  await user.type(amountInput, '20.00')
  await user.click(addButton)
  
  // Wait for DOM updates
  await waitFor(() => {
    const spendingItems = screen.getAllByTestId('spending-item')
    expect(spendingItems).toHaveLength(2)
  })
})
```

### 2. Timing Issues with State Updates

#### ❌ **Problematic Code:**
```javascript
test('should handle async state updates', async () => {
  const user = userEvent.setup()
  render(<App />)
  
  const amountInput = screen.getByTestId('amount-input')
  const addButton = screen.getByTestId('add-spending-btn')
  
  await user.type(amountInput, '25.50')
  await user.click(addButton)
  
  // Immediately check - state might not be updated yet
  expect(screen.getByTestId('spending-item')).toBeInTheDocument() // FLAKY!
})
```

#### ✅ **Fixed Code:**
```javascript
test('should handle async state updates', async () => {
  const user = userEvent.setup()
  render(<App />)
  
  const amountInput = screen.getByTestId('amount-input')
  const addButton = screen.getByTestId('add-spending-btn')
  
  await user.type(amountInput, '25.50')
  await user.click(addButton)
  
  // Wait for state update to complete
  await waitFor(() => {
    expect(screen.getByTestId('spending-item')).toBeInTheDocument()
  })
  
  // Additional verification
  expect(screen.getByText('$25.50 MXN')).toBeInTheDocument()
})
```

## Best Practices for React + Vitest Testing

### 1. Use `waitFor` for Async Operations
```javascript
// Always wrap async assertions in waitFor
await waitFor(() => {
  expect(screen.getByText('Expected Text')).toBeInTheDocument()
})
```

### 2. Use `act` for State Updates
```javascript
import { act } from '@testing-library/react'

// Wrap state updates in act
await act(async () => {
  await user.click(button)
})
```

### 3. Use `findBy` Queries for Async Elements
```javascript
// Instead of getBy (synchronous)
const element = await screen.findByText('Loading Complete')
expect(element).toBeInTheDocument()
```

### 4. Proper User Event Setup
```javascript
// Always setup user events properly
const user = userEvent.setup()
await user.type(input, 'text')
await user.click(button)
```

### 5. Clean Up Between Tests
```javascript
afterEach(() => {
  cleanup() // Clean up DOM
  vi.clearAllMocks() // Clear mocks
})
```

## Common Anti-Patterns to Avoid

### ❌ **Don't Use Fixed Timeouts**
```javascript
// BAD: Fixed timeout
await new Promise(resolve => setTimeout(resolve, 1000))
```

### ✅ **Use waitFor Instead**
```javascript
// GOOD: Wait for specific condition
await waitFor(() => {
  expect(element).toBeInTheDocument()
})
```

### ❌ **Don't Check State Immediately**
```javascript
// BAD: Immediate check
await user.click(button)
expect(element).toBeInTheDocument() // Might not be ready
```

### ✅ **Wait for State Updates**
```javascript
// GOOD: Wait for state update
await user.click(button)
await waitFor(() => {
  expect(element).toBeInTheDocument()
})
```

## Debugging Flaky Tests

### 1. Add Logging
```javascript
test('debug flaky test', async () => {
  console.log('Test started')
  
  await user.click(button)
  console.log('Button clicked')
  
  await waitFor(() => {
    const element = screen.queryByTestId('element')
    console.log('Element found:', !!element)
    expect(element).toBeInTheDocument()
  })
})
```

### 2. Use `screen.debug()` for DOM Inspection
```javascript
test('debug DOM state', async () => {
  await user.click(button)
  
  // Print current DOM state
  screen.debug()
  
  await waitFor(() => {
    expect(element).toBeInTheDocument()
  })
})
```

### 3. Increase Timeout for Slow Operations
```javascript
test('slow operation', async () => {
  await waitFor(() => {
    expect(element).toBeInTheDocument()
  }, { timeout: 5000 }) // 5 second timeout
})
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Only Passing Tests
```bash
npm test -- src/App.test.jsx
```

### Run with Coverage
```bash
npm run test:coverage
```

### Run in Watch Mode
```bash
npm test -- --watch
```

## Resources

- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest Documentation](https://vitest.dev/)
- [User Event Documentation](https://testing-library.com/docs/user-event/intro/)
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)