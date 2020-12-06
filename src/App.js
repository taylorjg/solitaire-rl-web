import { useEffect, useState } from 'react'
import AutoPlayBoard from './AutoPlayBoard'
import * as rl from './solitaire-rl'
import './App.css'

const modelPath = '/models/model.json'

function App() {

  const [agent, setAgent] = useState(null)

  useEffect(() => {
    const makeAgent = async () => {
      const agent = await rl.makeTrainedAgent(modelPath)
      setAgent(agent)
    }
    makeAgent()
  }, [])

  return (
    <div className="App">
      <AutoPlayBoard agent={agent} />
    </div>
  )
}

export default App
