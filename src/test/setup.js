import '@testing-library/jest-dom'

// Mock window.alert for tests
global.alert = vi.fn() 