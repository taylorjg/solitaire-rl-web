import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import Board from './Board'
import AutoPlayBoardControls from './AutoPlayBoardControls'

const AutoPlayBoard = ({ agent }) => {

  const [entries, setEntries] = useState(agent?.entries ?? [])

  useEffect(() => {
    setEntries(agent?.entries ?? [])
  }, [agent])

  const runInterval = useRef(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => clearInterval(runInterval.current)
  }, [])

  const onStep = () => {
    agent.step()
    setEntries(agent.entries)
  }

  const onRun = () => {
    runInterval.current = setInterval(() => {
      agent.done
        ? clearInterval(runInterval.current)
        : onStep()
    }, 500)
  }

  const onReset = () => {
    agent.reset()
    setEntries(agent.entries)
  }

  return (
    <>
      <Board entries={entries} />
      <AutoPlayBoardControls agent={agent} onStep={onStep} onRun={onRun} onReset={onReset} />
    </>
  )
}

AutoPlayBoard.propTypes = {
  agent: PropTypes.object
}

export default AutoPlayBoard
