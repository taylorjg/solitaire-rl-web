import PropTypes from 'prop-types'

const AutoPlayBoardControls = ({ onStep, onReset }) => {
  // TODO: disable buttons appropriately
  return (
    <div>
      <button type="button" onClick={onStep}>Step</button>
      <button type="button" onClick={onReset}>Reset</button>
    </div>
  )
}

AutoPlayBoardControls.propTypes = {
  onStep: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired
}

export default AutoPlayBoardControls
