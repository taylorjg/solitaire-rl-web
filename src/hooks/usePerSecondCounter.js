import { useState } from 'react'

export const usePerSecondCounter = () => {

  const [prevTime, setPrevTime] = useState(0)
  const [frameCount, setFrameCount] = useState(0)
  const [fps, setFps] = useState(0)

  const increment = () => {
    const newFrameCount = frameCount + 1
    setFrameCount(newFrameCount)
    const now = performance.now()
    const delta = now - prevTime
    if (delta >= 1000) {
      setFps(newFrameCount * 1000 / delta)
      setPrevTime(now)
      setFrameCount(0)
    }
  }

  const reset = () => {
    setPrevTime(performance.now())
    setFrameCount(0)
    setFps(0)
  }

  return [fps, increment, reset]
}
