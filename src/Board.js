import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Spring } from 'react-spring/renderprops.cjs'
import * as rl from './solitaire-rl'
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
  entries,
  action,
  validateManualMove,
  makeManualMove
}) => {
  const [randomRotations, setRandomRotations] = useState(() => makeRandomRotationsMap())
  const [showViaMarble, setShowViaMarble] = useState(false)
  const [marbleHighlight, setMarbleHighlight] = useState(null)
  const [holeHighlight, setHoleHighlight] = useState(null)

  useEffect(() => {
    if (resetBoard) {
      setRandomRotations(makeRandomRotationsMap())
    }
  }, [entries, resetBoard])

  useEffect(() => {
    setShowViaMarble(Boolean(action))
    setMarbleHighlight(null)
    setHoleHighlight(null)
  }, [action])

  const onSelectHole = location => () => {
    if (holeHighlight === location) {
      setHoleHighlight(null)
    } else {
      const fromLocation = marbleHighlight
      const toLocation = location
      const validActionIndices = validateManualMove({ fromLocation, toLocation })
      console.log(`validActionIndices: ${JSON.stringify(validActionIndices)}`)
      if (validActionIndices.length) {
        setHoleHighlight(location)
        if (validActionIndices.length === 1 && fromLocation) {
          makeManualMove(validActionIndices[0])
        }
      }
    }
  }

  const onSelectMarble = location => () => {
    if (marbleHighlight === location) {
      setMarbleHighlight(null)
    } else {
      const fromLocation = location
      const toLocation = holeHighlight
      const validActionIndices = validateManualMove({ fromLocation, toLocation })
      console.log(`validActionIndices: ${JSON.stringify(validActionIndices)}`)
      if (validActionIndices.length) {
        setMarbleHighlight(fromLocation)
        if (validActionIndices.length === 1 && toLocation) {
          makeManualMove(validActionIndices[0])
        }
      }
    }
  }

  const locationToCircleCentre = location => [
    GRID_X + GRID_X * location.col,
    GRID_Y + GRID_Y * location.row
  ]

  const renderHoles = () => {
    return rl.LOCATIONS.map(location => {
      const [cx, cy] = locationToCircleCentre(location)
      const props = {
        key: `hole-${location.key}`,
        cx,
        cy,
        r: HOLE_RADIUS,
        className: `board-hole ${holeHighlight === location ? 'board-hole--highlight' : ''}`,
        onClick: onSelectHole(location)
      }
      return <circle {...props} />
    })
  }

  const renderMarbles = () => {
    const occupiedEntries = entries.filter(([, isOccupied]) => isOccupied)
    return occupiedEntries.map(([location]) => {
      if (action && location.sameAs(action.toLocation)) {
        return renderFromToMarble(action.fromLocation, action.toLocation)
      }
      else {
        return renderStaticMarble(location)
      }
    })
  }

  const renderStaticMarble = location => {
    const [cx, cy] = locationToCircleCentre(location)
    const angle = randomRotations.get(location.key)
    const props = {
      key: location.key,
      cx,
      cy,
      r: MARBLE_RADIUS,
      className: 'board-marble',
      onClick: onSelectMarble(location)
    }
    const style = {
      transform: makeTransformStyle(angle),
      transformOrigin: makeTransformOriginStyle(cx, cy)
    }
    return <circle {...props} style={style} />
  }

  const renderViaMarble = () => {
    if (!action) return null
    if (!showViaMarble) return null
    const viaLocation = action.viaLocation
    const [cx, cy] = locationToCircleCentre(viaLocation)
    const angle = randomRotations.get(viaLocation.key)
    const props = {
      cx,
      cy,
      r: MARBLE_RADIUS,
      className: 'board-marble'
    }
    const style = {
      transform: makeTransformStyle(angle),
      transformOrigin: makeTransformOriginStyle(cx, cy)
    }
    return (
      <Spring
        key={viaLocation.key}
        config={{ duration: 300, delay: 300 }}
        from={{ opacity: 1 }}
        to={{ opacity: 0.25 }}
        onRest={() => setShowViaMarble(false)}
      >
        {springProps => <circle {...props} style={{ ...style, ...springProps }} />}
      </Spring>
    )
  }

  const renderFromToMarble = (fromLocation, toLocation) => {
    const [cxFrom, cyFrom] = locationToCircleCentre(fromLocation)
    const [cxTo, cyTo] = locationToCircleCentre(toLocation)
    const angleFrom = randomRotations.get(fromLocation.key)
    const angleTo = randomRotations.get(toLocation.key)
    const props = {
      cx: cxFrom,
      cy: cyFrom,
      r: MARBLE_RADIUS,
      className: 'board-marble',
      onClick: onSelectMarble(toLocation)
    }
    return (
      <Spring
        key={action.toLocation.key}
        config={{ duration: 600 }}
        from={{
          cx: cxFrom,
          cy: cyFrom,
          transform: makeTransformStyle(angleFrom),
          transformOrigin: makeTransformOriginStyle(cxFrom, cyFrom)
        }}
        to={{
          cx: cxTo,
          cy: cyTo,
          transform: makeTransformStyle(angleTo),
          transformOrigin: makeTransformOriginStyle(cxTo, cyTo)
        }}
      >
        {springProps => <circle {...props} style={springProps} />}
      </Spring>
    )
  }

  const renderMarbleHighlight = () => {
    if (!marbleHighlight) return null
    const [cx, cy] = locationToCircleCentre(marbleHighlight)
    const props = {
      cx,
      cy,
      r: MARBLE_HIGHLIGHT_RADIUS,
      className: 'board-marble-highlight'
    }
    return <circle {...props} />
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
        {renderViaMarble()}
        {renderMarbles()}
        {renderMarbleHighlight()}
      </svg>
    </div>
  )
}

Board.propTypes = {
  resetBoard: PropTypes.bool.isRequired,
  entries: PropTypes.array.isRequired,
  action: PropTypes.object,
  validateManualMove: PropTypes.func,
  makeManualMove: PropTypes.func
}

export default Board
