import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
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

const Board = ({ resetBoard, previousEntries, action }) => {

  const [randomRotations, setRandomRotations] = useState(() => makeRandomRotationsMap())

  const viaPiece = useRef(null)
  const fromPiece = useRef(null)

  useEffect(() => {
    if (resetBoard) {
      setRandomRotations(makeRandomRotationsMap())
    }
  }, [previousEntries, resetBoard])

  useEffect(() => {
    if (action) {
      if (viaPiece.current) {
        viaPiece.current.style.opacity = 0
      }
      if (fromPiece.current) {
        const cx = GRID_X * (action.toLocation.col + 1)
        const cy = GRID_Y * (action.toLocation.row + 1)
        fromPiece.current.setAttribute("cx", cx)
        fromPiece.current.setAttribute("cy", cy)
        fromPiece.current.style.transformOrigin = `${cx}px ${cy}px`
      }
      updateRandomRotationOfToLocation(action)
    }
  }, [action])

  const updateRandomRotationOfToLocation = action => {
    const { fromLocation, toLocation } = action
    setRandomRotations(randomRotations => {
      const randomRotations2 = new Map(randomRotations)
      const fromLocationRandomRotation = randomRotations2.get(fromLocation.key)
      randomRotations2.set(toLocation.key, fromLocationRandomRotation)
      return randomRotations2
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
    return previousEntries.map(([location, isOccupied]) => {
      if (!isOccupied) return null
      const cx = GRID_X * (location.col + 1)
      const cy = GRID_Y * (location.row + 1)
      const props = {
        key: location.key,
        cx,
        cy,
        r: MARBLE_RADIUS,
        className: 'board-marble',
        style: {
          transform: `rotate(${randomRotations.get(location.key)}deg)`,
          transformOrigin: `${cx}px ${cy}px`
        }
      }
      if (action && location.sameAs(action.viaLocation)) {
        props.className += ' board-marble--disappear'
        return <circle ref={viaPiece} {...props} />
      }
      if (action && location.sameAs(action.fromLocation)) {
        props.className += ' board-marble--move'
        return <circle ref={fromPiece} {...props} />
      }
      return <circle {...props} />
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
