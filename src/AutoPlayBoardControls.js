import PropTypes from 'prop-types'

const AutoPlayBoardControls = ({ agent, onStep, onRun, onReset }) => {
  return (
    <div>
      <button type="button" disabled={agent === null || agent.done} onClick={onStep}>Step</button>
      <button type="button" disabled={agent === null || agent.done} onClick={onRun}>Run</button>
      <button type="button" disabled={agent === null} onClick={onReset}>Reset</button>
    </div>
  )
}

AutoPlayBoardControls.propTypes = {
  agent: PropTypes.object,
  onStep: PropTypes.func.isRequired,
  onRun: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired
}

export default AutoPlayBoardControls
