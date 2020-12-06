import { render, screen } from '@testing-library/react'
import App from './App'

test('renders step button', () => {
  render(<App />)
  const stepButton = screen.getByText('Step')
  expect(stepButton).toBeInTheDocument()
})
