import * as U from './utils.js'

const UP = 0
const DOWN = 1
const LEFT = 2
const RIGHT = 3
const DIRECTIONS = [UP, DOWN, LEFT, RIGHT]

class Location {
  constructor(row, col) {
    this._row = row
    this._col = col
    this._key = `${row}:${col}`
  }

  get row() { return this._row }
  get col() { return this._col }
  get key() { return this._key }

  sameAs = other => this.key === other.key

  static fromKey = key => {
    const [row, col] = key.split(':').map(Number)
    return new Location(row, col)
  }
}

class Action {
  constructor(fromLocation, viaLocation, toLocation) {
    this._fromLocation = fromLocation
    this._viaLocation = viaLocation
    this._toLocation = toLocation
  }

  get fromLocation() { return this._fromLocation }
  get viaLocation() { return this._viaLocation }
  get toLocation() { return this._toLocation }
}

const followDirection = (location, direction) => {
  const { row, col } = location
  switch (direction) {
    case UP: return new Location(row - 1, col)
    case DOWN: return new Location(row + 1, col)
    case LEFT: return new Location(row, col - 1)
    case RIGHT: return new Location(row, col + 1)
    default: throw new Error(`Unknown direction ${direction}`)
  }
}

function* iterLocations() {
  const boardShape = [
    '  XXX  ',
    '  XXX  ',
    'XXXXXXX',
    'XXXXXXX',
    'XXXXXXX',
    '  XXX  ',
    '  XXX  ',
  ]
  const numRows = boardShape.length
  const numCols = boardShape[0].length
  for (const row of U.rangeIter(numRows)) {
    for (const col of U.rangeIter(numCols)) {
      if (boardShape[row][col] === 'X') {
        yield new Location(row, col)
      }
    }
  }
}

function* iterActions() {
  for (const fromLocation of LOCATIONS) {
    for (const direction of DIRECTIONS) {
      const viaLocation = followDirection(fromLocation, direction)
      const toLocation = followDirection(viaLocation, direction)
      if (LOCATIONS_MAP.has(viaLocation.key) && LOCATIONS_MAP.has(toLocation.key)) {
        yield new Action(fromLocation, viaLocation, toLocation)
      }
    }
  }
}

const CENTRE = new Location(3, 3)
export const LOCATIONS = Array.from(iterLocations())
const LOCATIONS_MAP = new Map(LOCATIONS.map(location => [location.key, location]))
export const ACTIONS = Array.from(iterActions())

export class Board {
  constructor(boardState) {
    if (boardState) {
      this._boardState = new Map(boardState)
    } else {
      this._boardState = new Map(LOCATIONS.map(l => [l.key, !l.sameAs(CENTRE)]))
    }
  }

  get done() {
    return this.validActions().length === 0
  }

  get solved() {
    const stringOfNumbers = Array.from(this._boardState.values()).map(Number).join('')
    return stringOfNumbers === '000000000000000010000000000000000'
  }

  validActions() {
    const actionIndices = U.range(ACTIONS.length)
    return actionIndices.filter(actionIndex => this.isValidAction(actionIndex))
  }

  isValidAction(actionIndex) {
    const action = ACTIONS[actionIndex]
    const { fromLocation, viaLocation, toLocation } = action
    return (
      this._boardState.get(fromLocation.key) &&
      this._boardState.get(viaLocation.key) &&
      !this._boardState.get(toLocation.key)
    )
  }

  makeMove(actionIndex) {
    const action = ACTIONS[actionIndex]
    const { fromLocation, viaLocation, toLocation } = action
    const newBoardState = new Map(this._boardState)
    newBoardState.set(fromLocation.key, false)
    newBoardState.set(viaLocation.key, false)
    newBoardState.set(toLocation.key, true)
    return new Board(newBoardState)
  }

  undoMove(actionIndex) {
    const action = ACTIONS[actionIndex]
    const { fromLocation, viaLocation, toLocation } = action
    const newBoardState = new Map(this._boardState)
    newBoardState.set(fromLocation.key, true)
    newBoardState.set(viaLocation.key, true)
    newBoardState.set(toLocation.key, false)
    return new Board(newBoardState)
  }

  location = location => this._boardState.get(location.key)

  entries() {
    return Array.from(this._boardState.entries())
      .map(([locationKey, isOccupied]) => [LOCATIONS_MAP.get(locationKey), isOccupied])
  }
}

export const observationToBoard = obs => {
  const boardState = new Map(LOCATIONS.map((l, i) => [l.key, Boolean(obs[i])]))
  return new Board(boardState)
}

export const boardToObservation = board => {
  return LOCATIONS.map(l => Number(board.location(l)))
}

const EMPTY_INFO = {}

export class SolitaireEnv {
  constructor() {
    this._board = new Board()
  }

  reset = () => {
    this._board = new Board()
    return boardToObservation(this._board)
  }

  step = actionIndex => {
    if (this._board.done) {
      const obs = boardToObservation(this._board)
      return [obs, 0, true, EMPTY_INFO]
    }
    if (!this._board.isValidAction(actionIndex)) {
      const obs = boardToObservation(this._board)
      return [obs, -100, false, EMPTY_INFO]
    }
    this._board = this._board.makeMove(actionIndex)
    const obs = boardToObservation(this._board)
    const done = this._board.done
    const reward = done ? this._calculateFinalReward() : 0
    return [obs, reward, done, EMPTY_INFO]
  }

  undo = actionIndex => {
    this._board = this._board.undoMove(actionIndex)
    const obs = boardToObservation(this._board)
    return obs
  }

  validActions() {
    return this._board.validActions()
  }

  entries() {
    return this._board.entries()
  }

  render = () => {
    for (const row of U.rangeIter(7)) {
      let line = ''
      for (const col of U.rangeIter(7)) {
        const location = new Location(row, col)
        if (LOCATIONS_MAP.has(location.key)) {
          line += this._board.location(location) ? 'X' : '.'
        } else {
          line += ' '
        }
      }
      console.log(line)
    }
  }

  _calculateFinalReward = () => {
    let reward = 0
    for (const [location, isOccupied] of this._board.entries()) {
      if (isOccupied) {
        const { row, col } = location
        const rowDiff = Math.abs(row - CENTRE.row)
        const colDiff = Math.abs(col - CENTRE.col)
        const manhattanDistanceFromCentre = rowDiff + colDiff
        reward -= manhattanDistanceFromCentre
      }
    }
    return reward
  }
}
