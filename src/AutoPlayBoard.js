import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import Board from './Board'
import AutoPlayBoardControls from './AutoPlayBoardControls'

const AutoPlayBoard = ({ agent }) => {

  const [entries, setEntries] = useState(agent?.entries ?? [])

  useEffect(() => {
    setEntries(agent?.entries ?? [])
  }, [agent])

  const onStep = () => {
    agent.step()
    setEntries(agent.entries)
  }

  const onReset = () => {
    agent.reset()
    setEntries(agent.entries)
  }

  return (
    <div>
      <Board entries={entries} />
      <AutoPlayBoardControls agent={agent} onStep={onStep} onReset={onReset} />
    </div>
  )
}

AutoPlayBoard.propTypes = {
  agent: PropTypes.object
}

export default AutoPlayBoard
