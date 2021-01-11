import tf from '@tensorflow/tfjs'
import { SolitaireEnv, observationToBoard, boardToObservation, ACTIONS } from './solitaire-env.mjs'
import * as U from './utils.mjs'

const tfConfigure = async () => {
  await tf.ready()
  await tf.setBackend('cpu')
}

tfConfigure()

const MAX_EPISODES = 10000
const LR = 0.001
const EPSILON_START = 0.5
const EPSILON_END = 0.1
const EPSILON_DECAY_EPISODES = MAX_EPISODES / 2
const GAMMA = 1

const makeModel = () => {
  const kernelInitializer = tf.initializers.randomUniform({ minval: 0, maxval: 0.5 })
  const model = tf.sequential()
  model.add(tf.layers.dense({ inputShape: [33], units: 10, activation: 'tanh', name: 'input-layer', kernelInitializer }))
  model.add(tf.layers.dense({ units: 1, name: 'output-layer', kernelInitializer }))
  const lines = []
  model.summary(undefined, undefined, line => lines.push(line))
  console.log(lines.join('\n'))
  return model
}

const makeLinearDecaySchedule = (startVal, endVal, decayEpisodes) => {
  const rangeVal = endVal - startVal
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
    const nextStateValues = model.predict(tf.tensor(nextStates))
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

const checkEndCondition0 = env =>
  env.solved

const checkModelSolvesPuzzle = (model, iterations, randomMoveCount) => {
  console.log(`[checkModelSolvesPuzzle] iterations: ${iterations}; randomMoveCount: ${randomMoveCount}`)
  const agent = makeTrainedAgentFromModel(model, randomMoveCount)
  return U.range(iterations).every(iteration => {
    const actions = []
    agent.reset()
    while (!agent.done) {
      const { actionIndex } = agent.step()
      actions.push(actionIndex)
    }
    const solved = agent.solved
    console.log(`[checkModelSolvesPuzzle] iteration: ${iteration}; actions: ${JSON.stringify(actions)}; solved: ${solved}`)
    return solved
  })
}

const checkEndCondition1 = model => {
  const iterations = 1
  const randomMoveCount = 0
  return checkModelSolvesPuzzle(model, iterations, randomMoveCount)
}

const checkEndCondition2 = model => {
  const iterations = 10
  const randomMoveCount = 1
  return checkModelSolvesPuzzle(model, iterations, randomMoveCount)
}

const checkEndCondition = (endCondition, model, env) => {
  switch (endCondition) {

    case 'endCondition0':
      return checkEndCondition0(env)

    case 'endCondition1':
    default:
      return checkEndCondition1(model)

    case 'endCondition2':
      return checkEndCondition2(model)
  }
}

const trainLoop = async (env, model, pi, endCondition, callbacks) => {
  const optimizer = tf.train.sgd(LR)
  const lossFn = tf.losses.meanSquaredError
  const finalRewards = []
  let bestFinalReward = Number.NEGATIVE_INFINITY
  let bestFinalRewardMA = Number.NEGATIVE_INFINITY
  const epsilonDecaySchedule = makeLinearDecaySchedule(EPSILON_START, EPSILON_END, EPSILON_DECAY_EPISODES)
  for (const episode of U.rangeIter(MAX_EPISODES)) {
    const epsilon = epsilonDecaySchedule(episode)
    let state = env.reset()
    const actions = []
    for (; ;) {
      const [nextStateValue, action] = pi(state, epsilon)
      actions.push(action)
      const [nextState, reward, done] = env.step(action)
      const target = reward + (1 - done) * GAMMA * nextStateValue
      const stateLocal = state
      optimizer.minimize(() => tf.tidy(() => {
        const stateTensor = tf.tensor(stateLocal).expandDims(0)
        const stateValueTensor = model.apply(stateTensor).squeeze(-1)
        const targetTensor = tf.tensor(target).expandDims(0)
        const loss = lossFn(stateValueTensor, targetTensor)
        return loss
      }))
      state = nextState

      if (done) {
        const finalReward = reward
        finalRewards.push(finalReward)
        if (finalReward > bestFinalReward) {
          bestFinalReward = finalReward
        }
        let finalRewardMA = Number.NEGATIVE_INFINITY
        if (finalRewards.length >= 100) {
          finalRewardMA = U.mean(finalRewards.slice(-100))
          if (finalRewardMA > bestFinalRewardMA) {
            bestFinalRewardMA = finalRewardMA
          }
        }

        const stats = {
          episode: episode + 1,
          epsilon,
          finalReward,
          bestFinalReward,
          finalRewardMA,
          bestFinalRewardMA,
          actions
        }
        callbacks.progress(stats)

        if (checkEndCondition(endCondition, model, env)) {
          optimizer.dispose()
          return callbacks.trainingSuccess(model, actions)
        }

        if (callbacks.checkCancelled()) {
          optimizer.dispose()
          return
        }

        await tf.nextFrame()
        break
      }
    }
  }

  callbacks.trainingFailure(model)
  optimizer.dispose()
}

class BaseAgent {
  constructor() {
    this._env = new SolitaireEnv()
    this._state = this._env.reset()
  }

  get done() {
    return this._env.done
  }

  get solved() {
    return this._env.solved
  }

  reset() {
    this._state = this._env.reset()
    return this._state
  }

  step() {
    if (this.done) {
      throw new Error('This episode is done - call reset to go again')
    }

    const actionIndex = this.chooseAction()
    const action = ACTIONS[actionIndex]

    const [state, reward, done] = this._env.step(actionIndex)
    this._state = state
    const entries = this._env.entries()
    return { state, reward, done, entries, action, actionIndex }
  }

  chooseAction() {
    throw new Error('Derived classes must override BaseAgent#chooseAction')
  }

  entries() {
    return this._env.entries()
  }
}

class RandomAgent extends BaseAgent {
  chooseAction() {
    const board = observationToBoard(this._state)
    const validActions = board.validActions()
    const action = randomChoice(validActions)
    return action
  }
}

class HardcodedActionsAgent extends BaseAgent {
  constructor(actions) {
    super()
    this._actions = actions
    this._index = 0
  }

  chooseAction() {
    return this._actions[this._index++]
  }

  reset() {
    super.reset()
    this._index = 0
  }
}

class TrainedAgent extends BaseAgent {
  constructor(model, randomMoveCount = 0) {
    super()
    this._randomMoveCount = randomMoveCount
    this._randomMovesMade = 0
    this._pi = makePolicy(model)
  }

  chooseAction() {
    const epsilon = this._randomMovesMade++ < this._randomMoveCount ? 1 : 0
    const [, action] = this._pi(this._state, epsilon)
    return action
  }

  reset() {
    super.reset()
    this._randomMovesMade = 0
  }
}

export const makeRandomAgent = () =>
  new RandomAgent()

export const makeHardcodedActionsAgent = actions =>
  new HardcodedActionsAgent(actions)

export const makeTrainedAgentFromModel = (model, randomMoveCount = 0) =>
  new TrainedAgent(model, randomMoveCount)

export const makeTrainedAgentFromModelPath = async (modelPath, randomMoveCount = 0) => {
  const model = await tf.loadLayersModel(modelPath)
  return makeTrainedAgentFromModel(model, randomMoveCount)
}

export const train = async (endCondition, callbacks) => {
  console.log(JSON.stringify(tf.memory()))
  const env = new SolitaireEnv()
  const model = makeModel()
  const pi = makePolicy(model)
  await trainLoop(env, model, pi, endCondition, callbacks)
  model.dispose()
  console.log(JSON.stringify(tf.memory()))
}
