import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Alert from 'react-bootstrap/Alert'
import Board from './Board'
import * as rl from './solitaire-rl/index.mjs'
import './AgentPlayView.css'

const modelPath = '/models/model.json'

const useQuery = () => new URLSearchParams(useLocation().search)

const AgentPlayView = () => {

  const query = useQuery()
  const [selectedAgent, setSelectedAgent] = useState(() => query.get('agent') || 'random')
  const [agent, setAgent] = useState(null)
  const [resetBoard, setResetBoard] = useState(true)
  const [entries, setEntries] = useState(agent?.entries() ?? [])
  const [action, setAction] = useState(null)
  const [running, setRunning] = useState(false)
  const [fetchingModel, setFetchingModel] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [finalReward, setFinalReward] = useState(null)

  const runTimerRef = useRef(null)

  console.log(`errorMessage: ${errorMessage}`)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => clearInterval(runTimerRef.current)
  }, [])

  useEffect(() => makeAgent(selectedAgent), [selectedAgent])

  const onStep = () => {
    const stepResult = agent.step()
    setResetBoard(false)
    setEntries(stepResult.entries)
    setAction(stepResult.action)
    if (stepResult.done) {
      setFinalReward(stepResult.reward)
    }
  }

  const onRun = () => {
    setRunning(true)
    onStep()
    runTimerRef.current = setInterval(() => {
      if (agent.done) {
        clearInterval(runTimerRef.current)
        setRunning(false)
      } else {
        onStep()
      }
    }, 1000)
  }

  const onStop = () => {
    clearInterval(runTimerRef.current)
    setRunning(false)
  }

  const onReset = useCallback(() => {
    if (agent) {
      agent.reset()
      setResetBoard(true)
      setEntries(agent.entries())
      setAction(null)
      setFinalReward(null)
    }
  }, [agent])

  useEffect(onReset, [onReset])

  const makeAgent = async agentName => {
    switch (agentName) {

      case 'trained': {
        setFetchingModel(true)
        try {
          setErrorMessage(null)
          const agent = await rl.makeTrainedAgentFromModelPath(modelPath)
          setAgent(agent)
        } catch (error) {
          setErrorMessage(error.message)
          setSelectedAgent('random')
        } finally {
          setFetchingModel(false)
        }
        break
      }

      case 'random':
      default: {
        const agent = rl.makeRandomAgent()
        setAgent(agent)
        break
      }
    }
  }

  const onChangeSelectedAgent = e =>
    setSelectedAgent(e.target.value)

  return (
    <div className="agent-play-content">
      <div className="board-wrapper">

        <div className="board-controls-above">
          <select value={selectedAgent} onChange={onChangeSelectedAgent} disabled={running || fetchingModel}>
            <option value="random">Random Agent</option>
            <option value="trained">Trained Agent</option>
          </select>
        </div>

        <Board
          resetBoard={resetBoard}
          entries={entries}
          action={action}
          interactive={false}
        />

        <div className="board-controls-below">
          <div>
            <button type="button" disabled={agent === null || agent.done || running} onClick={onStep}>Step</button>
            {running
              ? <button type="button" onClick={onStop}>Stop</button>
              : <button type="button" disabled={agent === null || agent.done} onClick={onRun}>Run</button>
            }
            <button type="button" disabled={agent === null || running} onClick={onReset}>Reset</button>
          </div>
          {finalReward !== null && <div>Final Reward: {finalReward}</div>}
        </div>

      </div>

      {
        errorMessage && (
          <div className="alert-wrapper">
            <Alert transition={false} variant="danger" dismissible onClose={() => setErrorMessage(null)}>
              {errorMessage}
            </Alert>
          </div>
        )
      }
    </div>
  )
}

export default AgentPlayView
