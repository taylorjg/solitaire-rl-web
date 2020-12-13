import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Spring } from 'react-spring/renderprops'
import * as rl from './solitaire-rl'
import './Board.css'

const GRID_X = 100 / 8
const GRID_Y = 100 / 8
const HOLE_RADIUS = Math.min(GRID_X, GRID_Y) / 4
const MARBLE_RADIUS = Math.min(GRID_X, GRID_Y) / 1.5

const makeRandomRotation = () => Math.random() * 60 - 30
const makeRandomRotationKvp = location => [location.key, makeRandomRotation()]
const makeRandomRotationKvps = () => rl.LOCATIONS.map(makeRandomRotationKvp)
const makeRandomRotationsMap = () => new Map(makeRandomRotationKvps())

const makeTransformCSS = angle => `rotate(${angle}deg)`
const makeTransformOriginCSS = (cx, cy) => `${cx}% ${cy}%`

const Board = ({ resetBoard, previousEntries, action }) => {

  const [randomRotations, setRandomRotations] = useState(() => makeRandomRotationsMap())

  useEffect(() => {
    if (resetBoard) {
      setRandomRotations(makeRandomRotationsMap())
    }
  }, [previousEntries, resetBoard])

  const updateRandomRotationOfToLocation = action => {
    const { fromLocation, toLocation } = action
    setRandomRotations(randomRotations => {
      const angle = randomRotations.get(fromLocation.key)
      return new Map(randomRotations).set(toLocation.key, angle)
    })
  }

  const renderHoles = () => {
    return rl.LOCATIONS.map(location =>
      <circle
        key={location.key}
        cx={GRID_X * (location.col + 1)}
        cy={GRID_Y * (location.row + 1)}
        r={HOLE_RADIUS}
        className="board-hole"
      />
    )
  }

  const renderMarbles = () => {
    const occupiedEntries = previousEntries.filter(([, isOccupied]) => isOccupied)
    const occupiedLocations = occupiedEntries.map(([location]) => location)
    const index = occupiedLocations.findIndex(location => action && location.sameAs(action.fromLocation))
    if (index >= 0) {
      const itemsRemoved = occupiedLocations.splice(index, 1)
      occupiedLocations.splice(occupiedLocations.length, 0, ...itemsRemoved)
    }
    return occupiedLocations.map(location => {
      const cx = GRID_X * (location.col + 1)
      const cy = GRID_Y * (location.row + 1)
      const angle = randomRotations.get(location.key)
      const props = {
        key: location.key,
        cx,
        cy,
        r: MARBLE_RADIUS,
        className: 'board-marble',
      }
      const style = {
        transform: makeTransformCSS(angle),
        transformOrigin: makeTransformOriginCSS(cx, cy)
      }

      // Animate the piece that is being removed from the board
      if (action && location.sameAs(action.viaLocation)) {
        return (
          <Spring
            key={location.key}
            config={{ duration: 300, delay: 300 }}
            from={{ opacity: 1 }}
            to={{ opacity: 0 }}
          >
            {springProps => <circle {...props} style={{ ...style, ...springProps }} />}
          </Spring>
        )
      }

      // Animate the piece that is being moved
      if (action && location.sameAs(action.fromLocation)) {
        const cxTo = GRID_X * (action.toLocation.col + 1)
        const cyTo = GRID_Y * (action.toLocation.row + 1)
        return (
          <Spring
            key={location.key}
            config={{ duration: 600 }}
            from={{ cx, cy, transformOrigin: makeTransformOriginCSS(cx, cy) }}
            to={{ cx: cxTo, cy: cyTo, transformOrigin: makeTransformOriginCSS(cxTo, cyTo) }}
            onRest={() => updateRandomRotationOfToLocation(action)}
          >
            {springProps => <circle {...props} style={{ ...style, ...springProps }} />}
          </Spring>
        )
      }

      // Draw a regular piece
      return <circle {...props} style={style} />
    })
  }

  return (
    <div>
      <svg className="board" viewBox="0 0 100 100">
        <defs>
          <pattern id="board" height="100%" width="100%" patternContentUnits="objectBoundingBox">
            <image href="images/board.jpeg" preserveAspectRatio="none" width="1" height="1" />
          </pattern>
          <pattern id="marble" height="100%" width="100%" patternContentUnits="objectBoundingBox">
            <image href="images/marble.png" preserveAspectRatio="none" width="1" height="1" />
          </pattern>
        </defs>
        <rect className="board-background"></rect>
        {renderHoles()}
        {renderMarbles()}
      </svg>
    </div>
  )
}

Board.propTypes = {
  resetBoard: PropTypes.bool.isRequired,
  previousEntries: PropTypes.array.isRequired,
  action: PropTypes.object
}

export default Board
