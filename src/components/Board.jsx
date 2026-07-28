import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { animated, useSpring } from '@react-spring/web'
import * as rl from '@app/solitaire-rl/index.js'
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

const assetUrl = path => `${import.meta.env.BASE_URL}${path}`

const AnimatedMovingMarble = ({
  cxFrom,
  cyFrom,
  cxTo,
  cyTo,
  angleFrom,
  angleTo,
  onClick
}) => {
  const springs = useSpring({
    from: {
      cx: cxFrom,
      cy: cyFrom,
      transform: makeTransformStyle(angleFrom),
      transformOrigin: makeTransformOriginStyle(cxFrom, cyFrom),
    },
    to: {
      cx: cxTo,
      cy: cyTo,
      transform: makeTransformStyle(angleTo),
      transformOrigin: makeTransformOriginStyle(cxTo, cyTo),
    },
    config: { duration: 600 },
  })

  return (
    <animated.circle
      cx={springs.cx}
      cy={springs.cy}
      r={MARBLE_RADIUS}
      className="board-marble"
      onClick={onClick}
      style={{
        transform: springs.transform,
        transformOrigin: springs.transformOrigin,
      }}
    />
  )
}

AnimatedMovingMarble.propTypes = {
  cxFrom: PropTypes.number.isRequired,
  cyFrom: PropTypes.number.isRequired,
  cxTo: PropTypes.number.isRequired,
  cyTo: PropTypes.number.isRequired,
  angleFrom: PropTypes.number.isRequired,
  angleTo: PropTypes.number.isRequired,
  onClick: PropTypes.func,
}

const AnimatedViaMarble = ({ cx, cy, angle, undo, onClick, onRest }) => {
  const springs = useSpring({
    from: { opacity: undo ? 0 : 1 },
    to: { opacity: undo ? 1 : 0 },
    config: { duration: 300 },
    delay: undo ? 0 : 300,
    onRest,
  })

  return (
    <animated.circle
      cx={cx}
      cy={cy}
      r={MARBLE_RADIUS}
      className="board-marble"
      onClick={onClick}
      style={{
        transform: makeTransformStyle(angle),
        transformOrigin: makeTransformOriginStyle(cx, cy),
        opacity: springs.opacity,
      }}
    />
  )
}

AnimatedViaMarble.propTypes = {
  cx: PropTypes.number.isRequired,
  cy: PropTypes.number.isRequired,
  angle: PropTypes.number.isRequired,
  undo: PropTypes.bool,
  onClick: PropTypes.func,
  onRest: PropTypes.func,
}

