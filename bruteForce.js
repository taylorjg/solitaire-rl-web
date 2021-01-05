import { performance } from 'perf_hooks'
import { Board } from './src/solitaire-rl/solitaire-env.js'
import * as U from './src/solitaire-rl/utils.js'

let episodes = 0

const depthFirstSearch = (board, actions) => {
  for (const action of board.validActions()) {
    const actions2 = [...actions, action]
    console.log(JSON.stringify(actions2))
    const board2 = board.makeMove(action)
    if (board2.done) {
      episodes++
      if (board2.solved) {
        return actions2
      }
    } else {
      const recursiveResult = depthFirstSearch(board2, actions2)
      if (recursiveResult) {
        return recursiveResult
      }
    }
  }
}

const main = () => {
  const initialBoard = new Board()
  const startTime = performance.now()
  const solution = depthFirstSearch(initialBoard, [])
  const endTime = performance.now()
  const elapsedTime = endTime - startTime
  console.log('solution:', JSON.stringify(solution))
  console.log('episodes:', episodes)
  console.log('elapsed time:', U.formatElapsedTime(elapsedTime))
}

main()
