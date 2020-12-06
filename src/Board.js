import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import * as rl from './solitaire-rl'
import './Board.css'

const Board = ({ entries }) => {
  const [dimensions, setDimensions] = useState(null)
  const svgElement = useRef(null)
  useEffect(() => {
    if (svgElement.current) {
      const w = svgElement.current.clientWidth
      const h = svgElement.current.clientHeight
      const gridX = w / 8
      const gridY = h / 8
      const innerRadius = Math.min(gridX, gridY) / 10
      const outerRadius = innerRadius * 3
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
    return entries.filter(([, isOccupied]) => isOccupied).map(([location]) =>
      <circle
        key={location.key}
        cx={dimensions.gridX * (location.col + 1)}
        cy={dimensions.gridY * (location.row + 1)}
        r={dimensions.outerRadius}
        className="board-piece"
      />
    )
  }

  return (
    <div>
      <svg ref={svgElement} className="board">
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
