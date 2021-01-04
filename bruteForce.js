import { Board, boardToObservation } from './src/solitaire-rl/solitaire-env.js'
import { performance } from 'perf_hooks'

let episodes = 0

const isBoardSolved = board =>
  boardToObservation(board).join('') === '000000000000000010000000000000000'

const search = (board, solution) => {
  const indentation = ' '.repeat(solution.length * 2)
  console.log(`${indentation}solution: ${JSON.stringify(solution)}`)
  const validActions = board.validActions()
  console.log(`${indentation}validActions: ${JSON.stringify(validActions)}`)
  for (const action of validActions) {
    const solution2 = [...solution, action]
    const board2 = board.makeMove(action)
    const done = board2.done
    const solved = isBoardSolved(board2)
    console.log(`${indentation}action: ${JSON.stringify(action)}; done: ${done}; solved: ${solved}`)
    if (done) {
      episodes++
      console.log(`${indentation}episodes: ${episodes}`)
      if (solved) {
        return solution2
      }
    } else {
      const recursiveResult = search(board2, solution2)
      if (recursiveResult) {
        return recursiveResult
      }
    }
  }
}

const main = () => {
  const initialBoard = new Board()
  const start = performance.now()
  const solution = search(initialBoard, [])
  const end = performance.now()
  const elapsed = end - start
  console.log(`episodes: ${episodes}`)
  console.log(`solution: ${JSON.stringify(solution)}`)
  console.log(`elapsed ms: ${elapsed.toFixed(2)}`)
}

main()
