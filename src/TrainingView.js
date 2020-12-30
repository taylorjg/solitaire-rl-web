import { useCallback, useEffect, useRef, useState } from 'react'
import Table from 'react-bootstrap/Table'
import * as tfvis from '@tensorflow/tfjs-vis'
import * as rl from './solitaire-rl'
import './TrainingView.css'

const TrainingView = () => {

  const [training, setTraining] = useState(false)
  const [stats, setStats] = useState(null)
  const [chartVisible, setChartVisible] = useState(false)
  const [movingAverageAvailable, setMovingAverageAvailable] = useState(false)
  const [timerData, setTimerData] = useState({
    start: null,
    elapsed: null,
    elapsedFormatted: null
  })

  const cancelledRef = useRef(false)
  const chartDataLastRef = useRef([])
  const chartDataBestRef = useRef([])
  const chartElementRef = useRef()

  const formatElapsedTime = ms => {
    const s = ms / 1000
    const mm = Math.floor(s / 60).toString().padStart(2, '0')
    const ss = Math.floor(s % 60).toString().padStart(2, '0')
    return `${mm}:${ss}`
  }

  const resetTimer = () => {
    const elapsed = 0
    setTimerData({
      start: performance.now(),
      elapsed,
      elapsedFormatted: formatElapsedTime(elapsed)
    })
  }

  const updateTimer = useCallback(() => {
    setTimerData(timerData => {
      const elapsed = performance.now() - timerData.start
      return {
        ...timerData,
        elapsed,
        elapsedFormatted: formatElapsedTime(elapsed)
      }
    })
  }, [])

  const onSave = _model => {
    // TODO: upload model to server...
  }

  const onProgress = stats => {
    setStats(stats)
    updateTimer()
  }

  const showChart = useCallback(() => {
    const data = {
      values: [chartDataLastRef.current, chartDataBestRef.current],
      series: ['Last', 'Best']
    }
    const opts = {
      zoomToFit: true,
      height: 300,
      xLabel: 'Episode',
      yLabel: 'Final Reward (MA)',
      seriesColors: ['blue', 'red']
    }
    tfvis.render.linechart(chartElementRef.current, data, opts)
  }, [])

  useEffect(() => {
    if (stats) {
      if (stats.finalRewardMA !== Number.NEGATIVE_INFINITY) {
        setMovingAverageAvailable(true)
        const x = stats.episode + 1
        const pt1 = { x, y: stats.finalRewardMA }
        const pt2 = { x, y: stats.bestFinalRewardMA }
        chartDataLastRef.current.push(pt1)
        chartDataBestRef.current.push(pt2)
        if (chartVisible) {
          showChart()
        }
      }
    }
  }, [stats, chartVisible, showChart])

  const onTrain = async () => {
    try {
      if (training) return
      setTraining(true)
      cancelledRef.current = false
      chartDataLastRef.current = []
      chartDataBestRef.current = []
      setChartVisible(false)
      setMovingAverageAvailable(false)
      resetTimer()
      await rl.train(onSave, onProgress, cancelledRef)
      setChartVisible(true)
    } finally {
      setTraining(false)
    }
  }

  const onCancel = () => {
    cancelledRef.current = true
    setChartVisible(true)
  }

  const onShowChart = () => {
    setChartVisible(true)
  }

  const onHideChart = () => {
    setChartVisible(false)
  }

  return (
    <div className="training-content">
      <div className="training-content-inner">
        <div className="training-warning">
          NOTE: currently, training doesn't always work! I aim to make it more reliable.
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
            {stats && <div className="training-timer">{timerData.elapsedFormatted}</div>}
          </div>
        </div>
        {stats && (
          <Table size="sm">
            <tbody>
              <tr>
                <td className="training-stats-label">Episode</td>
                <td className="training-stats-value">{stats.episode}</td>
              </tr>
              <tr>
                <td className="training-stats-label">Epsilon</td>
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
      </div>
    </div>
  )
}

export default TrainingView
