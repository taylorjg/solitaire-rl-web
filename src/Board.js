import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Spring } from 'react-spring/renderprops.cjs'
import * as rl from './solitaire-rl'
import * as U from './solitaire-rl/utils'
import './Board.css'

const GRID_X = 100 / 8
const GRID_Y = 100 / 8
const HOLE_RADIUS = Math.min(GRID_X, GRID_Y) / 4
const MARBLE_RADIUS = Math.min(GRID_X, GRID_Y) / 1.5
const MARBLE_HIGHLIGHT_RADIUS = Math.min(GRID_X, GRID_Y) / 2.15

const makeRandomRotation = () => Math.random() * 60 - 30
const makeRandomRotationKvp = location => [location.key, makeRandomRotation()]
const makeRandomRotationKvps = () => rl.LOCATIONS.map(makeRandomRotationKvp)
const makeRandomRotationsMap = () => new Map(makeRandomRotationKvps())

const makeTransformStyle = angle => `rotate(${angle}deg)`
const makeTransformOriginStyle = (cx, cy) => `${cx}% ${cy}%`

const Board = ({
  resetBoard,
  previousEntries,
  action,
  validateFromToSelections,
  manualStep
}) => {
  console.log('Board render')

  const [randomRotations, setRandomRotations] = useState(() => makeRandomRotationsMap())
  const [holeHighlight, setHoleHighlight] = useState(null)
  const [marbleHighlight, setMarbleHighlight] = useState(null)

  useEffect(() => {
    if (resetBoard) {
      setRandomRotations(makeRandomRotationsMap())
    }
  }, [previousEntries, resetBoard])

  useEffect(() => {
    setHoleHighlight(null)
    setMarbleHighlight(null)
  }, [action])

  const renderHoles = () => {
    return rl.LOCATIONS.map(location =>
      <circle
        key={location.key}
        cx={GRID_X * (location.col + 1)}
        cy={GRID_Y * (location.row + 1)}
        r={HOLE_RADIUS}
        className={`board-hole ${holeHighlight === location ? 'board-hole--highlight' : ''}`}
        onClick={() => {
          console.log(`[hole click] location: ${location.key}`)
          if (holeHighlight === location) {
            setHoleHighlight(null)
          } else {
            const fromLocation = marbleHighlight
            const toLocation = location
            const validActionIndices = validateFromToSelections({ fromLocation, toLocation })
            console.log(`validActionIndices: ${JSON.stringify(validActionIndices)}`)
            if (validActionIndices.length) {
              setHoleHighlight(location)
              if (validActionIndices.length === 1 && fromLocation) {
                manualStep(validActionIndices[0])
              }
            }
          }
        }}
      />
    )
  }

  const renderMarbles = () => {
    const occupiedEntries = previousEntries.filter(([, isOccupied]) => isOccupied)
    const occupiedLocations = occupiedEntries.map(([location]) => location)
    if (action) {
      U.moveToLast(occupiedLocations, location => location.sameAs(action.fromLocation))
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
        onClick: () => {
          console.log(`[marble click] location: ${location.key}`)
          if (marbleHighlight === location) {
            setMarbleHighlight(null)
          } else {
            const fromLocation = action && location.sameAs(action.fromLocation) ? action.toLocation : location
            const toLocation = holeHighlight
            const validActionIndices = validateFromToSelections({ fromLocation, toLocation })
            console.log(`validActionIndices: ${JSON.stringify(validActionIndices)}`)
            if (validActionIndices.length) {
              setMarbleHighlight(fromLocation)
              if (validActionIndices.length === 1 && toLocation) {
                manualStep(validActionIndices[0])
              }
            }
          }
        }
      }
      const style = {
        transform: makeTransformStyle(angle),
        transformOrigin: makeTransformOriginStyle(cx, cy)
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
            {springProps => <circle {...props} style={{ ...style, ...springProps, pointerEvents: 'none' }} />}
          </Spring>
        )
      }

      // Animate the piece that is being moved
      if (action && location.sameAs(action.fromLocation)) {
        const cxTo = GRID_X * (action.toLocation.col + 1)
        const cyTo = GRID_Y * (action.toLocation.row + 1)
        const angleTo = randomRotations.get(action.toLocation.key)
        return (
          <Spring
            key={location.key}
            config={{ duration: 600 }}
            from={{
              cx,
              cy,
              transform: makeTransformStyle(angle),
              transformOrigin: makeTransformOriginStyle(cx, cy)
            }}
            to={{
              cx: cxTo,
              cy: cyTo,
              transform: makeTransformStyle(angleTo),
              transformOrigin: makeTransformOriginStyle(cxTo, cyTo)
            }}
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
        {marbleHighlight && (
          <circle
            cx={GRID_X * (marbleHighlight.col + 1)}
            cy={GRID_Y * (marbleHighlight.row + 1)}
            r={MARBLE_HIGHLIGHT_RADIUS}
            className="board-marble-highlight"
          />
        )}
      </svg>
    </div>
  )
}

Board.propTypes = {
  resetBoard: PropTypes.bool.isRequired,
  previousEntries: PropTypes.array.isRequired,
  action: PropTypes.object,
  validateFromToSelections: PropTypes.func,
  manualStep: PropTypes.func
}

export default Board
