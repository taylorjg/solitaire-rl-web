import { useEffect, useRef, useState } from 'react'
import Table from 'react-bootstrap/Table'
import * as tfvis from '@tensorflow/tfjs-vis'
import { useElapsedTime, usePerSecondCounter, useCallbackWrapper } from './customHooks'
import Board from './Board'
import * as rl from './solitaire-rl/index.mjs'
import * as U from './solitaire-rl/utils.mjs'
import './TrainingView.css'

const TrainingView = () => {

  const [selectedEndCondition, setSelectedEndCondition] = useState("endCondition1")
  const [training, setTraining] = useState(false)
  const [trainingOutcome, setTrainingOutcome] = useState(0)
  const [cancelled, setCancelled] = useState(false)
  const [stats, setStats] = useState(null)
  const [chartVisible, setChartVisible] = useState(false)
  const [movingAverageAvailable, setMovingAverageAvailable] = useState(false)
  const [showBoard, setShowBoard] = useState(false)
  const [entries, setEntries] = useState([])

  const chartElementRef = useRef()
  const chartValuesRef = useRef([[], []])

  const [elapsedTime, updateTimer, resetTimer] = useElapsedTime()
  const [eps, updateEps, resetEps] = usePerSecondCounter()

  const onTrainingSuccess = (model, actions) => {
    let agent
    switch (selectedEndCondition) {
      case 'endCondition0':
        agent = rl.makeHardcodedActionsAgent(actions)
        break
      case 'endCondition1':
      default:
        agent = rl.makeTrainedAgentFromModel(model, 0)
        break
      case 'endCondition2':
        agent = rl.makeTrainedAgentFromModel(model, 1)
        break
    }

    const agentActions = []
    while (!agent.done) {
      const { actionIndex } = agent.step()
      agentActions.push(actionIndex)
    }
    console.log(`agentActions: ${JSON.stringify(agentActions)}`)

    setTrainingOutcome(1)
    setShowBoard(true)
    setEntries(agent.entries())
  }

  const onTrainingFailure = model => {
    setTrainingOutcome(2)
  }

  const onProgress = stats => {
    setStats(stats)
    updateTimer()
    updateEps()
  }

  const onCheckCancelled = () => cancelled

  const onTrainingSuccessCallbackWrapper = useCallbackWrapper(onTrainingSuccess)
  const onTrainingFailureCallbackWrapper = useCallbackWrapper(onTrainingFailure)
  const onProgressCallbackWrapper = useCallbackWrapper(onProgress)
  const onCheckCancelledCallbackWrapper = useCallbackWrapper(onCheckCancelled)

  const resetChartValues = () => {
    chartValuesRef.current = [[], []]
  }

  const showChart = () => {
    const data = {
      values: chartValuesRef.current,
      series: ['Last', 'Best']
    }
    const opts = {
      zoomToFit: true,
      height: 300,
      xLabel: 'Episode',
      yLabel: 'Final Reward (moving average)',
      seriesColors: ['blue', 'red']
    }
    tfvis.render.linechart(chartElementRef.current, data, opts)
  }

  useEffect(() => {
    if (stats) {
      if (stats.finalRewardMA !== Number.NEGATIVE_INFINITY) {
        setMovingAverageAvailable(true)
        const x = stats.episode
        const [lastValues, bestValues] = chartValuesRef.current
        lastValues.push({ x, y: stats.finalRewardMA })
        bestValues.push({ x, y: stats.bestFinalRewardMA })
        if (chartVisible) {
          showChart()
        }
      }
    }
  }, [stats, chartVisible])

  const onTrain = async () => {
    try {
      if (training) return
      setTraining(true)
      setTrainingOutcome(0)
      setCancelled(false)
      resetTimer()
      resetEps()
      setChartVisible(false)
      resetChartValues()
      setMovingAverageAvailable(false)
      setShowBoard(false)
      setEntries([])

      const callbacks = {
        trainingSuccess: onTrainingSuccessCallbackWrapper,
        trainingFailure: onTrainingFailureCallbackWrapper,
        progress: onProgressCallbackWrapper,
        checkCancelled: onCheckCancelledCallbackWrapper
      }

      await rl.train(selectedEndCondition, callbacks)

      resetEps()
      setChartVisible(true)
    } finally {
      setTraining(false)
    }
  }

  const onCancel = () => {
    setCancelled(true)
    resetEps()
    setChartVisible(true)
  }

  const onShowChart = () => {
    setChartVisible(true)
  }

  const onHideChart = () => {
    setChartVisible(false)
  }

  const onChangeSelectedFred = e =>
    setSelectedEndCondition(e.target.value)

  const getBackgroundClass = () => {
    switch (trainingOutcome) {
      case 0:
      default:
        return ''
      case 1:
        return 'bg-success'
      case 2:
        return 'bg-danger'
    }
  }

  return (
    <div className="training-content">
      <div className="training-content-inner">
        <div className="training-warning">
          NOTE: currently, training doesn't always work! I aim to make it more reliable.
          </div>
        <div>
          Stop training when:
          <select value={selectedEndCondition} onChange={onChangeSelectedFred} disabled={training}>
            <option value="endCondition0">First solution is found</option>
            <option value="endCondition1">Model consistently solves puzzle</option>
            <option value="endCondition2">Model consistently solves puzzle (after random first move)</option>
          </select>
        </div>
        <div className="training-controls">
          <div className="training-controls-left">
            {
              training
                ? <button onClick={onCancel}>Cancel</button>
                : <button onClick={onTrain}>Train</button>
            }
            {
              stats && (
                chartVisible
                  ? <button disabled={!movingAverageAvailable} onClick={onHideChart}>Hide Chart</button>
                  : <button disabled={!movingAverageAvailable} onClick={onShowChart}>Show Chart</button>
              )
            }
          </div>
          <div className="training-controls-right">
            {stats && <div className="training-timer">{U.formatElapsedTime(elapsedTime)}</div>}
          </div>
        </div>
        {stats && (
          <Table className={getBackgroundClass()} size="sm">
            <tbody>
              <tr>
                <td className="training-stats-label">Episode</td>
                <td className="training-stats-value">{stats.episode}</td>
              </tr>
              <tr>
                <td className="training-stats-label">Episodes per second</td>
                <td className="training-stats-value">{eps.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="training-stats-label">&epsilon;</td>
                <td className="training-stats-value">{stats.epsilon.toFixed(5)}</td>
              </tr>
              <tr>
                <td className="training-stats-label">Last Final Reward</td>
                <td className="training-stats-value">{stats.finalReward}</td>
              </tr>
              <tr>
                <td className="training-stats-label">Best Final Reward</td>
                <td className="training-stats-value">{stats.bestFinalReward}</td>
              </tr>
              <tr>
                <td className="training-stats-label">Last Final Reward (MA)</td>
                <td className="training-stats-value">{stats.finalRewardMA.toFixed(3)}</td>
              </tr>
              <tr>
                <td className="training-stats-label">Best Final Reward (MA)</td>
                <td className="training-stats-value">{stats.bestFinalRewardMA.toFixed(3)}</td>
              </tr>
            </tbody>
          </Table>
        )}
        {chartVisible && <div ref={chartElementRef} className="training-stats-chart" />}
        {showBoard && <Board resetBoard={false} entries={entries} interactive={false} />}
      </div>
    </div>
  )
}

export default TrainingView
