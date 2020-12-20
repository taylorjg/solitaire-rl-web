import { useRef, useState } from 'react'
import Table from 'react-bootstrap/Table'
import * as rl from './solitaire-rl'
import * as U from './solitaire-rl/utils'
import './TrainView.css'

const TrainView = () => {

  const [training, setTraining] = useState(false)
  const [stats, setStats] = useState(null)
  const cancelledRef = useRef(false)

  const [timerData, setTimerData] = useState({
    start: null,
    elapsed: null,
    elapsedFormatted: null
  })

  const formatElapsedTime = ms => {
    const s = ms / 1000
    const mm = Math.floor(s / 60).toString().padStart(2, '0')
    const ss = Math.floor(s % 60).toString().padStart(2, '0')
    return `${mm}:${ss}`
  }

  const startTimer = () => {
    const elapsed = 0
    setTimerData({
      start: performance.now(),
      elapsed,
      elapsedFormatted: formatElapsedTime(elapsed)
    })
  }

  const updateTimer = () => {
    setTimerData(timerData => {
      const elapsed = performance.now() - timerData.start
      return {
        ...timerData,
        elapsed,
        elapsedFormatted: formatElapsedTime(elapsed)
      }
    })
  }

  const onSave = _model => {
    // TODO: upload model to server...
  }

  const onProgress = stats => {
    setStats(stats)
    updateTimer()
  }

  const onTrain = async () => {
    try {
      if (training) return
      setTraining(true)
      cancelledRef.current = false
      startTimer()
      await rl.train(onSave, onProgress, cancelledRef)
    } finally {
      setTraining(false)
    }
  }

  const onCancel = () => {
    cancelledRef.current = true
  }

  return (
    <div className="train-content">
      <div className="train-content-inner">
        <div className="train-warning">
          NOTE: currently, training is very slow and doesn't always work!
          </div>
        <div className="train-controls">
          {
            training
              ? <button onClick={onCancel}>Cancel</button>
              : <button onClick={onTrain}>Train</button>
          }
          {training && (
            <div className="train-timer">{timerData.elapsedFormatted}</div>
          )}
        </div>
        {stats && (
          <Table>
            <tbody>
              <tr>
                <td className="train-stats-label">Episode</td>
                <td className="train-stats-value">{U.padInt(stats.episode, 5)}</td>
              </tr>
              <tr>
                <td className="train-stats-label">Epsilon</td>
                <td className="train-stats-value">{U.padReal(stats.epsilon, 5)}</td>
              </tr>
              <tr>
                <td className="train-stats-label">Last Final Reward</td>
                <td className="train-stats-value">{U.padInt(stats.finalReward, 3)}</td>
              </tr>
              <tr>
                <td className="train-stats-label">Best Final Reward</td>
                <td className="train-stats-value">{U.padInt(stats.bestFinalReward, 3)}</td>
              </tr>
              <tr>
                <td className="train-stats-label">Last Final Reward (MA)</td>
                <td className="train-stats-value">{U.padReal(stats.finalRewardMA, 3)}</td>
              </tr>
              <tr>
                <td className="train-stats-label">Best Final Reward (MA)</td>
                <td className="train-stats-value">{U.padReal(stats.bestFinalRewardMA, 3)}</td>
              </tr>
            </tbody>
          </Table>
        )}
      </div>
    </div>
  )
}

export default TrainView
