import { useEffect, useState } from 'react'
import AutoPlayBoard from './AutoPlayBoard'
import * as rl from './solitaire-rl'
import { version } from '../package.json'
import './App.css'

const modelPath = '/models/model.json'

function App() {

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
    <>
      <div className="version">version:&nbsp;<span>{version}</span></div>
      <div className="outer">
        <div className="middle">
          <div className="board-controls-above">
            <select onChange={e => changeAgent(e.target.value)}>
              <option value="randomAgent">RandomAgent</option>
              <option value="trainedAgent">TrainedAgent</option>
            </select>
          </div>
          <AutoPlayBoard agent={agent} />
        </div>
      </div>
    </>
  )
}

export default App
