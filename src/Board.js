import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import * as rl from './solitaire-rl'
import './Board.css'

const RANDOM_ROTATIONS = Array(33).fill(0).map(() => Math.random() * 90)

const Board = ({ entries }) => {
  const [dimensions, setDimensions] = useState(null)
  const svgElement = useRef(null)
  useEffect(() => {
    if (svgElement.current) {
      const w = svgElement.current.clientWidth
      const h = svgElement.current.clientHeight
      const gridX = w / 8
      const gridY = h / 8
      const innerRadius = Math.min(gridX, gridY) / 4
      const outerRadius = Math.min(gridX, gridY) / 2.4
      setDimensions({ w, h, gridX, gridY, innerRadius, outerRadius })
    }
  }, [svgElement])

  const renderBoardPositions = () => {
    if (!dimensions) return
    return rl.LOCATIONS.map(location =>
      <circle
        key={location.key}
        cx={dimensions.gridX * (location.col + 1)}
        cy={dimensions.gridY * (location.row + 1)}
        r={dimensions.innerRadius}
        className="board-position"
      />
    )
  }

  const renderBoardPieces = () => {
    if (!dimensions) return
    return entries.map(([location, isOccupied], index) => {
      if (!isOccupied) return null
      const cx = dimensions.gridX * (location.col + 1)
      const cy = dimensions.gridY * (location.row + 1)
      return <circle
        key={location.key}
        cx={cx}
        cy={cy}
        r={dimensions.outerRadius}
        className="board-piece"
        style={{
          transform: `rotate(${RANDOM_ROTATIONS[index]}deg)`,
          transformOrigin: `${cx}px ${cy}px`
        }}
      />
    })
  }

  return (
    <div>
      <svg ref={svgElement} className="board">
        <defs>
          <pattern id="board-1" height="100%" width="100%" patternContentUnits="objectBoundingBox">
            <image href="images/board-1.jpeg" preserveAspectRatio="none" width="1" height="1" />
          </pattern>
          <pattern id="marble-1" height="100%" width="100%" patternContentUnits="objectBoundingBox">
            <image href="images/marble-1.png" preserveAspectRatio="none" width="1" height="1" />
          </pattern>
        </defs>
        <rect className="board-background"></rect>
        {renderBoardPositions()}
        {renderBoardPieces()}
      </svg>
    </div>
  )
}

Board.propTypes = {
  entries: PropTypes.array.isRequired
}

export default Board
