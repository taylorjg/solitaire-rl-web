import { useRef, useState } from 'react'

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

export const useCallbackWrapper = cb => {
  const cbRef = useRef(null)
  cbRef.current = cb
  const cbWrapper = (...args) => {
    if (cbRef.current) {
      cbRef.current(...args)
    }
  }
  return cbWrapper
}
