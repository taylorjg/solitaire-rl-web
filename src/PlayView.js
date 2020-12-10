import { useEffect, useState } from 'react'
import AutoPlayBoard from './AutoPlayBoard'
import * as rl from './solitaire-rl'
import './PlayView.css'

const modelPath = '/models/model.json'

const PlayView = () => {

  const [agent, setAgent] = useState(null)

  useEffect(() => changeAgent('randomAgent'), [])

  const changeAgent = async agentName => {
    switch (agentName) {
      case 'trainedAgent': {
        const agent = await rl.makeTrainedAgent(modelPath)
        setAgent(agent)
        break
      }
      case 'randomAgent':
      default: {
        const agent = rl.makeRandomAgent()
        setAgent(agent)
        break
      }
    }
  }

  return (
    <div className="play-content">
      <select onChange={e => changeAgent(e.target.value)}>
        <option value="randomAgent">Random Agent</option>
        <option value="trainedAgent">Trained Agent</option>
      </select>
      <AutoPlayBoard agent={agent} />
    </div>
  )
}

export default PlayView
