import { NavLink } from "react-router-dom"
import './Navigation.css'

const Navigation = () => {
  return (
    <div className="navigation">
      <div className="navigation-inner">
        <ul>
          <li>
            <NavLink to="/play" activeClassName="navigation-link--selected">Play</NavLink>
          </li>
          <li>
            <NavLink to="/train" activeClassName="navigation-link--selected">Train</NavLink>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Navigation;
