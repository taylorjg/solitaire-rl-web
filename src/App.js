import { HashRouter as Router, Switch, Route, Redirect } from "react-router-dom"
import Navigation from './Navigation'
import ManualPlayView from './ManualPlayView'
import AgentPlayView from './AgentPlayView'
import TrainingView from './TrainingView'
import Version from './Version'
import { ROUTES } from './routes'
import './App.css'

const App = () => {
  return (
    <Router>
      <div className="app-layout">
        <Navigation />
        <div className="app-layout-content">
          <Switch>
            <Route path={ROUTES.manualPlayView}>
              <ManualPlayView />
            </Route>
            <Route path={ROUTES.agentPlayView}>
              <AgentPlayView />
            </Route>
            <Route path={ROUTES.trainingView}>
              <TrainingView />
            </Route>
            <Route path={ROUTES.home}>
              <Redirect to={ROUTES.agentPlayView} />
            </Route>
          </Switch>
        </div>
        <Version />
      </div>
    </Router>
  )
}

export default App
