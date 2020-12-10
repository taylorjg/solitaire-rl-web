import { NavLink } from "react-router-dom"
import './Navigation.css'

const Navigation = () => {
  return (
    <div className="navigation">
      <ul>
        <li>
          <NavLink to="/play" activeClassName="navigation-link--selected">Play</NavLink>
        </li>
        <li>
          <NavLink to="/train" activeClassName="navigation-link--selected">Train</NavLink>
        </li>
      </ul>
    </div>
  )
}

export default Navigation;
