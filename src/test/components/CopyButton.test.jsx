import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CopyButton from '../../components/CopyButton'

describe('CopyButton', () => {
  it('renders button with copy icon', () => {
    render(<CopyButton value="test-value" label="Test" />)
    const button = screen.getByRole('button', { name: /copy/i })
    expect(button).toBeInTheDocument()
  })

  it('copies value to clipboard when clicked', async () => {
    const mockWriteText = vi.fn().mockResolvedValue()
    global.navigator.clipboard = { writeText: mockWriteText }
    
    render(<CopyButton value="test-value" label="Test" />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(mockWriteText).toHaveBeenCalledWith('test-value')
  })

  it('does not render when value is empty', () => {
    const { container } = render(<CopyButton value="" label="Test" />)
    expect(container.firstChild).toBeNull()
  })
})
