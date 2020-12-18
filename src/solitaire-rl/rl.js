import * as tf from '@tensorflow/tfjs'
import { SolitaireEnv, observationToBoard, boardToObservation, ACTIONS } from './solitaire-env'
import * as U from './utils'

const LR = 0.001
const EPSILON_START = 1
const EPSILON_END = 0.01
const EPSILON_DECAY_PC = 50
const GAMMA = 1
const MAX_EPISODES = 20000

const makeModel = () => {
  const model = tf.sequential()
  model.add(tf.layers.dense({ inputShape: [33], units: 20, activation: 'relu', name: 'input-layer' }))
  model.add(tf.layers.dense({ units: 1, name: 'output-layer' }))
  return model
}

const makeLinearDecaySchedule = (startVal, endVal, decayPercent) => {
  const rangeVal = endVal - startVal
  const decayEpisodes = MAX_EPISODES * decayPercent / 100
  const increment = rangeVal / decayEpisodes
  return episode => episode > decayEpisodes
    ? endVal
    : startVal + increment * episode
}

const evaluateValidActions = (model, state) => {
  return tf.tidy(() => {
    const currentBoard = observationToBoard(state)
    const evaluateValidAction = action => {
      const newBoard = currentBoard.makeMove(action)
      const nextState = boardToObservation(newBoard)
      return nextState
    }
    const validActions = currentBoard.validActions()
    const nextStates = validActions.map(evaluateValidAction)
    const predictStart = performance.now()
    const nextStateValues = model.predict(tf.tensor(nextStates))
    const predictEnd = performance.now()
    console.log(`predictElapsed: ${(predictEnd - predictStart).toFixed(2)}; nextStates.length: ${nextStates.length}`)
    return U.zip(nextStateValues.dataSync(), validActions)
  })
}

const randomChoice = xs => xs[Math.floor(Math.random() * xs.length)]

const bestPairBy = (pairs, fn) => {
  const [pairsHead, ...pairsTail] = pairs
  return pairsTail.reduce(
    (bestPair, pair) => fn(pair) > fn(bestPair) ? pair : bestPair,
    pairsHead)
}

const makePolicy = model => {
  return (s, epsilon = 0) => {
    const pairs = evaluateValidActions(model, s)
    if (Math.random() < epsilon) {
      return randomChoice(pairs)
    } else {
      return bestPairBy(pairs, U.fst)
    }
  }
}

const trainLoop = async (env, model, pi, saveFn, progressFn) => {
  const optimizer = tf.train.adam(LR)
  const lossFn = tf.losses.meanSquaredError
  const finalRewards = []
  const finalRewardsMA = []
  let bestFinalReward = Number.NEGATIVE_INFINITY
  let bestFinalRewardMA = Number.NEGATIVE_INFINITY
  const epsilonDecaySchedule = makeLinearDecaySchedule(EPSILON_START, EPSILON_END, EPSILON_DECAY_PC)
  for (const episode of U.rangeIter(MAX_EPISODES)) {
    const epsilon = epsilonDecaySchedule(episode)
    let state = env.reset()
    for (; ;) {
      const [nextStateValue, action] = pi(state, epsilon)
      const [nextState, reward, done] = env.step(action)
      const stateValueTarget = reward + (1 - done) * GAMMA * nextStateValue
      const stateTensor = tf.tensor([state])
      const optStart = performance.now()
      optimizer.minimize(() => {
        const stateValue = model.apply(stateTensor)
        const targetTensor = tf.tensor([[stateValueTarget]])
        const loss = lossFn(stateValue, targetTensor)
        tf.dispose(targetTensor)
        return loss
      })
      tf.dispose(stateTensor)
      const optEnd = performance.now()
      console.log(`optElapsed: ${(optEnd - optStart).toFixed(2)}`)

      if (done) {
        // console.log(JSON.stringify(tf.memory()))
        const finalReward = reward
        finalRewards.push(finalReward)
        if (finalReward > bestFinalReward) {
          bestFinalReward = finalReward
        }
        let finalRewardMA = Number.NEGATIVE_INFINITY
        if (finalRewards.length > 100) {
          const meanTensor = tf.mean(finalRewards.slice(-100))
          finalRewardMA = meanTensor.dataSync()[0]
          finalRewardsMA.push(finalRewardMA)
          if (finalRewardMA > bestFinalRewardMA) {
            bestFinalRewardMA = finalRewardMA
          }
          tf.dispose(meanTensor)
        }
        progressFn({
          episode,
          epsilon,
          finalReward,
          bestFinalReward,
          finalRewardMA,
          bestFinalRewardMA
        })

        if (finalRewardMA >= 50) {
          return saveFn(model)
        }

        await tf.nextFrame()
        break
      }

      state = nextState
    }
  }
}

class BaseAgent {
  constructor() {
    this._env = new SolitaireEnv()
    this._state = this._env.reset()
  }

  entries() {
    return this._env.entries()
  }

  get done() {
    return observationToBoard(this._state).done
  }

  reset = () => {
    this._state = this._env.reset()
    return this._state
  }

  step = () => {
    if (this.done) {
      throw new Error('This episode is done - call reset to go again')
    }

    const actionIndex = this.chooseAction()
    const action = ACTIONS[actionIndex]

    const [state, reward, done] = this._env.step(actionIndex)
    this._state = state
    const entries = this._env.entries()
    // console.log(JSON.stringify(tf.memory()))
    return { state, reward, done, entries, action }
  }

  chooseAction = () => {
    throw new Error('Derived classes must override BaseAgent#chooseAction')
  }
}

class RandomAgent extends BaseAgent {
  chooseAction = () => {
    const board = observationToBoard(this._state)
    const validActions = board.validActions()
    const action = randomChoice(validActions)
    return action
  }
}

class TrainedAgent extends BaseAgent {
  constructor(model) {
    super()
    this._pi = makePolicy(model)
  }

  chooseAction = () => {
    const [, action] = this._pi(this._state)
    return action
  }
}

export const makeRandomAgent = () =>
  new RandomAgent()

export const makeTrainedAgent = async modelPath => {
  const model = await tf.loadLayersModel(modelPath)
  return new TrainedAgent(model)
}

export const train = async (saveFn, progressFn) => {
  const env = new SolitaireEnv()
  const model = makeModel()
  const pi = makePolicy(model)
  await trainLoop(env, model, pi, saveFn, progressFn)
}
