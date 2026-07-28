import { NavLink } from 'react-router-dom'
import { ROUTES } from '@app/routes'
import './Navigation.css'

const navLinkClassName = ({ isActive }) =>
  isActive ? 'navigation-link--active' : undefined

const Navigation = () => {
  return (
    <div className="navigation">
      <ul>
        <li>
          <NavLink to={ROUTES.manualPlayView} className={navLinkClassName}>Manual Play</NavLink>
        </li>
        <li>
          <NavLink to={ROUTES.agentPlayView} className={navLinkClassName}>Agent Play</NavLink>
        </li>
        <li>
          <NavLink to={ROUTES.trainingView} className={navLinkClassName}>Training</NavLink>
        </li>
      </ul>
    </div>
  )
}

export default Navigation