const Board = ({
  resetBoard,
  entries,
  action,
  undo,
  interactive,
  validateManualMove,
  makeManualMove
}) => {
  const [randomRotations, setRandomRotations] = useState(() => makeRandomRotationsMap())
  const [showViaMarble, setShowViaMarble] = useState(false)
  const [selectedMarble, setSelectedMarble] = useState(null)
  const [selectedHole, setSelectedHole] = useState(null)
  const [availableHoles, setAvailableHoles] = useState([])

  useEffect(() => {
    if (resetBoard) {
      setRandomRotations(makeRandomRotationsMap())
    }
  }, [entries, resetBoard])

  useEffect(() => {
    setShowViaMarble(Boolean(action))
    setSelectedMarble(null)
    setSelectedHole(null)
    setAvailableHoles([])
  }, [action, undo])

  const onSelectHole = location => () => {
    if (!interactive) return
    if (availableHoles.find(availableHole => availableHole.sameAs(location))) {
      const fromLocation = selectedMarble
      const toLocation = location
      const validActionIndices = validateManualMove({ fromLocation, toLocation })
      if (validActionIndices.length === 1) {
        makeManualMove(validActionIndices[0])
      }
    }
  }

  const onMouseOverHole = location => () => {
    if (!interactive) return
    if (availableHoles.find(availableHole => availableHole.sameAs(location))) {
      setSelectedHole(location)
    }
  }

  const onMouseOutHole = () => {
    if (!interactive) return
    setSelectedHole(null)
  }

  const onSelectMarble = location => () => {
    if (!interactive) return
    if (selectedMarble && selectedMarble.sameAs(location)) {
      setSelectedMarble(null)
      setAvailableHoles([])
    } else {
      const fromLocation = location
      const validActionIndices = validateManualMove({ fromLocation })
      if (validActionIndices.length) {
        setSelectedMarble(location)
        setAvailableHoles(validActionIndices.map(validActionIndex => rl.ACTIONS[validActionIndex].toLocation))
      } else {
        setSelectedMarble(null)
        setAvailableHoles([])
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
      const classNames = ['board-hole']
      if (availableHoles.find(availableHole => availableHole.sameAs(location))) {
        classNames.push('board-hole--available')
      }
      if (selectedHole && selectedHole.sameAs(location)) {
        classNames.push('board-hole--selected')
      }
      const props = {
        cx,
        cy,
        r: HOLE_RADIUS,
        className: classNames.join(' '),
        onClick: onSelectHole(location),
        onMouseOver: onMouseOverHole(location),
        onMouseOut: onMouseOutHole
      }
      return <circle key={`hole-${location.key}`} {...props} />
    })
  }

  const renderMarbles = () => {
    const occupiedEntries = entries.filter(([, isOccupied]) => isOccupied)
    return occupiedEntries.map(([location]) => {
      if (action) {
        const startLocation = undo ? action.toLocation : action.fromLocation
        const endLocation = undo ? action.fromLocation : action.toLocation
        if (location.sameAs(endLocation)) {
          return renderFromToMarble(startLocation, endLocation)
        }
        if (undo && location.sameAs(action.viaLocation)) {
          return null
        }
      }
      return renderStaticMarble(location)
    })
  }

  const renderStaticMarble = location => {
    const [cx, cy] = locationToCircleCentre(location)
    const angle = randomRotations.get(location.key)
    const props = {
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
    return <circle key={location.key} {...props} style={style} />
  }

  const renderViaMarble = () => {
    if (!action) return null
    if (!undo && !showViaMarble) return null
    const viaLocation = action.viaLocation
    const [cx, cy] = locationToCircleCentre(viaLocation)
    const angle = randomRotations.get(viaLocation.key)
    const maybeOnClick = undo
      ? { onClick: onSelectMarble(viaLocation) }
      : undefined
    return (
      <AnimatedViaMarble
        key={viaLocation.key}
        cx={cx}
        cy={cy}
        angle={angle}
        undo={undo}
        onRest={() => setShowViaMarble(false)}
        {...maybeOnClick}
      />
    )
  }

  const renderFromToMarble = (startLocation, endLocation) => {
    const [cxFrom, cyFrom] = locationToCircleCentre(startLocation)
    const [cxTo, cyTo] = locationToCircleCentre(endLocation)
    const angleFrom = randomRotations.get(startLocation.key)
    const angleTo = randomRotations.get(endLocation.key)
    return (
      <AnimatedMovingMarble
        key={endLocation.key}
        cxFrom={cxFrom}
        cyFrom={cyFrom}
        cxTo={cxTo}
        cyTo={cyTo}
        angleFrom={angleFrom}
        angleTo={angleTo}
        onClick={onSelectMarble(endLocation)}
      />
    )
  }

  const renderMarbleHighlight = () => {
    if (!selectedMarble) return null
    const [cx, cy] = locationToCircleCentre(selectedMarble)
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
            <image href={assetUrl('images/board.jpeg')} preserveAspectRatio="none" width="1" height="1" />
          </pattern>
          <pattern id="marble" height="100%" width="100%" patternContentUnits="objectBoundingBox">
            <image href={assetUrl('images/marble.png')} preserveAspectRatio="none" width="1" height="1" />
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
  undo: PropTypes.bool,
  interactive: PropTypes.bool,
  validateManualMove: PropTypes.func,
  makeManualMove: PropTypes.func
}

export default Board
