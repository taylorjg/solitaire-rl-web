import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import * as rl from './solitaire-rl'
import './Board.css'

const Board = ({ entries }) => {

  const makeRandomRotations = () => rl.LOCATIONS.map(() => Math.random() * 60 - 30)
  const [randomRotations, setRandomRotations] = useState(() => makeRandomRotations())

  const GRID_X = 100 / 8
  const GRID_Y = 100 / 8
  const HOLE_RADIUS = Math.min(GRID_X, GRID_Y) / 4
  const MARBLE_RADIUS = Math.min(GRID_X, GRID_Y) / 1.5

  useEffect(() => {
    const numOccupied = entries.filter(([, isOccupied]) => isOccupied).length
    if (numOccupied === 32) {
      setRandomRotations(makeRandomRotations())
    }
  }, [entries])

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
    return entries.map(([location, isOccupied], index) => {
      if (!isOccupied) return null
      const cx = GRID_X * (location.col + 1)
      const cy = GRID_Y * (location.row + 1)
      return <circle
        key={location.key}
        cx={cx}
        cy={cy}
        r={MARBLE_RADIUS}
        className="board-marble"
        style={{
          transform: `rotate(${randomRotations[index]}deg)`,
          transformOrigin: `${cx}px ${cy}px`
        }}
      />
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
  entries: PropTypes.array.isRequired
}

export default Board
