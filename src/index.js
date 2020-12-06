import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'
import * as rl from './solitaire-rl/rl'
import * as tf from '@tensorflow/tfjs'

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
    await rl.play(() => tf.loadLayersModel('/models/model.json'))
  } catch(error) {
    console.log(`ERROR: ${error.message}`)
  }
}

playEpisode()
