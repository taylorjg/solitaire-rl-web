import { useState } from 'react'
import * as rl from './solitaire-rl'
import * as U from './solitaire-rl/utils'
import './TrainView.css'

const TITLES = 'Episode  Epsilon  Reward (Best)  Reward MA (Best)'
const UNDERLINES = '-------  -------  -------------  ----------------'

const TrainView = () => {

  const [messages, setMessages] = useState(Array(10).fill(''))
  const [training, setTraining] = useState(false)
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
  }

  const onProgress = stats => {
    const message =
      `${U.padInt(stats.episode, 7)}` +
      `  ` +
      `${U.padReal(stats.epsilon, 3)}`.padStart(7) +
      `  ` +
      `${U.padInt(stats.finalReward, 3)} (${U.padInt(stats.bestFinalReward, 3)})`.padEnd(13) +
      `  ` +
      `${U.padReal(stats.finalRewardMA, 3, 8)} (${U.padReal(stats.bestFinalRewardMA, 3, 8)})`.padEnd(16)
    setMessages(messages => [].concat(messages.slice(-9)).concat(message))
    updateTimer()
  }

  const onTrain = async () => {
    setTraining(true)
    startTimer()
    await rl.train(onSave, onProgress)
    setTraining(false)
  }

  return (
    <div className="train-content">
      <div className="train-content-inner">
        <div className="train-warning">
          NOTE: currently, training is very slow and doesn't always work!
          </div>
        <div className="train-controls">
          <button disabled={training} onClick={onTrain}>Train</button>
          {training && (
            <div className="train-timer">{timerData.elapsedFormatted}</div>
          )}
        </div>
        <pre className="train-messages">
          {[TITLES, UNDERLINES, ...messages].join('\n')}
        </pre>
      </div>
    </div>
  )
}

export default TrainView
