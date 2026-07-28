import { vi } from 'vitest'

vi.mock('@tensorflow/tfjs', () => ({
  ready: vi.fn(() => Promise.resolve()),
  setBackend: vi.fn(() => Promise.resolve()),
}))

vi.mock('@tensorflow/tfjs-vis', () => ({}))

import { render, screen } from '@testing-library/react'
import App from './App'

test('renders step button', () => {
  render(<App />)
  const stepButton = screen.getByText('Step')
  expect(stepButton).toBeInTheDocument()
})
