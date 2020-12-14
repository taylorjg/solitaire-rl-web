import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom"
import Navigation from './Navigation'
import ManualPlayView from './ManualPlayView'
import AgentPlayView from './AgentPlayView'
import TrainView from './TrainView'
import Version from './Version'
import { ROUTES } from './routes'
import './App.css'

const App = () => {
  return (
    <Router>
      <Navigation />
      <Switch>
        <Route path={ROUTES.manualPlayView}>
          <ManualPlayView />
        </Route>
        <Route path={ROUTES.agentPlayView}>
          <AgentPlayView />
        </Route>
        <Route path={ROUTES.trainView}>
          <TrainView />
        </Route>
        <Route path={ROUTES.home}>
          <Redirect to={ROUTES.agentPlayView} />
        </Route>
      </Switch>
      <Version />
    </Router>
  )
}

export default App
