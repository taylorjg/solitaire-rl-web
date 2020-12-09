import { BrowserRouter as Router, Switch, Route } from "react-router-dom"
import Navigation from './Navigation'
import PlayView from './PlayView'
import TrainView from './TrainView'
import Version from './Version'
import './App.css'

const App = () => {
  return (
    <Router>
      <Navigation />
      <Switch>
        <Route exact path={['/', '/play']}>
          <PlayView />
        </Route>
        <Route exact path="/train">
          <TrainView />
        </Route>
      </Switch>
      <Version />
    </Router>
  )
}

export default App
