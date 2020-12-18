import { useEffect, useState } from 'react'
import Board from './Board'
import * as rl from './solitaire-rl'
import './ManualPlayView.css'

const ManualPlayView = () => {

  const [env] = useState(() => new rl.SolitaireEnv())
  const [resetBoard, setResetBoard] = useState(true)
  const [entries, setEntries] = useState([])
  const [action, setAction] = useState(null)

  useEffect(() => {
    env.reset()
    setResetBoard(true)
    setEntries(env.entries())
    setAction(null)
  }, [env])

  const onReset = () => {
    env.reset()
    setResetBoard(true)
    setEntries(env.entries())
    setAction(null)
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
    if (env.done) return
    env.step(actionIndex)
    setResetBoard(false)
    setEntries(env.entries())
    setAction(rl.ACTIONS[actionIndex])
  }

  return (
    <div className="manual-play-content">
      <Board
        resetBoard={resetBoard}
        entries={entries}
        action={action}
        validateManualMove={validateManualMove}
        makeManualMove={makeManualMove}
      />

      <div className="board-controls-below">
        <button type="button" onClick={onReset}>Reset</button>
      </div>
    </div>
  )
}

export default ManualPlayView
