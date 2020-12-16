import { useEffect, useRef, useState } from 'react'
import Board from './Board'
import * as rl from './solitaire-rl'
import './AgentPlayView.css'

const modelPath = '/models/model.json'

const AgentPlayView = () => {

  const [agent, setAgent] = useState(null)
  const [previousEntries, setPreviousEntries] = useState(agent?.entries ?? [])
  const [action, setAction] = useState(null)
  const [resetBoard, setResetBoard] = useState(true)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (agent) {
      agent.reset()
      setPreviousEntries(agent.entries)
      setResetBoard(true)
      setAction(null)
    } else {
      setResetBoard(true)
      setPreviousEntries([])
      setAction(null)
    }
  }, [agent])

  const runInterval = useRef(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => clearInterval(runInterval.current)
  }, [])

  useEffect(() => changeAgent('randomAgent'), [])

  const onStep = () => {
    const stepResult = agent.step()
    setResetBoard(false)
    setPreviousEntries(stepResult.previousEntries)
    setAction(stepResult.action)
  }

  const onRun = () => {
    setRunning(true)
    onStep()
    runInterval.current = setInterval(() => {
      if (agent.done) {
        clearInterval(runInterval.current)
        setRunning(false)
      } else {
        onStep()
      }
    }, 1000)
  }

  const onStop = () => {
    clearInterval(runInterval.current)
    setRunning(false)
  }

  const onReset = () => {
    if (resetBoard) {
      setPreviousEntries(agent.entries)
    } else {
      agent.reset()
      setPreviousEntries(agent.entries)
      setResetBoard(true)
      setAction(null)
    }
  }

  const changeAgent = async agentName => {
    switch (agentName) {
      case 'trainedAgent': {
        const agent = await rl.makeTrainedAgent(modelPath)
        setAgent(agent)
        break
      }
      case 'randomAgent':
      default: {
        const agent = rl.makeRandomAgent()
        setAgent(agent)
        break
      }
    }
  }

  return (
    <div className="agent-play-content">
      <div className="board-controls-above">
        <select onChange={e => changeAgent(e.target.value)} disabled={running}>
          <option value="randomAgent">Random Agent</option>
          <option value="trainedAgent">Trained Agent</option>
        </select>
      </div>

      <Board
        resetBoard={resetBoard}
        previousEntries={previousEntries}
        action={action}
      />

      <div className="board-controls-below">
        <button type="button" disabled={agent === null || agent.done || running} onClick={onStep}>Step</button>
        {running
          ? <button type="button" onClick={onStop}>Stop</button>
          : <button type="button" disabled={agent === null || agent.done} onClick={onRun}>Run</button>
        }
        <button type="button" disabled={agent === null || running} onClick={onReset}>Reset</button>
      </div>
    </div>
  )
}

export default AgentPlayView