import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import App from './App'

describe('Flaky Test Example', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Race Condition Test', () => {
    it('should handle rapid form submissions correctly', async () => {
      const user = userEvent.setup()
      render(<App />)
      
      const amountInput = screen.getByTestId('amount-input')
      const addButton = screen.getByTestId('add-spending-btn')
      
      // This test is flaky because it doesn't wait for async operations
      // The rapid clicks can cause race conditions
      await user.type(amountInput, '10.00')
      
      // Rapid clicks without waiting - this causes flakiness
      await user.click(addButton)
      await user.click(addButton) // Second click happens before first completes
      await user.click(addButton) // Third click also races
      
      // This assertion might fail because we don't know how many items were actually added
      // due to the race condition
      const spendingItems = screen.getAllByTestId('spending-item')
      expect(spendingItems).toHaveLength(1) // This will be flaky!
    })

    it('should handle async state updates properly', async () => {
      const user = userEvent.setup()
      render(<App />)
      
      const amountInput = screen.getByTestId('amount-input')
      const addButton = screen.getByTestId('add-spending-btn')
      
      await user.type(amountInput, '25.50')
      
      // Click without waiting for the state update to complete
      await user.click(addButton)
      
      // Immediately check for the spending item - this might fail if the state
      // hasn't updated yet (race condition)
      expect(screen.getByTestId('spending-item')).toBeInTheDocument()
    })

    it('should handle multiple rapid category changes', async () => {
      const user = userEvent.setup()
      render(<App />)
      
      const categorySelect = screen.getByTestId('category-select')
      const amountInput = screen.getByTestId('amount-input')
      const addButton = screen.getByTestId('add-spending-btn')
      
      // Rapid category changes without waiting
      await user.selectOptions(categorySelect, 'Personal')
      await user.selectOptions(categorySelect, 'Auto')
      await user.selectOptions(categorySelect, 'House')
      
      await user.type(amountInput, '15.00')
      await user.click(addButton)
      
      // This might be flaky because we don't know which category was actually selected
      // when the form was submitted due to the rapid changes
      const spendingItem = screen.getByTestId('spending-item')
      expect(spendingItem).toContainElement(screen.getByText('House'))
    })
  })

  describe('Timing-Based Flaky Test', () => {
    it('should wait for DOM updates after form submission', async () => {
      const user = userEvent.setup()
      render(<App />)
      
      const amountInput = screen.getByTestId('amount-input')
      const addButton = screen.getByTestId('add-spending-btn')
      
      await user.type(amountInput, '30.00')
      await user.click(addButton)
      
      // This test is flaky because it doesn't wait for the DOM to update
      // The spending item might not be rendered yet
      const spendingItems = screen.getAllByTestId('spending-item')
      expect(spendingItems).toHaveLength(1)
      
      // Check if the amount is displayed correctly
      expect(screen.getByText('$30.00 MXN')).toBeInTheDocument()
    })

    it('should handle filter changes with timing issues', async () => {
      const user = userEvent.setup()
      render(<App />)
      
      // Add some spendings first
      const amountInput = screen.getByTestId('amount-input')
      const categorySelect = screen.getByTestId('category-select')
      const addButton = screen.getByTestId('add-spending-btn')
      
      // Add General spending
      await user.type(amountInput, '10.00')
      await user.click(addButton)
      
      // Add Personal spending
      await user.selectOptions(categorySelect, 'Personal')
      await user.type(amountInput, '20.00')
      await user.click(addButton)
      
      // Now test filtering - this might be flaky if the filter doesn't update immediately
      const filterSelect = screen.getByTestId('category-filter')
      await user.selectOptions(filterSelect, 'Personal')
      
      // This assertion might fail if the filter hasn't updated the DOM yet
      const spendingItems = screen.getAllByTestId('spending-item')
      expect(spendingItems).toHaveLength(1)
    })
  })
})
