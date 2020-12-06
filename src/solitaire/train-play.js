import * as tf from '@tensorflow/tfjs'
import { SolitaireEnv, observationToBoard, boardToObservation } from './solitaire-env'
import * as U from './utils'

const LR = 0.001
const EPSILON_START = 1
const EPSILON_END = 0.01
const EPSILON_DECAY_PC = 50
const GAMMA = 1
const MAX_EPISODES = 20000

const makeModel = () => {
  const model = tf.sequential()
  model.add(tf.layers.dense({ inputShape: [33], units: 20, activation: 'relu' }))
  model.add(tf.layers.dense({ units: 1 }))
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

const train = async (env, model, pi, saveFn) => {
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

      optimizer.minimize(() => {
        const stateValue = model.apply(stateTensor)
        const loss = lossFn(stateValue, tf.tensor([[stateValueTarget]]))
        return loss
      })

      if (done) {
        finalRewards.push(reward)
        if (reward > bestFinalReward) {
          bestFinalReward = reward
        }
        let finalRewardMA = Number.NEGATIVE_INFINITY
        if (finalRewards.length > 100) {
          finalRewardMA = tf.mean(finalRewards.slice(-100)).dataSync()[0]
          finalRewardsMA.push(finalRewardMA)
          if (finalRewardMA > bestFinalRewardMA) {
            bestFinalRewardMA = finalRewardMA
          }
        }
        console.log(
          `episode: ${U.padInt(episode, 5)}; ` +
          `epsilon: ${U.padReal(epsilon, 3)}; ` +
          `final reward (best): ${U.padInt(reward, 5)} (${U.padInt(bestFinalReward, 5)}); ` +
          `final reward ma (best): ${U.padReal(finalRewardMA, 3, 8)} (${U.padReal(bestFinalRewardMA, 3, 8)})`
        )

        if (finalRewardMA >= 50) {
          return saveFn(model)
        }

        break
      }

      state = nextState
    }
  }
}

const play = (env, pi) => {
  const actions = []
  let state = env.reset()
  for (; ;) {
    const [, action] = pi(state)
    actions.push(action)
    const [nextState, , done] = env.step(action)
    if (done) {
      console.log(`actions: ${actions.join(', ')}`)
      env.render()
      break
    }
    state = nextState
  }
}

export const trainWrapper = async saveFn => {
  const env = new SolitaireEnv()
  const model = makeModel()
  const pi = makePolicy(model)
  await train(env, model, pi, saveFn)
}

export const playWrapper = async loadFn => {
  const env = new SolitaireEnv()
  const model = await loadFn()
  const pi = makePolicy(model)
  play(env, pi)
}
