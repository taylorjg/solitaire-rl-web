import { NavLink } from 'react-router-dom'
import { ROUTES } from './routes'
import './Navigation.css'

const Navigation = () => {
  return (
    <div className="navigation">
      <ul>
        <li>
          <NavLink to={ROUTES.manualPlayView} activeClassName="navigation-link--active">Manual Play</NavLink>
        </li>
        <li>
          <NavLink to={ROUTES.agentPlayView} activeClassName="navigation-link--active">Agent Play</NavLink>
        </li>
        <li>
          <NavLink to={ROUTES.trainingView} activeClassName="navigation-link--active">Training</NavLink>
        </li>
      </ul>
    </div>
  )
}

export default Navigation
