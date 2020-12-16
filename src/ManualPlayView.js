import { useEffect, useState } from 'react'
import Board from './Board'
import * as rl from './solitaire-rl'
import './ManualPlayView.css'

const ManualPlayView = () => {

  const [env] = useState(() => new rl.SolitaireEnv())
  const [board, setBoard] = useState(null)
  const [previousEntries, setPreviousEntries] = useState([])
  const [action, setAction] = useState(null)
  const [resetBoard, setResetBoard] = useState(true)

  useEffect(() => {
    const obs = env.reset()
    const board = rl.observationToBoard(obs)
    setBoard(board)
    setPreviousEntries(board.entries)
    setResetBoard(true)
    setAction(null)
  }, [env])

  const onReset = () => {
    const obs = env.reset()
    const board = rl.observationToBoard(obs)
    setBoard(board)
    setPreviousEntries(board.entries)
    setResetBoard(true)
    setAction(null)
  }

  const validateFromToSelections = ({ fromLocation, toLocation }) => {
    console.log(`[validateFromToSelections] fromLocation: ${fromLocation ? fromLocation.key : '-'}; toLocation: ${toLocation ? toLocation.key : '-'}`)
    if (!board) return
    const validActionIndices = board.validActions()
    return validActionIndices.filter(actionIndex => {
      const action = rl.ACTIONS[actionIndex]
      const fromLocationCheck = fromLocation ? action.fromLocation.sameAs(fromLocation) : true
      const toLocationCheck = toLocation ? action.toLocation.sameAs(toLocation) : true
      return fromLocationCheck && toLocationCheck
    })
  }

  const manualStep = actionIndex => {
    if (env.done) return
    const oldBoard = board
    const [obs] = env.step(actionIndex)
    const newBoard = rl.observationToBoard(obs)
    setBoard(newBoard)
    setPreviousEntries(oldBoard.entries)
    setResetBoard(false)
    setAction(rl.ACTIONS[actionIndex])
  }

  return (
    <div className="manual-play-content">
      <Board
        resetBoard={resetBoard}
        previousEntries={previousEntries}
        action={action}
        validateFromToSelections={validateFromToSelections}
        manualStep={manualStep}
      />

      <div className="board-controls-below">
        <button type="button" onClick={onReset}>Reset</button>
      </div>
    </div>
  )
}

export default ManualPlayView
