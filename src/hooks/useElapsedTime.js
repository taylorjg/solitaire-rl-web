import { useState } from 'react'

export const useElapsedTime = () => {

  const [start, setStart] = useState(0)
  const [elapsed, setElapsed] = useState(0)

  const update = () => {
    const now = performance.now()
    setElapsed(now - start)
  }

  const reset = () => {
    setStart(performance.now())
    setElapsed(0)
  }

  return [elapsed, update, reset]
}
