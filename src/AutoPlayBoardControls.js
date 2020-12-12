import PropTypes from 'prop-types'
import './AutoPlayBoardControls.css'

const AutoPlayBoardControls = ({ agent, onStep, onRun, onReset, running }) => {
  return (
    <div className="board-controls-below">
      <button type="button" disabled={agent === null || agent.done || running} onClick={onStep}>Step</button>
      <button type="button" disabled={agent === null || agent.done || running} onClick={onRun}>Run</button>
      <button type="button" disabled={agent === null || running} onClick={onReset}>Reset</button>
    </div>
  )
}

AutoPlayBoardControls.propTypes = {
  agent: PropTypes.object,
  onStep: PropTypes.func.isRequired,
  onRun: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  running: PropTypes.bool.isRequired
}

export default AutoPlayBoardControls
