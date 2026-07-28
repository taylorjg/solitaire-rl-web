jest.mock('@tensorflow/tfjs', () => ({
  __esModule: true,
  default: {
    ready: jest.fn(() => Promise.resolve()),
    setBackend: jest.fn(() => Promise.resolve()),
  },
}))

import { render, screen } from '@testing-library/react'
import App from './App'

test('renders step button', () => {
  render(<App />)
  const stepButton = screen.getByText('Step')
  expect(stepButton).toBeInTheDocument()
})
