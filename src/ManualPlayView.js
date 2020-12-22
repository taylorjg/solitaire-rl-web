import { useCallback, useEffect, useState } from 'react'
import Board from './Board'
import * as rl from './solitaire-rl'
import './ManualPlayView.css'

const ManualPlayView = () => {

  const [env] = useState(() => new rl.SolitaireEnv())
  const [resetBoard, setResetBoard] = useState(true)
  const [entries, setEntries] = useState([])
  const [action, setAction] = useState(null)
  const [undo, setUndo] = useState(false)
  const [actions, setActions] = useState([])
  const [finalReward, setFinalReward] = useState(null)

  const onReset = useCallback(() => {
    env.reset()
    setResetBoard(true)
    setEntries(env.entries())
    setAction(null)
    setUndo(false)
    setActions([])
    setFinalReward(null)
  }, [env])

  useEffect(onReset, [onReset])

  const onUndo = () => {
    const [actionIndex] = actions.slice(-1)
    env.undo(actionIndex)
    setEntries(env.entries())
    setAction(rl.ACTIONS[actionIndex])
    setUndo(true)
    setActions(actions => actions.slice(0, -1))
    setFinalReward(null)
  }

  const validateManualMove = ({ fromLocation, toLocation }) => {
    const validActionIndices = env.validActions()
    return validActionIndices.filter(actionIndex => {
      const action = rl.ACTIONS[actionIndex]
      const fromLocationCheck = fromLocation ? action.fromLocation.sameAs(fromLocation) : true
      const toLocationCheck = toLocation ? action.toLocation.sameAs(toLocation) : true
      return fromLocationCheck && toLocationCheck
    })
  }

  const makeManualMove = actionIndex => {
    const [, reward, done] = env.step(actionIndex)
    setResetBoard(false)
    setEntries(env.entries())
    setAction(rl.ACTIONS[actionIndex])
    setUndo(false)
    setActions(actions => actions.concat(actionIndex))
    if (done) {
      setFinalReward(reward)
    }
  }

  return (
    <div className="agent-play-content">
      <div className="board-wrapper">
        <Board
          resetBoard={resetBoard}
          entries={entries}
          action={action}
          undo={undo}
          interactive={true}
          validateManualMove={validateManualMove}
          makeManualMove={makeManualMove}
        />

        <div className="board-controls-below">
          <div>
            <button type="button" onClick={onReset}>Reset</button>
            <button type="button" onClick={onUndo} disabled={actions.length === 0}>Undo</button>
          </div>
          {finalReward !== null && <div>Final Reward: {finalReward}</div>}
        </div>
      </div>
    </div>
  )
}

export default ManualPlayView
