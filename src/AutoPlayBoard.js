import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import Board from './Board'
import AutoPlayBoardControls from './AutoPlayBoardControls'

const AutoPlayBoard = ({ agent }) => {

  const [previousEntries, setPreviousEntries] = useState(agent?.entries ?? [])
  const [action, setAction] = useState(null)
  const [resetBoard, setResetBoard] = useState(true)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (agent) {
      // This is a bit of hack. See onReset() below for more details.
      setPreviousEntries([])
      setTimeout(() => {
        agent.reset()
        setPreviousEntries(agent.entries)
        setResetBoard(true)
        setAction(null)
      }, 0)
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

  const onReset = () => {
    if (!agent) return
    if (resetBoard) {
      setPreviousEntries(agent.entries)
    } else {
      // This is a bit of hack. Briefly remove all marbles from the board.
      // Without doing this, something seems to get out of sync as can be
      // seen by doing the following:
      // - comment out the "setPreviousEntries([])" line
      // - click Run and let it finish
      // - click Reset
      // - observe that the board does not reset properly
      setPreviousEntries([])
      setTimeout(() => {
        agent.reset()
        setPreviousEntries(agent.entries)
        setResetBoard(true)
        setAction(null)
      }, 0)
    }
  }

  return (
    <>
      <Board
        resetBoard={resetBoard}
        previousEntries={previousEntries}
        action={action} />

      <AutoPlayBoardControls
        agent={agent}
        onStep={onStep}
        onRun={onRun}
        onReset={onReset}
        running={running} />
    </>
  )
}

AutoPlayBoard.propTypes = {
  agent: PropTypes.object
}

export default AutoPlayBoard
