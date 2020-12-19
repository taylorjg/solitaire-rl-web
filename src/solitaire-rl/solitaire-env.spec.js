import { SolitaireEnv, observationToBoard } from './solitaire-env'

const solutionActions = [
  68, 49, 71, 33, 75, 71, 5, 11,
  20, 46, 11, 27, 3, 40, 1, 3,
  69, 65, 57, 28, 65, 20, 12, 49,
  57, 62, 27, 39, 7, 35, 44
]

describe('SolitaireEnv', () => {

  it('should have the correct initial state', () => {
    const env = new SolitaireEnv()
    const obs = env.reset()
    expect(obs).toEqual(Array(33).fill(1).fill(0, 16, 17))
  })

  it('should have the correct initial valid actions', () => {
    const env = new SolitaireEnv()
    const obs = env.reset()
    const board = observationToBoard(obs)
    const validActions = board.validActions()
    expect(validActions).toEqual([7, 31, 44, 68])
  })

  it('should be solved after stepping through the solution actions', () => {
    const env = new SolitaireEnv()
    env.reset()
    let obs, reward, done
    for (const action of solutionActions) {
      [obs, reward, done] = env.step(action)
    }
    expect(obs).toEqual(Array(33).fill(0).fill(1, 16, 17))
    expect(reward).toEqual(100)
    expect(done).toEqual(true)
  })

  it('should be back to undo from solved all the way back to the beginning', () => {
    const env = new SolitaireEnv()
    env.reset()
    let obs
    for (const action of solutionActions) {
      [obs] = env.step(action)
    }
    expect(obs).toEqual(Array(33).fill(0).fill(1, 16, 17))
    for (const action of solutionActions.slice().reverse()) {
      obs = env.undo(action)
    }
    expect(obs).toEqual(Array(33).fill(1).fill(0, 16, 17))
  })
})
