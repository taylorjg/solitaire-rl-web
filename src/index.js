import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'
// import * as rl from './solitaire-rl'

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()

const playEpisode = async () => {
  try {
    // console.dir(rl.LOCATIONS)
    // const agent = await rl.makeTrainedAgent('/models/model.json')
    // agent.reset()
    // for (;;) {
    //   const result = agent.step()
    //   console.dir(result)
    //   if (result.done) break
    // }
  } catch(error) {
    console.log(`ERROR: ${error.message}`)
  }
}

playEpisode()
